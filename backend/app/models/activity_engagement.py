"""Models for user engagement actions on activities."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:  # pragma: no cover
    from app.models.activity import Activity
    from app.models.user import UserProfile


class ActivityFavorite(TimestampMixin, Base):
    __tablename__ = "activity_favorites"

    id: Mapped[int] = Column(Integer, primary_key=True, autoincrement=True)
    activity_id: Mapped[int] = Column(ForeignKey("activities.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int] = Column(ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False, index=True)

    activity: Mapped["Activity"] = relationship("Activity", back_populates="favorites")
    user: Mapped["UserProfile"] = relationship("UserProfile", back_populates="favorite_activities")

    __table_args__ = (
        UniqueConstraint("activity_id", "user_id", name="uq_activity_favorites_user"),
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"ActivityFavorite(activity_id={self.activity_id!r}, user_id={self.user_id!r})"


class ActivityLike(TimestampMixin, Base):
    __tablename__ = "activity_likes"

    id: Mapped[int] = Column(Integer, primary_key=True, autoincrement=True)
    activity_id: Mapped[int] = Column(ForeignKey("activities.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int] = Column(ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False, index=True)

    activity: Mapped["Activity"] = relationship("Activity", back_populates="likes")
    user: Mapped["UserProfile"] = relationship("UserProfile", back_populates="liked_activities")

    __table_args__ = (
        UniqueConstraint("activity_id", "user_id", name="uq_activity_likes_user"),
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"ActivityLike(activity_id={self.activity_id!r}, user_id={self.user_id!r})"


class ActivityShare(TimestampMixin, Base):
    __tablename__ = "activity_shares"

    id: Mapped[int] = Column(Integer, primary_key=True, autoincrement=True)
    activity_id: Mapped[int] = Column(ForeignKey("activities.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int | None] = Column(ForeignKey("user_profiles.id", ondelete="SET NULL"), nullable=True, index=True)
    channel: Mapped[str | None] = Column(String(50), nullable=True)

    activity: Mapped["Activity"] = relationship("Activity", back_populates="shares")
    user: Mapped["UserProfile | None"] = relationship("UserProfile", back_populates="shares")

    def __repr__(self) -> str:  # pragma: no cover
        return f"ActivityShare(activity_id={self.activity_id!r}, user_id={self.user_id!r}, channel={self.channel!r})"


class ActivityComment(TimestampMixin, Base):
    __tablename__ = "activity_comments"

    id: Mapped[int] = Column(Integer, primary_key=True, autoincrement=True)
    activity_id: Mapped[int] = Column(ForeignKey("activities.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int] = Column(ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_id: Mapped[int | None] = Column(ForeignKey("activity_comments.id", ondelete="SET NULL"), nullable=True)
    content: Mapped[str] = Column(Text, nullable=False)
    is_pinned: Mapped[bool] = Column(Boolean, nullable=False, default=False)
    deleted_at: Mapped[datetime | None] = Column(DateTime(timezone=True), nullable=True)

    activity: Mapped["Activity"] = relationship("Activity", back_populates="comments")
    user: Mapped["UserProfile"] = relationship("UserProfile", back_populates="activity_comments")
    parent: Mapped["ActivityComment | None"] = relationship("ActivityComment", remote_side="ActivityComment.id")

    def __repr__(self) -> str:  # pragma: no cover
        return f"ActivityComment(id={self.id!r}, activity_id={self.activity_id!r}, user_id={self.user_id!r})"
