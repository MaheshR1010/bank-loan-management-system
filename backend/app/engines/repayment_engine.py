import calendar
from datetime import date
from decimal import Decimal

def add_months(source_date: date, months: int) -> date:
    month_index = source_date.month - 1 + months
    year = source_date.year + month_index // 12
    month = month_index % 12 + 1

    day = min(
        source_date.day,
        calendar.monthrange(year, month)[1],
    )

    return date(year, month, day)

def generate_repayment_schedule(
    principal: Decimal,
    annual_interest_rate: Decimal,
    tenure_months: int,
    start_date: date,
):
    """
    Generate a monthly repayment schedule using
    the reducing-balance EMI method.
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
        factor = (1 + monthly_rate) ** tenure_months

        emi = (
            principal
            * monthly_rate
            * factor
            / (factor - 1)
        )

    emi = emi.quantize(Decimal("0.01"))

    balance = principal
    schedule = []

    for installment_number in range(1, tenure_months + 1):
        interest = (
            balance * monthly_rate
        ).quantize(Decimal("0.01"))

        principal_component = (
            emi - interest
        ).quantize(Decimal("0.01"))

        if installment_number == tenure_months:
            principal_component = balance
            installment_amount = (
                principal_component + interest
            ).quantize(Decimal("0.01"))
        else:
            installment_amount = emi

        balance = (
            balance - principal_component
        ).quantize(Decimal("0.01"))

        schedule.append(
            {
                "installment_number": installment_number,
                "due_date": add_months(start_date, installment_number - 1),
                "amount_due": installment_amount,
                "principal_component": principal_component,
                "interest_component": interest,
                "remaining_balance": balance,
            }
        )

    return schedule