from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Repayment(Base):
    __tablename__ = "repayments"

    __table_args__ = (
        UniqueConstraint(
            "loan_account_id",
            "installment_number",
            name="uq_repayment_loan_installment",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    loan_account_id: Mapped[int] = mapped_column(
        ForeignKey("loan_accounts.id"),
        nullable=False,
    )

    installment_number: Mapped[int] = mapped_column(
        nullable=False,
    )

    due_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    amount_due: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    principal_component: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    interest_component: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    amount_paid: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
        default=0,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="pending",
    )

    paid_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    loan_account = relationship(
        "LoanAccount",
        backref="repayments",
    )