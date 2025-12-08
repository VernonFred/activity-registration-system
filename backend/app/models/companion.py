"""Companion model for signup companions."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Column, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:  # pragma: no cover
    from app.models.signup import Signup


class SignupCompanion(TimestampMixin, Base):
    """Companion person for a signup."""
    __tablename__ = "signup_companions"

    id: Mapped[int] = Column(Integer, primary_key=True, autoincrement=True)
    signup_id: Mapped[int] = Column(
        Integer, ForeignKey("signups.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = Column(String(100), nullable=False)
    mobile: Mapped[str | None] = Column(String(20), nullable=True)
    organization: Mapped[str | None] = Column(String(200), nullable=True)
    title: Mapped[str | None] = Column(String(120), nullable=True)
    extra: Mapped[dict | None] = Column(JSON, nullable=True)

    signup: Mapped["Signup"] = relationship("Signup", back_populates="companions")

    __table_args__ = (
        {
            "mysql_charset": "utf8mb4",
            "mysql_collate": "utf8mb4_unicode_ci",
        },
    )

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"SignupCompanion(id={self.id!r}, name={self.name!r})"

