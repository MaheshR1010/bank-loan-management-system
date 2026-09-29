from datetime import date
from decimal import Decimal

from app.engines.repayment_engine import generate_repayment_schedule


def create_repayment_schedule(
    principal: Decimal,
    annual_interest_rate: Decimal,
    tenure_months: int,
    start_date: date,
):
    """
    Service layer for generating a loan repayment schedule.
    """

    return generate_repayment_schedule(
        principal=principal,
        annual_interest_rate=annual_interest_rate,
        tenure_months=tenure_months,
        start_date=start_date,
    )