from decimal import Decimal


def calculate_emi(
    principal: Decimal,
    annual_interest_rate: Decimal,
    tenure_months: int,
) -> Decimal:
    """
    Calculate monthly EMI using the standard reducing-balance formula.
    """

    if principal <= 0:
        raise ValueError("Principal amount must be greater than zero")

    if annual_interest_rate < 0:
        raise ValueError("Interest rate cannot be negative")

    if tenure_months <= 0:
        raise ValueError("Tenure must be greater than zero")

    monthly_rate = annual_interest_rate / Decimal("1200")

    if monthly_rate == 0:
        emi = principal / Decimal(tenure_months)
    else:
        emi = (
            principal
            * monthly_rate
            * (1 + monthly_rate) ** tenure_months
            / ((1 + monthly_rate) ** tenure_months - 1)
        )

    return emi.quantize(Decimal("0.01"))