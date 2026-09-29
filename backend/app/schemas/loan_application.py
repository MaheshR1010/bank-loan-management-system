from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class LoanApplicationCreate(BaseModel):
    customer_id: int
    loan_product_id: int
    requested_amount: Decimal
    requested_tenure_months: int
    purpose: str | None = None


class LoanApplicationResponse(BaseModel):
    id: int
    application_number: str
    customer_id: int
    loan_product_id: int
    requested_amount: Decimal
    requested_tenure_months: int
    purpose: str | None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)