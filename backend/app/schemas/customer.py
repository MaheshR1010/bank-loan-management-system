from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class CustomerCreate(BaseModel):
    date_of_birth: date | None = None
    phone_number: str
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None


class CustomerResponse(BaseModel):
    id: int
    user_id: int
    date_of_birth: date | None
    phone_number: str
    address: str | None
    city: str | None
    state: str | None
    pincode: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)