from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class InterestRateCreate(BaseModel):
    loan_product_id: int
    annual_rate: Decimal
    effective_from: date
    effective_to: date | None = None


class InterestRateResponse(BaseModel):
    id: int
    loan_product_id: int
    annual_rate: Decimal
    effective_from: date
    effective_to: date | None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)