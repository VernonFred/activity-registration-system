"""Schemas for activity feedback."""

from datetime import datetime
from typing import Optional

from app.schemas.common import ORMModel, TimestampedSchema


class ActivityFeedbackSubmit(ORMModel):
    rating: int
    comment: Optional[str] = None
    is_public: bool = True


class ActivityFeedbackCreate(ActivityFeedbackSubmit):
    activity_id: int


class ActivityFeedbackRead(TimestampedSchema):
    id: int
    activity_id: int
    user_id: int
    rating: int
    comment: Optional[str] = None
    is_public: bool
