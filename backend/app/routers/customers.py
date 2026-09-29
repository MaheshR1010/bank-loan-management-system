from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.database import get_db
from app.models.customer import Customer
from app.models.user import User
from app.schemas.customer import (
    CustomerCreate,
    CustomerResponse,
)


router = APIRouter(
    prefix="/customers",
    tags=["Customers"],
)


@router.post(
    "/",
    response_model=CustomerResponse,
)
def create_customer(
    customer_data: CustomerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing_customer = (
        db.query(Customer)
        .filter(Customer.user_id == current_user.id)
        .first()
    )

    if existing_customer is not None:
        raise HTTPException(
            status_code=400,
            detail="Customer profile already exists for this user",
        )

    customer = Customer(
        user_id=current_user.id,
        date_of_birth=customer_data.date_of_birth,
        phone_number=customer_data.phone_number,
        address=customer_data.address,
        city=customer_data.city,
        state=customer_data.state,
        pincode=customer_data.pincode,
    )

    db.add(customer)
    db.commit()
    db.refresh(customer)

    return customer


@router.get(
    "/me",
    response_model=CustomerResponse,
)
def get_my_customer_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    customer = (
        db.query(Customer)
        .filter(Customer.user_id == current_user.id)
        .first()
    )

    if customer is None:
        raise HTTPException(
            status_code=404,
            detail="Customer profile not found",
        )

    return customer