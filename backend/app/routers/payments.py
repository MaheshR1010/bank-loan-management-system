from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.auth import require_customer, require_reviewer
from app.db.database import get_db
from app.models.customer import Customer
from app.models.loan_account import LoanAccount
from app.models.loan_application import LoanApplication
from app.models.payment import Payment
from app.models.repayment import Repayment
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentResponse


router = APIRouter(
    prefix="/payments",
    tags=["Payments"],
)


@router.post(
    "/",
    response_model=PaymentResponse,
)
def create_payment(
    payment_data: PaymentCreate,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db),
):
    # ---------------------------------------------------------
    # 1. Find the repayment selected by the customer
    # ---------------------------------------------------------
    repayment = (
        db.query(Repayment)
        .filter(
            Repayment.id == payment_data.repayment_id
        )
        .first()
    )

    if repayment is None:
        raise HTTPException(
            status_code=404,
            detail="Repayment not found",
        )

    # ---------------------------------------------------------
    # 2. Find the loan account
    # ---------------------------------------------------------
    loan_account = (
        db.query(LoanAccount)
        .filter(
            LoanAccount.id == payment_data.loan_account_id
        )
        .first()
    )

    if loan_account is None:
        raise HTTPException(
            status_code=404,
            detail="Loan account not found",
        )

    # ---------------------------------------------------------
    # 3. Verify repayment belongs to this loan account
    # ---------------------------------------------------------
    if repayment.loan_account_id != loan_account.id:
        raise HTTPException(
            status_code=400,
            detail="Repayment does not belong to this loan account",
        )

    # ---------------------------------------------------------
    # 4. Customer ownership/security check
    # ---------------------------------------------------------
    customer = loan_account.application.customer

    if customer.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only make payments for your own loan account",
        )

    # ---------------------------------------------------------
    # 5. Validate payment amount
    # ---------------------------------------------------------
    if payment_data.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Payment amount must be greater than zero",
        )

    # ---------------------------------------------------------
    # 6. Lock all unpaid/partial installments for this loan
    #
    #    We start from the earliest outstanding installment.
    # ---------------------------------------------------------
    repayments = (
        db.query(Repayment)
        .filter(
            Repayment.loan_account_id == loan_account.id,
            Repayment.status != "paid",
        )
        .order_by(
            Repayment.installment_number.asc()
        )
        .with_for_update()
        .all()
    )

    if not repayments:
        raise HTTPException(
            status_code=400,
            detail="No remaining repayment amount available",
        )

    # ---------------------------------------------------------
    # 7. Find the FIRST installment with an outstanding balance
    # ---------------------------------------------------------
    first_outstanding_repayment = None

    for item in repayments:
        item_remaining = (
            item.amount_due - item.amount_paid
        ).quantize(Decimal("0.01"))

        if item_remaining > Decimal("0.00"):
            first_outstanding_repayment = item
            break

    if first_outstanding_repayment is None:
        raise HTTPException(
            status_code=400,
            detail="No remaining repayment amount available",
        )

    # ---------------------------------------------------------
    # 8. PREVENT EMI SKIPPING
    # ---------------------------------------------------------
    if repayment.id != first_outstanding_repayment.id:
        raise HTTPException(
            status_code=400,
            detail=(
                "Previous installment has an outstanding balance. "
                "Please complete it before paying this installment."
            ),
        )

    # ---------------------------------------------------------
    # 9. Payment allocation starts from the unlocked installment
    #    and can move forward sequentially.
    # ---------------------------------------------------------
    repayments = [
        item
        for item in repayments
        if item.installment_number
        >= first_outstanding_repayment.installment_number
    ]

    # ---------------------------------------------------------
    # 10. Calculate total remaining amount
    # ---------------------------------------------------------
    total_remaining = Decimal("0.00")

    for item in repayments:
        item_remaining = (
            item.amount_due - item.amount_paid
        ).quantize(Decimal("0.01"))

        if item_remaining > Decimal("0.00"):
            total_remaining += item_remaining

    total_remaining = total_remaining.quantize(
        Decimal("0.01")
    )

    # ---------------------------------------------------------
    # 11. Prevent overpayment beyond the remaining schedule
    # ---------------------------------------------------------
    if payment_data.amount > total_remaining:
        raise HTTPException(
            status_code=400,
            detail=(
                "Payment amount cannot exceed the total "
                "remaining repayment amount"
            ),
        )

    remaining_payment = payment_data.amount.quantize(
        Decimal("0.01")
    )

    try:
        # -----------------------------------------------------
        # 12. Allocate payment sequentially
        # -----------------------------------------------------
        for item in repayments:
            if remaining_payment <= Decimal("0.00"):
                break

            previous_amount_paid = item.amount_paid.quantize(
                Decimal("0.01")
            )

            installment_remaining = (
                item.amount_due - previous_amount_paid
            ).quantize(Decimal("0.01"))

            if installment_remaining <= Decimal("0.00"):
                continue

            # Amount that can be applied to this installment
            allocation = min(
                remaining_payment,
                installment_remaining,
            ).quantize(Decimal("0.01"))

            new_amount_paid = (
                previous_amount_paid + allocation
            ).quantize(Decimal("0.01"))

            # -------------------------------------------------
            # Calculate principal already paid before this
            # payment.
            #
            # Existing project logic:
            # interest is covered first, then principal.
            # -------------------------------------------------
            previous_principal_paid = max(
                Decimal("0.00"),
                previous_amount_paid - item.interest_component,
            )

            previous_principal_paid = min(
                previous_principal_paid,
                item.principal_component,
            ).quantize(Decimal("0.01"))

            # -------------------------------------------------
            # Calculate total principal paid after this
            # allocation.
            # -------------------------------------------------
            total_principal_paid = max(
                Decimal("0.00"),
                new_amount_paid - item.interest_component,
            )

            total_principal_paid = min(
                total_principal_paid,
                item.principal_component,
            ).quantize(Decimal("0.01"))

            # Only newly covered principal reduces the
            # outstanding principal.
            new_principal_paid = (
                total_principal_paid
                - previous_principal_paid
            ).quantize(Decimal("0.01"))

            # -------------------------------------------------
            # Update repayment
            # -------------------------------------------------
            item.amount_paid = new_amount_paid

            if item.amount_paid >= item.amount_due:
                # Fully paid installment
                item.amount_paid = item.amount_due
                item.status = "paid"
                item.paid_date = payment_data.payment_date
            else:
                # Partially paid installment
                item.status = "partial"

            # -------------------------------------------------
            # Reduce outstanding principal
            # -------------------------------------------------
            loan_account.outstanding_principal = (
                loan_account.outstanding_principal
                - new_principal_paid
            ).quantize(Decimal("0.01"))

            if (
                loan_account.outstanding_principal
                < Decimal("0.00")
            ):
                loan_account.outstanding_principal = Decimal(
                    "0.00"
                )

            # Reduce remaining payment amount
            remaining_payment = (
                remaining_payment - allocation
            ).quantize(Decimal("0.01"))

        # -----------------------------------------------------
        # 13. Safety check
        # -----------------------------------------------------
        if remaining_payment > Decimal("0.00"):
            raise HTTPException(
                status_code=400,
                detail="Unable to allocate the complete payment amount",
            )

              # -----------------------------------------------------
        # 14. Automatically close the loan account when
        #     every repayment installment is fully paid.
        #
        #     A partial installment keeps the account active.
        #
        #     Flush repayment status changes first so the
        #     closure check always uses the latest transaction
        #     state.
        # -----------------------------------------------------
        db.flush()

        remaining_repayments = (
            db.query(Repayment)
            .filter(
                Repayment.loan_account_id == loan_account.id,
                Repayment.status != "paid",
            )
            .count()
        )

        if remaining_repayments == 0:
            loan_account.outstanding_principal = Decimal("0.00")
            loan_account.status = "closed"

        # -----------------------------------------------------
        # 15. Create payment history record
        #
        #     The payment record keeps the original selected
        #     repayment ID, preserving the existing schema.
        # -----------------------------------------------------
        payment = Payment(
            repayment_id=payment_data.repayment_id,
            loan_account_id=payment_data.loan_account_id,
            amount=payment_data.amount,
            payment_date=payment_data.payment_date,
            payment_method=payment_data.payment_method,
            reference_number=payment_data.reference_number,
            status="successful",
        )

        db.add(payment)

        # -----------------------------------------------------
        # 16. Commit everything atomically
        # -----------------------------------------------------
        db.commit()

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="Reference number already exists",
        )

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise

    # ---------------------------------------------------------
    # 17. Refresh payment record
    # ---------------------------------------------------------
    db.refresh(payment)

    return payment


@router.get(
    "/my",
    response_model=list[PaymentResponse],
)
def get_my_payments(
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db),
):
    customer = (
        db.query(Customer)
        .filter(
            Customer.user_id == current_user.id
        )
        .first()
    )

    if customer is None:
        raise HTTPException(
            status_code=404,
            detail="Customer profile not found",
        )

    payments = (
        db.query(Payment)
        .join(
            LoanAccount,
            Payment.loan_account_id == LoanAccount.id,
        )
        .join(
            LoanApplication,
            LoanAccount.application_id == LoanApplication.id,
        )
        .filter(
            LoanApplication.customer_id == customer.id
        )
        .order_by(
            Payment.payment_date.desc(),
            Payment.id.desc(),
        )
        .all()
    )

    return payments


@router.get(
    "/",
    response_model=list[PaymentResponse]
)
def get_all_payments(
    current_user: User = Depends(require_reviewer),
    db: Session = Depends(get_db)
):
    payments = (
        db.query(Payment)
        .order_by(
            Payment.payment_date.desc(),
            Payment.id.desc(),
        )
        .all()
    )

    return payments