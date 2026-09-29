from decimal import Decimal

from app.engines.emi_engine import calculate_emi


def calculate_loan_emi(
    principal: Decimal,
    annual_interest_rate: Decimal,
    tenure_months: int,
) -> Decimal:
    """
    Service layer for loan EMI calculation.
    """

    return calculate_emi(
        principal=principal,
        annual_interest_rate=annual_interest_rate,
        tenure_months=tenure_months,
    )
