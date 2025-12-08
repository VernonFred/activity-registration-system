"""Badge schemas."""

from datetime import datetime
from typing import Optional

from app.schemas.common import ORMModel, TimestampedSchema


class BadgeCreate(ORMModel):
    code: str
    name: str
    description: Optional[str] = None
    icon_url: Optional[str] = None
    criteria: Optional[dict] = None


class BadgeRead(TimestampedSchema):
    id: int
    code: str
    name: str
    description: Optional[str] = None
    icon_url: Optional[str] = None
    criteria: Optional[dict] = None
    is_active: bool


class UserBadgeRead(ORMModel):
    id: int
    user_id: int
    badge_id: int
    activity_id: Optional[int] = None
    awarded_at: datetime
    notes: Optional[str] = None


class BadgeAwardRequest(ORMModel):
    user_id: int
    activity_id: Optional[int] = None
    notes: Optional[str] = None
