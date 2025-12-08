"""Activity related models."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, List

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, relationship

from app.db.base import Base
from app.models.enums import ActivityStatus, enum_values
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:  # pragma: no cover
    from app.models.activity_feedback import ActivityFeedback
    from app.models.activity_engagement import ActivityFavorite, ActivityLike, ActivityShare, ActivityComment
    from app.models.badge import UserBadge
    from app.models.form_field import ActivityFormField
    from app.models.notification import NotificationLog
    from app.models.signup import Signup


class Activity(TimestampMixin, Base):
    __tablename__ = "activities"

    id: Mapped[int] = Column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str | None] = Column(String(50), unique=True, nullable=True, index=True)
    title: Mapped[str] = Column(String(200), nullable=False)
    subtitle: Mapped[str | None] = Column(String(255), nullable=True)
    category: Mapped[str | None] = Column(String(100), nullable=True)
    tags: Mapped[list[str] | None] = Column(JSON, nullable=True)
    cover_image_url: Mapped[str | None] = Column(String(255), nullable=True)
    banner_image_url: Mapped[str | None] = Column(String(255), nullable=True)
    city: Mapped[str | None] = Column(String(100), nullable=True)
    location: Mapped[str | None] = Column(String(255), nullable=True)
    location_detail: Mapped[str | None] = Column(String(255), nullable=True)
    contact_name: Mapped[str | None] = Column(String(100), nullable=True)
    contact_phone: Mapped[str | None] = Column(String(30), nullable=True)
    contact_email: Mapped[str | None] = Column(String(120), nullable=True)
    status: Mapped[ActivityStatus] = Column(
        Enum(ActivityStatus, name="activity_status", values_callable=enum_values),
        nullable=False,
        default=ActivityStatus.DRAFT,
    )
    description: Mapped[str | None] = Column(Text, nullable=True)
    agenda: Mapped[str | None] = Column(Text, nullable=True)
    materials: Mapped[dict | None] = Column(JSON, nullable=True)
    start_time: Mapped[datetime | None] = Column(DateTime(timezone=True), nullable=True)
    end_time: Mapped[datetime | None] = Column(DateTime(timezone=True), nullable=True)
    signup_start_time: Mapped[datetime | None] = Column(DateTime(timezone=True), nullable=True)
    signup_end_time: Mapped[datetime | None] = Column(DateTime(timezone=True), nullable=True)
    checkin_start_time: Mapped[datetime | None] = Column(DateTime(timezone=True), nullable=True)
    checkin_end_time: Mapped[datetime | None] = Column(DateTime(timezone=True), nullable=True)
    max_participants: Mapped[int | None] = Column(Integer, nullable=True)
    approval_required: Mapped[bool] = Column(Boolean, nullable=False, default=True)
    require_payment: Mapped[bool] = Column(Boolean, nullable=False, default=False)
    allow_feedback: Mapped[bool] = Column(Boolean, nullable=False, default=True)
    allow_waitlist: Mapped[bool] = Column(Boolean, nullable=False, default=True)
    group_qr_image_url: Mapped[str | None] = Column(String(255), nullable=True)
    publish_time: Mapped[datetime | None] = Column(DateTime(timezone=True), nullable=True)
    archive_time: Mapped[datetime | None] = Column(DateTime(timezone=True), nullable=True)
    checkin_token: Mapped[str | None] = Column(String(64), nullable=True, unique=True, index=True)
    checkin_token_expires_at: Mapped[datetime | None] = Column(DateTime(timezone=True), nullable=True)
    extra: Mapped[dict | None] = Column(JSON, nullable=True)
    
    # 微信文章链接（活动结束后的宣传文章）
    article_url: Mapped[str | None] = Column(String(500), nullable=True)

    form_fields: Mapped[List["ActivityFormField"]] = relationship(
        "ActivityFormField",
        back_populates="activity",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="ActivityFormField.display_order",
    )
    signups: Mapped[List["Signup"]] = relationship(
        "Signup",
        back_populates="activity",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    notifications: Mapped[List["NotificationLog"]] = relationship(
        "NotificationLog",
        back_populates="activity",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    user_badges: Mapped[List["UserBadge"]] = relationship(
        "UserBadge",
        back_populates="activity",
        passive_deletes=True,
    )
    favorites: Mapped[List["ActivityFavorite"]] = relationship(
        "ActivityFavorite",
        back_populates="activity",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    likes: Mapped[List["ActivityLike"]] = relationship(
        "ActivityLike",
        back_populates="activity",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    shares: Mapped[List["ActivityShare"]] = relationship(
        "ActivityShare",
        back_populates="activity",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    comments: Mapped[List["ActivityComment"]] = relationship(
        "ActivityComment",
        back_populates="activity",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    feedbacks: Mapped[List["ActivityFeedback"]] = relationship(
        "ActivityFeedback",
        back_populates="activity",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"Activity(id={self.id!r}, title={self.title!r}, status={self.status!r})"
