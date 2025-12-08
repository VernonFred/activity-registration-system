"""Schemas for badge automation rules."""

from datetime import datetime
from typing import Optional

from app.models.enums import BadgeRuleType
from app.schemas.common import ORMModel


class BadgeRuleBase(ORMModel):
    name: str
    rule_type: BadgeRuleType
    badge_id: int
    threshold: Optional[int] = None
    activity_scope: Optional[list[int]] = None
    activity_tag_scope: Optional[list[str]] = None
    time_window_days: Optional[int] = None
    allow_repeat: bool = False
    notes: Optional[str] = None
    config: Optional[dict] = None


class BadgeRuleCreate(BadgeRuleBase):
    is_active: bool = True


class BadgeRuleUpdate(ORMModel):
    name: Optional[str] = None
    badge_id: Optional[int] = None
    threshold: Optional[int] = None
    activity_scope: Optional[list[int]] = None
    activity_tag_scope: Optional[list[str]] = None
    time_window_days: Optional[int] = None
    allow_repeat: Optional[bool] = None
    notes: Optional[str] = None
    config: Optional[dict] = None
    is_active: Optional[bool] = None


class BadgeRuleRead(BadgeRuleBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


class BadgeRulePreviewRequest(ORMModel):
    user_id: int
    activity_id: Optional[int] = None


class BadgeRulePreviewResult(ORMModel):
    rule_id: int
    eligible: bool
    reason: Optional[str] = None
