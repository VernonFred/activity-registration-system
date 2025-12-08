"""Admin user model."""

from __future__ import annotations

from datetime import datetime
from typing import List

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import Mapped, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin


class AdminUser(TimestampMixin, Base):
    __tablename__ = "admin_users"

    id: Mapped[int] = Column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = Column(String(255), nullable=False)
    is_active: Mapped[bool] = Column(Boolean, nullable=False, default=True)
    last_login: Mapped[datetime | None] = Column(DateTime(timezone=True), nullable=True)

    reviews: Mapped[List["Signup"]] = relationship(
        "Signup",
        back_populates="reviewed_by_admin",
        passive_deletes=True,
    )
    audit_logs: Mapped[List["AuditLog"]] = relationship(
        "AuditLog",
        back_populates="actor_admin",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"AdminUser(id={self.id!r}, username={self.username!r})"
