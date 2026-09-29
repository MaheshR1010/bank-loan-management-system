from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class LoanAccount(Base):
    __tablename__ = "loan_accounts"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    account_number: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
    )

    application_id: Mapped[int] = mapped_column(
        ForeignKey("loan_applications.id"),
        unique=True,
        nullable=False,
    )

    principal_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    annual_interest_rate: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )

    tenure_months: Mapped[int] = mapped_column(
        nullable=False,
    )

    outstanding_principal: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="active",
    )

    disbursement_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    maturity_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    application = relationship(
        "LoanApplication",
        backref="loan_account",
    )
    