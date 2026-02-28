"""Payment model — 用户缴费记录."""

from __future__ import annotations

from typing import TYPE_CHECKING, Optional

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.activity import Activity
    from app.models.user import UserProfile


class Payment(TimestampMixin, Base):
    __tablename__ = "payments"

    id: Mapped[int] = Column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = Column(
        Integer, ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    activity_id: Mapped[int] = Column(
        Integer, ForeignKey("activities.id", ondelete="CASCADE"), nullable=False, index=True
    )
    activity_title: Mapped[str] = Column(String(200), nullable=False)
    amount: Mapped[float] = Column(Float, nullable=False, default=0.0)
    category: Mapped[str] = Column(String(50), nullable=False, default="")
    status: Mapped[str] = Column(String(20), nullable=False, default="unpaid")
    pay_date: Mapped[Optional[str]] = Column(String(20), nullable=True)
    cover_url: Mapped[Optional[str]] = Column(String(500), nullable=True)
    date_range: Mapped[Optional[str]] = Column(String(100), nullable=True)
    time_range: Mapped[Optional[str]] = Column(String(100), nullable=True)
    payer: Mapped[Optional[str]] = Column(String(100), nullable=True)
    order_no: Mapped[Optional[str]] = Column(String(50), nullable=True, unique=True)
    transaction_no: Mapped[Optional[str]] = Column(String(50), nullable=True, unique=True)
    payment_screenshot: Mapped[Optional[str]] = Column(String(500), nullable=True)

    user: Mapped["UserProfile"] = relationship("UserProfile", backref="payments")
    activity: Mapped["Activity"] = relationship("Activity", backref="payments")

    __table_args__ = (
        {"mysql_charset": "utf8mb4", "mysql_collate": "utf8mb4_unicode_ci"},
    )

    def __repr__(self) -> str:
        return f"Payment(id={self.id!r}, user_id={self.user_id!r}, amount={self.amount!r})"
