"""Badge models."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String, UniqueConstraint
from sqlalchemy.orm import Mapped, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:  # pragma: no cover
    from app.models.activity import Activity
    from app.models.user import UserProfile
    from app.models.badge_rule import BadgeRule


class Badge(TimestampMixin, Base):
    __tablename__ = "badges"

    id: Mapped[int] = Column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = Column(String(50), unique=True, nullable=False, index=True)
    name: Mapped[str] = Column(String(120), nullable=False)
    description: Mapped[str | None] = Column(String(255), nullable=True)
    icon_url: Mapped[str | None] = Column(String(255), nullable=True)
    criteria: Mapped[dict | None] = Column(JSON, nullable=True)
    is_active: Mapped[bool] = Column(Boolean, nullable=False, default=True)

    users: Mapped[list["UserBadge"]] = relationship("UserBadge", back_populates="badge", cascade="all, delete-orphan")
    rules: Mapped[list["BadgeRule"]] = relationship(
        "BadgeRule", back_populates="badge", cascade="all, delete-orphan", passive_deletes=True
    )

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"Badge(id={self.id!r}, code={self.code!r})"


class UserBadge(Base):
    __tablename__ = "user_badges"

    id: Mapped[int] = Column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = Column(Integer, ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False)
    badge_id: Mapped[int] = Column(Integer, ForeignKey("badges.id", ondelete="CASCADE"), nullable=False)
    activity_id: Mapped[int | None] = Column(Integer, ForeignKey("activities.id", ondelete="SET NULL"), nullable=True)
    awarded_at: Mapped[datetime] = Column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    notes: Mapped[str | None] = Column(String(255), nullable=True)

    user: Mapped["UserProfile"] = relationship("UserProfile", back_populates="badges")
    badge: Mapped[Badge] = relationship("Badge", back_populates="users")
    activity: Mapped["Activity | None"] = relationship("Activity", back_populates="user_badges", foreign_keys=[activity_id])

    __table_args__ = (UniqueConstraint("user_id", "badge_id", name="uq_user_badges_user_badge"),)

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"UserBadge(user_id={self.user_id!r}, badge_id={self.badge_id!r})"
