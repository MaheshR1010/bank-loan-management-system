from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import require_admin
from app.db.database import get_db
from app.models.interest_rate import InterestRate
from app.models.user import User
from app.schemas.interest_rate import InterestRateCreate, InterestRateResponse

router = APIRouter(
    prefix="/interest-rates",
    tags=["Interest Rates"],
)


@router.post("/", response_model=InterestRateResponse)
def create_interest_rate(
    rate_data: InterestRateCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    interest_rate = InterestRate(
        loan_product_id=rate_data.loan_product_id,
        annual_rate=rate_data.annual_rate,
        effective_from=rate_data.effective_from,
        effective_to=rate_data.effective_to,
        is_active=True,
    )

    db.add(interest_rate)
    db.commit()
    db.refresh(interest_rate)

    return interest_rate


@router.get("/", response_model=list[InterestRateResponse])
def get_all_interest_rates(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    interest_rates = (
        db.query(InterestRate)
        .order_by(InterestRate.effective_from.desc())
        .all()
    )

    return interest_rates