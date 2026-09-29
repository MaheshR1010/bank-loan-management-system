from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class LoanAccountCreate(BaseModel):
    application_id: int
    disbursement_date: date


class LoanAccountResponse(BaseModel):
    id: int
    account_number: str
    application_id: int
    principal_amount: Decimal
    annual_interest_rate: Decimal
    tenure_months: int
    outstanding_principal: Decimal
    status: str
    disbursement_date: date | None
    maturity_date: date | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)