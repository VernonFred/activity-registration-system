"""Notification log models."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, relationship

from app.db.base import Base
from app.models.enums import NotificationChannel, NotificationEvent, NotificationStatus, enum_values
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:  # pragma: no cover
    from app.models.activity import Activity
    from app.models.signup import Signup
    from app.models.user import UserProfile


class NotificationLog(TimestampMixin, Base):
    __tablename__ = "notification_logs"

    id: Mapped[int] = Column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = Column(Integer, ForeignKey("user_profiles.id", ondelete="SET NULL"), nullable=True)
    signup_id: Mapped[int | None] = Column(Integer, ForeignKey("signups.id", ondelete="SET NULL"), nullable=True)
    activity_id: Mapped[int | None] = Column(Integer, ForeignKey("activities.id", ondelete="SET NULL"), nullable=True)
    channel: Mapped[NotificationChannel] = Column(
        Enum(NotificationChannel, name="notification_channel", values_callable=enum_values), nullable=False
    )
    event: Mapped[NotificationEvent] = Column(
        Enum(NotificationEvent, name="notification_event", values_callable=enum_values), nullable=False
    )
    status: Mapped[NotificationStatus] = Column(
        Enum(NotificationStatus, name="notification_status", values_callable=enum_values),
        nullable=False,
        default=NotificationStatus.PENDING,
    )
    payload: Mapped[dict | None] = Column(JSON, nullable=True)
    error_message: Mapped[str | None] = Column(String(255), nullable=True)
    scheduled_send_at: Mapped[datetime | None] = Column(DateTime(timezone=True), nullable=True)
    sent_at: Mapped[datetime | None] = Column(DateTime(timezone=True), nullable=True)
    retry_count: Mapped[int] = Column(Integer, nullable=False, default=0)

    user: Mapped["UserProfile | None"] = relationship("UserProfile", back_populates="notifications")
    signup: Mapped["Signup | None"] = relationship("Signup", back_populates="notifications")
    activity: Mapped["Activity | None"] = relationship("Activity", back_populates="notifications")

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"NotificationLog(id={self.id!r}, event={self.event!r}, status={self.status!r})"
