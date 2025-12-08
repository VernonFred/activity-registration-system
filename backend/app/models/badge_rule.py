"""Models for badge automation rules."""

from __future__ import annotations

from typing import Optional

from sqlalchemy import Boolean, Column, Enum, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, relationship

from app.db.base import Base
from app.models.enums import BadgeRuleType, enum_values
from app.models.badge import Badge
from app.models.mixins import TimestampMixin


class BadgeRule(TimestampMixin, Base):
    __tablename__ = "badge_rules"

    id: Mapped[int] = Column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = Column(String(120), nullable=False)
    rule_type: Mapped[BadgeRuleType] = Column(
        Enum(BadgeRuleType, name="badge_rule_type", values_callable=enum_values), nullable=False
    )
    badge_id: Mapped[int] = Column(ForeignKey("badges.id", ondelete="CASCADE"), nullable=False)
    threshold: Mapped[int | None] = Column(Integer, nullable=True)
    activity_scope: Mapped[list[int] | None] = Column(JSON, nullable=True)
    activity_tag_scope: Mapped[list[str] | None] = Column(JSON, nullable=True)
    time_window_days: Mapped[int | None] = Column(Integer, nullable=True)
    allow_repeat: Mapped[bool] = Column(Boolean, nullable=False, default=False)
    notes: Mapped[str | None] = Column(String(255), nullable=True)
    is_active: Mapped[bool] = Column(Boolean, nullable=False, default=True)
    config: Mapped[dict | None] = Column(JSON, nullable=True)

    badge: Mapped[Badge] = relationship("Badge", back_populates="rules")

    def __repr__(self) -> str:  # pragma: no cover
        return f"BadgeRule(id={self.id!r}, rule_type={self.rule_type!r}, badge_id={self.badge_id!r})"
