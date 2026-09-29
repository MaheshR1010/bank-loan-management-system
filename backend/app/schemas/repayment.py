from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class RepaymentCreate(BaseModel):
    loan_account_id: int
    installment_number: int
    due_date: date
    amount_due: Decimal
    principal_component: Decimal
    interest_component: Decimal


class RepaymentResponse(BaseModel):
    id: int
    loan_account_id: int
    installment_number: int
    due_date: date
    amount_due: Decimal
    principal_component: Decimal
    interest_component: Decimal
    amount_paid: Decimal
    status: str
    paid_date: date | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)