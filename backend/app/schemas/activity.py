"""Pydantic schemas for activities and related resources."""

from datetime import datetime
from typing import List, Optional

from pydantic import Field

from app.models.enums import ActivityStatus
from app.schemas.common import ORMModel, TimestampedSchema
from app.schemas.form_field import ActivityFormFieldCreate, ActivityFormFieldRead


class ActivityBase(ORMModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    cover_image_url: Optional[str] = None
    banner_image_url: Optional[str] = None
    city: Optional[str] = None
    location: Optional[str] = None
    location_detail: Optional[str] = None
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    description: Optional[str] = None
    agenda: Optional[str] = None
    materials: Optional[dict] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    signup_start_time: Optional[datetime] = None
    signup_end_time: Optional[datetime] = None
    checkin_start_time: Optional[datetime] = None
    checkin_end_time: Optional[datetime] = None
    max_participants: Optional[int] = None
    approval_required: bool = True
    require_payment: bool = False
    allow_feedback: bool = True
    allow_waitlist: bool = True
    group_qr_image_url: Optional[str] = None
    extra: Optional[dict] = None
    article_url: Optional[str] = None  # 微信文章链接


class ActivityCreate(ActivityBase):
    title: str
    code: Optional[str] = None
    status: ActivityStatus = Field(default=ActivityStatus.DRAFT)
    form_fields: List[ActivityFormFieldCreate] = Field(default_factory=list)


class ActivityUpdate(ActivityBase):
    status: Optional[ActivityStatus] = None
    form_fields: Optional[List[ActivityFormFieldCreate]] = None


class ActivitySummary(ActivityBase, TimestampedSchema):
    id: int
    status: ActivityStatus
    signup_count: int = 0


class ActivityDetail(ActivityBase, TimestampedSchema):
    id: int
    status: ActivityStatus
    code: Optional[str] = None
    publish_time: Optional[datetime] = None
    archive_time: Optional[datetime] = None
    checkin_token: Optional[str] = None
    checkin_token_expires_at: Optional[datetime] = None
    form_fields: List[ActivityFormFieldRead] = Field(default_factory=list)


class ActivityStats(ORMModel):
    activity_id: int
    total_signups: int
    status_counts: dict[str, int]
    checkin_counts: dict[str, int]
    average_rating: float | None = None
    total_feedbacks: int = 0
