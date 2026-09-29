from datetime import date
from decimal import Decimal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.auth import require_customer, require_reviewer
from app.db.database import get_db
from app.engines.repayment_engine import add_months
from app.models.customer import Customer
from app.models.interest_rate import InterestRate
from app.models.loan_account import LoanAccount
from app.models.loan_application import LoanApplication
from app.models.user import User
from app.schemas.loan_account import (
    LoanAccountCreate,
    LoanAccountResponse,
)
from app.services.emi_service import calculate_loan_emi
from app.services.loan_schedule_service import generate_and_save_schedule


router = APIRouter(
    prefix="/loan-accounts",
    tags=["Loan Accounts"],
)


@router.post(
    "/",
    response_model=LoanAccountResponse,
)
def create_loan_account(
    account_data: LoanAccountCreate,
    current_user: User = Depends(require_reviewer),
    db: Session = Depends(get_db),
):
    # Find the loan application
    application = (
        db.query(LoanApplication)
        .filter(
            LoanApplication.id == account_data.application_id
        )
        .first()
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Loan application not found",
        )

    # Only approved applications can become loan accounts
    if application.status != "approved":
        raise HTTPException(
            status_code=400,
            detail="Loan account can only be created for an approved application",
        )

    # Prevent duplicate loan accounts
    existing_account = (
        db.query(LoanAccount)
        .filter(
            LoanAccount.application_id
            == account_data.application_id
        )
        .first()
    )

    if existing_account is not None:
        raise HTTPException(
            status_code=400,
            detail="Loan account already exists for this application",
        )

    # Find the applicable active interest rate
    interest_rate = (
        db.query(InterestRate)
        .filter(
            InterestRate.loan_product_id
            == application.loan_product_id,
            InterestRate.is_active.is_(True),
            InterestRate.effective_from
            <= account_data.disbursement_date,
        )
        .order_by(
            InterestRate.effective_from.desc()
        )
        .first()
    )

    if interest_rate is None:
        raise HTTPException(
            status_code=400,
            detail="No active interest rate is available for this loan product",
        )

    # Financial values come from the approved application/rate
    principal_amount = application.requested_amount
    tenure_months = application.requested_tenure_months
    annual_interest_rate = interest_rate.annual_rate

    # Calculate maturity date from disbursement date + tenure
    maturity_date = add_months(
        account_data.disbursement_date,
        tenure_months,
    )

    # Generate unique loan account number
    account_number = f"LA-{uuid4().hex[:10].upper()}"

    # Create loan account
    account = LoanAccount(
        account_number=account_number,
        application_id=application.id,
        principal_amount=principal_amount,
        annual_interest_rate=annual_interest_rate,
        tenure_months=tenure_months,
        outstanding_principal=principal_amount,
        status="active",
        disbursement_date=account_data.disbursement_date,
        maturity_date=maturity_date,
    )

    db.add(account)
    db.commit()
    db.refresh(account)

    # Automatically generate the repayment schedule
    generate_and_save_schedule(
        db=db,
        loan_account=account,
    )

    return account


@router.get(
    "/my",
    response_model=list[LoanAccountResponse],
)
def get_my_loan_accounts(
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

    accounts = (
        db.query(LoanAccount)
        .join(
            LoanApplication,
            LoanAccount.application_id == LoanApplication.id,
        )
        .filter(
            LoanApplication.customer_id == customer.id
        )
        .order_by(
            LoanAccount.created_at.desc()
        )
        .all()
    )

    return accounts


@router.get(
    "/calculate-emi",
)
def calculate_loan_emi_endpoint(
    principal: Decimal = Query(..., gt=0),
    annual_interest_rate: Decimal = Query(..., ge=0),
    tenure_months: int = Query(..., gt=0),
):
    emi = calculate_loan_emi(
        principal=principal,
        annual_interest_rate=annual_interest_rate,
        tenure_months=tenure_months,
    )

    total_payment = (
        emi * Decimal(tenure_months)
    ).quantize(Decimal("0.01"))

    total_interest = (
        total_payment - principal
    ).quantize(Decimal("0.01"))

    return {
        "principal": principal,
        "annual_interest_rate": annual_interest_rate,
        "tenure_months": tenure_months,
        "monthly_emi": emi,
        "total_payment": total_payment,
        "total_interest": total_interest,
    }


@router.get(
    "/repayment-schedule",
)
def get_repayment_schedule(
    principal: Decimal = Query(..., gt=0),
    annual_interest_rate: Decimal = Query(..., ge=0),
    tenure_months: int = Query(..., gt=0),
    start_date: date = Query(...),
):
    from app.services.repayment_service import create_repayment_schedule

    schedule = create_repayment_schedule(
        principal=principal,
        annual_interest_rate=annual_interest_rate,
        tenure_months=tenure_months,
        start_date=start_date,
    )

    return {
        "principal": principal,
        "annual_interest_rate": annual_interest_rate,
        "tenure_months": tenure_months,
        "start_date": start_date,
        "schedule": schedule,
    }
@router.get(
    "/",
    response_model=list[LoanAccountResponse],
)
def get_all_loan_accounts(
    current_user: User = Depends(require_reviewer),
    db: Session = Depends(get_db),
):
    accounts = (
        db.query(LoanAccount)
        .order_by(
            LoanAccount.created_at.desc()
        )
        .all()
    )

    return accounts