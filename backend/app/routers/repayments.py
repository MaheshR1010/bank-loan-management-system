from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import require_customer, require_reviewer
from app.db.database import get_db
from app.models.customer import Customer
from app.models.loan_account import LoanAccount
from app.models.loan_application import LoanApplication
from app.models.repayment import Repayment
from app.models.user import User
from app.schemas.repayment import (
    RepaymentCreate,
    RepaymentResponse,
)
from app.services.loan_schedule_service import generate_and_save_schedule


router = APIRouter(
    prefix="/repayments",
    tags=["Repayments"],
)


# ---------------------------------------------------------
# CREATE REPAYMENT
# Reviewer/Admin only
# ---------------------------------------------------------

@router.post(
    "/",
    response_model=RepaymentResponse,
)
def create_repayment(
    repayment_data: RepaymentCreate,
    current_user: User = Depends(require_reviewer),
    db: Session = Depends(get_db),
):
    loan_account = (
        db.query(LoanAccount)
        .filter(
            LoanAccount.id == repayment_data.loan_account_id
        )
        .first()
    )

    if loan_account is None:
        raise HTTPException(
            status_code=404,
            detail="Loan account not found",
        )

    repayment = Repayment(
        loan_account_id=repayment_data.loan_account_id,
        installment_number=repayment_data.installment_number,
        due_date=repayment_data.due_date,
        amount_due=repayment_data.amount_due,
        principal_component=repayment_data.principal_component,
        interest_component=repayment_data.interest_component,
        amount_paid=0,
        status="pending",
    )

    db.add(repayment)
    db.commit()
    db.refresh(repayment)

    return repayment


# ---------------------------------------------------------
# GENERATE REPAYMENT SCHEDULE
# Reviewer/Admin only
# ---------------------------------------------------------

@router.post(
    "/generate/{loan_account_id}",
)
def generate_repayment_schedule_for_account(
    loan_account_id: int,
    current_user: User = Depends(require_reviewer),
    db: Session = Depends(get_db),
):
    loan_account = (
        db.query(LoanAccount)
        .filter(
            LoanAccount.id == loan_account_id
        )
        .first()
    )

    if loan_account is None:
        raise HTTPException(
            status_code=404,
            detail="Loan account not found",
        )

    if loan_account.status != "active":
        raise HTTPException(
            status_code=400,
            detail="Repayment schedule can only be generated for an active loan account",
        )

    existing_count = (
        db.query(Repayment)
        .filter(
            Repayment.loan_account_id == loan_account_id
        )
        .count()
    )

    if existing_count > 0:
        raise HTTPException(
            status_code=400,
            detail="Repayment schedule already exists for this loan account",
        )

    if loan_account.disbursement_date is None:
        raise HTTPException(
            status_code=400,
            detail="Loan account does not have a disbursement date",
        )

    repayments = generate_and_save_schedule(
        db=db,
        loan_account=loan_account,
    )

    return {
        "message": "Repayment schedule generated successfully",
        "loan_account_id": loan_account_id,
        "installment_count": len(repayments),
    }


# ---------------------------------------------------------
# GET ALL REPAYMENTS
# Reviewer/Admin only
# ---------------------------------------------------------

@router.get(
    "/",
    response_model=list[RepaymentResponse],
)
def get_all_repayments(
    current_user: User = Depends(require_reviewer),
    db: Session = Depends(get_db),
):
    repayments = (
        db.query(Repayment)
        .order_by(
            Repayment.loan_account_id.asc(),
            Repayment.installment_number.asc(),
        )
        .all()
    )

    return repayments


# ---------------------------------------------------------
# GET CURRENT CUSTOMER'S REPAYMENTS
# Customer only
# ---------------------------------------------------------

@router.get(
    "/my",
    response_model=list[RepaymentResponse],
)
def get_my_repayments(
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

    repayments = (
        db.query(Repayment)
        .join(
            LoanAccount,
            Repayment.loan_account_id == LoanAccount.id,
        )
        .join(
            LoanApplication,
            LoanAccount.application_id == LoanApplication.id,
        )
        .filter(
            LoanApplication.customer_id == customer.id
        )
        .order_by(
            LoanAccount.id.asc(),
            Repayment.installment_number.asc(),
        )
        .all()
    )

    return repayments