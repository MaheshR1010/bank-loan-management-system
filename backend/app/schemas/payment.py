from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class PaymentCreate(BaseModel):
    repayment_id: int
    loan_account_id: int
    amount: Decimal
    payment_date: date
    payment_method: str
    reference_number: str


class PaymentResponse(BaseModel):
    id: int
    repayment_id: int
    loan_account_id: int
    amount: Decimal
    payment_date: date
    payment_method: str
    reference_number: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)