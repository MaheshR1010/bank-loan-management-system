from sqlalchemy.orm import Session

from app.engines.repayment_engine import generate_repayment_schedule
from app.models.loan_account import LoanAccount
from app.models.repayment import Repayment


def generate_and_save_schedule(
    db: Session,
    loan_account: LoanAccount,
):
    schedule = generate_repayment_schedule(
        principal=loan_account.principal_amount,
        annual_interest_rate=loan_account.annual_interest_rate,
        tenure_months=loan_account.tenure_months,
        start_date=loan_account.disbursement_date,
    )

    repayments = []

    for installment in schedule:
        repayment = Repayment(
            loan_account_id=loan_account.id,
            installment_number=installment["installment_number"],
            due_date=installment["due_date"],
            amount_due=installment["amount_due"],
            principal_component=installment["principal_component"],
            interest_component=installment["interest_component"],
            amount_paid=0,
            status="pending",
        )

        db.add(repayment)
        repayments.append(repayment)

    db.commit()

    for repayment in repayments:
        db.refresh(repayment)

    return repayments