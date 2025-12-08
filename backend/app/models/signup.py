"""Signup related models."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, relationship

from app.db.base import Base
from app.models.enums import CheckinStatus, SignupStatus, enum_values
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:  # pragma: no cover
    from app.models.activity import Activity
    from app.models.form_field import ActivityFormField
    from app.models.admin import AdminUser
    from app.models.notification import NotificationLog
    from app.models.user import UserProfile
    from app.models.companion import SignupCompanion


class Signup(TimestampMixin, Base):
    __tablename__ = "signups"

    id: Mapped[int] = Column(Integer, primary_key=True, autoincrement=True)
    activity_id: Mapped[int] = Column(
        Integer, ForeignKey("activities.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[int] = Column(
        Integer, ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[SignupStatus] = Column(
        Enum(SignupStatus, name="signup_status", values_callable=enum_values),
        nullable=False,
        default=SignupStatus.PENDING,
    )
    checkin_status: Mapped[CheckinStatus] = Column(
        Enum(CheckinStatus, name="checkin_status", values_callable=enum_values),
        nullable=False,
        default=CheckinStatus.NOT_CHECKED_IN,
    )
    approval_remark: Mapped[str | None] = Column(String(255), nullable=True)
    rejection_reason: Mapped[str | None] = Column(Text, nullable=True)
    approved_at: Mapped[datetime | None] = Column(DateTime(timezone=True), nullable=True)
    cancelled_at: Mapped[datetime | None] = Column(DateTime(timezone=True), nullable=True)
    checkin_time: Mapped[datetime | None] = Column(DateTime(timezone=True), nullable=True)
    form_snapshot: Mapped[dict | None] = Column(JSON, nullable=True)
    extra: Mapped[dict | None] = Column(JSON, nullable=True)
    reviewed_by_admin_id: Mapped[int | None] = Column(
        Integer, ForeignKey("admin_users.id", ondelete="SET NULL"), nullable=True
    )
    reviewed_at: Mapped[datetime | None] = Column(DateTime(timezone=True), nullable=True)

    activity: Mapped["Activity"] = relationship("Activity", back_populates="signups")
    user: Mapped["UserProfile"] = relationship("UserProfile", back_populates="signups")
    reviewed_by_admin: Mapped[Optional["AdminUser"]] = relationship(
        "AdminUser", back_populates="reviews"
    )
    answers: Mapped[List["SignupFieldAnswer"]] = relationship(
        "SignupFieldAnswer",
        back_populates="signup",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    notifications: Mapped[List["NotificationLog"]] = relationship(
        "NotificationLog",
        back_populates="signup",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    companions: Mapped[List["SignupCompanion"]] = relationship(
        "SignupCompanion",
        back_populates="signup",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    __table_args__ = (
        {
            "mysql_charset": "utf8mb4",
            "mysql_collate": "utf8mb4_unicode_ci",
        },
    )

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"Signup(id={self.id!r}, activity_id={self.activity_id!r}, status={self.status!r})"


class SignupFieldAnswer(TimestampMixin, Base):
    __tablename__ = "signup_field_answers"

    id: Mapped[int] = Column(Integer, primary_key=True, autoincrement=True)
    signup_id: Mapped[int] = Column(
        Integer, ForeignKey("signups.id", ondelete="CASCADE"), nullable=False, index=True
    )
    field_id: Mapped[int] = Column(
        Integer, ForeignKey("activity_form_fields.id", ondelete="CASCADE"), nullable=False, index=True
    )
    value_text: Mapped[str | None] = Column(Text, nullable=True)
    value_json: Mapped[dict | list | None] = Column(JSON, nullable=True)

    signup: Mapped["Signup"] = relationship("Signup", back_populates="answers")
    field: Mapped["ActivityFormField"] = relationship("ActivityFormField", back_populates="answers")

    __table_args__ = (
        {
            "mysql_charset": "utf8mb4",
            "mysql_collate": "utf8mb4_unicode_ci",
        },
    )

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"SignupFieldAnswer(id={self.id!r}, field_id={self.field_id!r})"
