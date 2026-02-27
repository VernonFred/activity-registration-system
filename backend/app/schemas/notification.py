"""Notification schemas."""

from datetime import datetime
from typing import Optional

from app.models.enums import (
    CheckinStatus,
    NotificationChannel,
    NotificationEvent,
    NotificationStatus,
    SignupStatus,
)
from app.schemas.common import ORMModel, TimestampedSchema


class NotificationLogRead(TimestampedSchema):
    id: int
    user_id: Optional[int] = None
    signup_id: Optional[int] = None
    activity_id: Optional[int] = None
    channel: NotificationChannel
    event: NotificationEvent
    status: NotificationStatus
    payload: Optional[dict] = None
    error_message: Optional[str] = None
    scheduled_send_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    retry_count: int


class NotificationPreviewRequest(ORMModel):
    channel: NotificationChannel
    event: NotificationEvent
    user_id: Optional[int] = None
    activity_id: Optional[int] = None
    signup_id: Optional[int] = None
    payload: Optional[dict] = None


class NotificationPreviewSubject(ORMModel):
    id: int
    name: Optional[str] = None


class NotificationPreviewActivity(ORMModel):
    id: int
    title: Optional[str] = None


class NotificationPreviewSignup(ORMModel):
    id: int
    status: SignupStatus
    checkin_status: CheckinStatus


class NotificationPreviewResponse(ORMModel):
    channel: NotificationChannel
    event: NotificationEvent
    payload: Optional[dict] = None
    user: Optional[NotificationPreviewSubject] = None
    activity: Optional[NotificationPreviewActivity] = None
    signup: Optional[NotificationPreviewSignup] = None


class NotificationEnqueueRequest(ORMModel):
    channel: NotificationChannel
    event: NotificationEvent
    user_id: Optional[int] = None
    activity_id: Optional[int] = None
    signup_id: Optional[int] = None
    payload: Optional[dict] = None
    scheduled_send_at: Optional[datetime] = None


class NotificationBatchDeleteRequest(ORMModel):
    ids: list[int]
