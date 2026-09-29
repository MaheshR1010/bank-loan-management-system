from datetime import datetime

from pydantic import BaseModel, ConfigDict


class LoanApprovalCreate(BaseModel):
    application_id: int
    decision: str
    remarks: str | None = None


class LoanApprovalResponse(BaseModel):
    id: int
    application_id: int
    reviewer_id: int
    decision: str
    remarks: str | None
    decided_at: datetime

    model_config = ConfigDict(from_attributes=True)