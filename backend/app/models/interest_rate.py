from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class InterestRate(Base):
    __tablename__ = "interest_rates"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    loan_product_id: Mapped[int] = mapped_column(
        ForeignKey("loan_products.id"),
        nullable=False,
    )

    annual_rate: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )

    effective_from: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    effective_to: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    loan_product = relationship(
        "LoanProduct",
        backref="interest_rates",
    )