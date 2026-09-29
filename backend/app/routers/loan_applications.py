from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import require_customer, require_reviewer
from app.db.database import get_db
from app.models.customer import Customer
from app.models.loan_application import LoanApplication
from app.models.loan_product import LoanProduct
from app.models.user import User
from app.schemas.loan_application import (
    LoanApplicationCreate,
    LoanApplicationResponse,
)


router = APIRouter(
    prefix="/loan-applications",
    tags=["Loan Applications"],
)


@router.post(
    "/",
    response_model=LoanApplicationResponse,
)
def create_loan_application(
    application_data: LoanApplicationCreate,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db),
):
    customer = (
        db.query(Customer)
        .filter(
            Customer.id == application_data.customer_id,
            Customer.user_id == current_user.id,
        )
        .first()
    )

    if customer is None:
        raise HTTPException(
            status_code=403,
            detail="You can only create loan applications for your own customer account",
        )

    loan_product = (
        db.query(LoanProduct)
        .filter(
            LoanProduct.id == application_data.loan_product_id
        )
        .first()
    )

    if loan_product is None:
        raise HTTPException(
            status_code=404,
            detail="Loan product not found",
        )

    if not loan_product.is_active:
        raise HTTPException(
            status_code=400,
            detail="Loan product is not active",
        )

    if (
        application_data.requested_amount
        < loan_product.min_loan_amount
        or application_data.requested_amount
        > loan_product.max_loan_amount
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Requested amount must be between "
                f"{loan_product.min_loan_amount} and "
                f"{loan_product.max_loan_amount}"
            ),
        )

    if (
        application_data.requested_tenure_months
        < loan_product.min_tenure_months
        or application_data.requested_tenure_months
        > loan_product.max_tenure_months
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Requested tenure must be between "
                f"{loan_product.min_tenure_months} and "
                f"{loan_product.max_tenure_months} months"
            ),
        )

    application_number = f"LA-{uuid4().hex[:8].upper()}"

    application = LoanApplication(
        application_number=application_number,
        customer_id=customer.id,
        loan_product_id=loan_product.id,
        requested_amount=application_data.requested_amount,
        requested_tenure_months=application_data.requested_tenure_months,
        purpose=application_data.purpose,
        status="submitted",
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    return application


@router.get(
    "/my",
    response_model=list[LoanApplicationResponse],
)
def get_my_loan_applications(
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

    applications = (
        db.query(LoanApplication)
        .filter(
            LoanApplication.customer_id == customer.id
        )
        .order_by(
            LoanApplication.created_at.desc()
        )
        .all()
    )

    return applications


@router.get(
    "/",
    response_model=list[LoanApplicationResponse],
)
def get_all_loan_applications(
    current_user: User = Depends(require_reviewer),
    db: Session = Depends(get_db),
):
    applications = (
        db.query(LoanApplication)
        .order_by(
            LoanApplication.created_at.desc()
        )
        .all()
    )

    return applications