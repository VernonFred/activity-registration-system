"""InvoiceHeader model — 用户发票抬头."""

from __future__ import annotations

from typing import TYPE_CHECKING, Optional

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.user import UserProfile


class InvoiceHeader(TimestampMixin, Base):
    __tablename__ = "invoice_headers"

    id: Mapped[int] = Column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = Column(
        Integer, ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = Column(String(200), nullable=False)
    type: Mapped[str] = Column(String(20), nullable=False, default="personal")
    tax_number: Mapped[Optional[str]] = Column(String(50), nullable=True)
    address: Mapped[Optional[str]] = Column(String(300), nullable=True)
    phone: Mapped[Optional[str]] = Column(String(30), nullable=True)
    bank_name: Mapped[Optional[str]] = Column(String(200), nullable=True)
    bank_account: Mapped[Optional[str]] = Column(String(50), nullable=True)

    user: Mapped["UserProfile"] = relationship("UserProfile", backref="invoice_headers")

    __table_args__ = (
        {"mysql_charset": "utf8mb4", "mysql_collate": "utf8mb4_unicode_ci"},
    )

    def __repr__(self) -> str:
        return f"InvoiceHeader(id={self.id!r}, name={self.name!r}, type={self.type!r})"
