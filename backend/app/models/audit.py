"""Audit log model definitions."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Column, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, relationship

from app.db.base import Base
from app.models.enums import AuditAction, AuditEntity
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:  # pragma: no cover
    from app.models.activity import Activity
    from app.models.admin import AdminUser
    from app.models.signup import Signup
    from app.models.user import UserProfile


class AuditLog(TimestampMixin, Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = Column(Integer, primary_key=True, autoincrement=True)
    actor_admin_id: Mapped[int | None] = Column(ForeignKey("admin_users.id", ondelete="SET NULL"), nullable=True)
    actor_user_id: Mapped[int | None] = Column(ForeignKey("user_profiles.id", ondelete="SET NULL"), nullable=True)
    action: Mapped[AuditAction] = Column(
        String(100), nullable=False
    )
    entity_type: Mapped[AuditEntity] = Column(String(50), nullable=False)
    entity_id: Mapped[int | None] = Column(Integer, nullable=True)
    description: Mapped[str | None] = Column(String(255), nullable=True)
    context: Mapped[dict | None] = Column(JSON, nullable=True)

    actor_admin: Mapped["AdminUser | None"] = relationship("AdminUser", back_populates="audit_logs")
    actor_user: Mapped["UserProfile | None"] = relationship("UserProfile", back_populates="audit_logs")

    def __repr__(self) -> str:  # pragma: no cover
        return f"AuditLog(action={self.action!r}, entity_type={self.entity_type!r}, entity_id={self.entity_id!r})"
