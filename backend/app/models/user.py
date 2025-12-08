"""User profile model definitions."""

from __future__ import annotations

from typing import TYPE_CHECKING, List

from sqlalchemy import Boolean, Column, Integer, JSON, String
from sqlalchemy.orm import Mapped, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:  # pragma: no cover
    from app.models.activity_feedback import ActivityFeedback
    from app.models.activity_engagement import ActivityFavorite, ActivityLike, ActivityShare, ActivityComment
    from app.models.audit import AuditLog
    from app.models.badge import UserBadge
    from app.models.notification import NotificationLog
    from app.models.signup import Signup


class UserProfile(TimestampMixin, Base):
    __tablename__ = "user_profiles"

    id: Mapped[int] = Column(Integer, primary_key=True, autoincrement=True)
    openid: Mapped[str | None] = Column(String(64), unique=True, nullable=True, index=True)
    unionid: Mapped[str | None] = Column(String(64), unique=True, nullable=True)
    name: Mapped[str | None] = Column(String(100), nullable=True)
    mobile: Mapped[str | None] = Column(String(20), nullable=True, index=True)
    email: Mapped[str | None] = Column(String(120), nullable=True)
    title: Mapped[str | None] = Column(String(120), nullable=True)
    organization: Mapped[str | None] = Column(String(200), nullable=True)
    avatar_url: Mapped[str | None] = Column(String(255), nullable=True)
    is_active: Mapped[bool] = Column(Boolean, default=True, nullable=False)
    tags: Mapped[list[str] | None] = Column(JSON, nullable=True)
    extra: Mapped[dict | None] = Column(JSON, nullable=True)

    signups: Mapped[List["Signup"]] = relationship(
        "Signup", back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )
    badges: Mapped[List["UserBadge"]] = relationship(
        "UserBadge", back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )
    notifications: Mapped[List["NotificationLog"]] = relationship(
        "NotificationLog", back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )
    feedbacks: Mapped[List["ActivityFeedback"]] = relationship(
        "ActivityFeedback", back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )
    audit_logs: Mapped[List["AuditLog"]] = relationship(
        "AuditLog", back_populates="actor_user", cascade="all, delete-orphan", passive_deletes=True
    )
    favorite_activities: Mapped[List["ActivityFavorite"]] = relationship(
        "ActivityFavorite", back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )
    liked_activities: Mapped[List["ActivityLike"]] = relationship(
        "ActivityLike", back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )
    shares: Mapped[List["ActivityShare"]] = relationship(
        "ActivityShare", back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )
    activity_comments: Mapped[List["ActivityComment"]] = relationship(
        "ActivityComment", back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"UserProfile(id={self.id!r}, name={self.name!r})"
