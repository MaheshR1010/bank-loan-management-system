from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import require_reviewer
from app.db.database import get_db
from app.models.loan_approval import LoanApproval
from app.models.loan_application import LoanApplication
from app.models.user import User
from app.schemas.loan_approval import (
    LoanApprovalCreate,
    LoanApprovalResponse,
)

router = APIRouter(
    prefix="/loan-approvals",
    tags=["Loan Approvals"],
)


@router.post(
    "/",
    response_model=LoanApprovalResponse,
)
def create_loan_approval(
    approval_data: LoanApprovalCreate,
    current_user: User = Depends(require_reviewer),
    db: Session = Depends(get_db),
):
    application = (
        db.query(LoanApplication)
        .filter(LoanApplication.id == approval_data.application_id)
        .first()
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Loan application not found",
        )

    if application.status != "submitted":
        raise HTTPException(
            status_code=400,
            detail="Only submitted loan applications can be reviewed",
        )

    if approval_data.decision not in {"approved", "rejected"}:
        raise HTTPException(
            status_code=400,
            detail="Decision must be approved or rejected",
        )

    approval = LoanApproval(
        application_id=application.id,
        reviewer_id=current_user.id,
        decision=approval_data.decision,
        remarks=approval_data.remarks,
    )

    application.status = approval_data.decision

    db.add(approval)
    db.commit()
    db.refresh(approval)

    return approval