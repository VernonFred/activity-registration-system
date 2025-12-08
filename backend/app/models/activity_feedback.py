"""Activity feedback models."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:  # pragma: no cover
    from app.models.activity import Activity
    from app.models.user import UserProfile


class ActivityFeedback(TimestampMixin, Base):
    __tablename__ = "activity_feedbacks"

    id: Mapped[int] = Column(Integer, primary_key=True, autoincrement=True)
    activity_id: Mapped[int] = Column(ForeignKey("activities.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int] = Column(ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    rating: Mapped[int] = Column(Integer, nullable=False)
    comment: Mapped[str | None] = Column(Text, nullable=True)
    is_public: Mapped[bool] = Column(Boolean, nullable=False, default=True)

    activity: Mapped["Activity"] = relationship("Activity", back_populates="feedbacks")
    user: Mapped["UserProfile"] = relationship("UserProfile", back_populates="feedbacks")

    __table_args__ = (
        UniqueConstraint("activity_id", "user_id", name="uq_activity_feedback_user"),
        {"mysql_charset": "utf8mb4", "mysql_collate": "utf8mb4_unicode_ci"},
    )

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"ActivityFeedback(activity_id={self.activity_id!r}, user_id={self.user_id!r}, rating={self.rating!r})"
