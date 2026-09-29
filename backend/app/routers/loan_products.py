from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import get_current_user, require_admin
from app.db.database import get_db
from app.models.loan_product import LoanProduct
from app.models.user import User
from app.schemas.loan_product import (
    LoanProductCreate,
    LoanProductResponse,
)


router = APIRouter(
    prefix="/loan-products",
    tags=["Loan Products"],
)


# Only admins can create loan products
@router.post(
    "/",
    response_model=LoanProductResponse,
)
def create_loan_product(
    product_data: LoanProductCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    product = LoanProduct(
        product_code=product_data.product_code,
        product_name=product_data.product_name,
        description=product_data.description,
        min_loan_amount=product_data.min_loan_amount,
        max_loan_amount=product_data.max_loan_amount,
        min_tenure_months=product_data.min_tenure_months,
        max_tenure_months=product_data.max_tenure_months,
        base_interest_rate=product_data.base_interest_rate,
        is_active=True,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


# Authenticated users can view loan products
@router.get(
    "/",
    response_model=list[LoanProductResponse],
)
def get_all_loan_products(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    products = (
        db.query(LoanProduct)
        .filter(LoanProduct.is_active == True)
        .order_by(
            LoanProduct.created_at.desc()
        )
        .all()
    )

    return products