from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class LoanProductCreate(BaseModel):
    product_code: str
    product_name: str
    description: str | None = None
    min_loan_amount: Decimal
    max_loan_amount: Decimal
    min_tenure_months: int
    max_tenure_months: int
    base_interest_rate: Decimal


class LoanProductResponse(BaseModel):
    id: int
    product_code: str
    product_name: str
    description: str | None
    min_loan_amount: Decimal
    max_loan_amount: Decimal
    min_tenure_months: int
    max_tenure_months: int
    base_interest_rate: Decimal
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)