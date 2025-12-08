"""Pydantic schemas for signups and field answers."""

from datetime import datetime
from typing import List, Optional

from pydantic import Field

from app.models.enums import CheckinStatus, NotificationEvent, SignupStatus
from app.schemas.common import ORMModel, TimestampedSchema


class SignupAnswer(ORMModel):
    field_id: int
    value_text: Optional[str] = None
    value_json: Optional[dict | list] = None


class SignupCreate(ORMModel):
    activity_id: int
    answers: List[SignupAnswer]
    extra: Optional[dict] = None


class SignupUpdate(ORMModel):
    answers: Optional[List[SignupAnswer]] = None
    status: Optional[SignupStatus] = None
    checkin_status: Optional[CheckinStatus] = None
    approval_remark: Optional[str] = None
    rejection_reason: Optional[str] = None
    extra: Optional[dict] = None


class SignupRead(TimestampedSchema):
    id: int
    activity_id: int
    user_id: int
    status: SignupStatus
    checkin_status: CheckinStatus
    approval_remark: Optional[str] = None
    rejection_reason: Optional[str] = None
    approved_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    checkin_time: Optional[datetime] = None
    form_snapshot: Optional[dict] = None
    extra: Optional[dict] = None
    reviewed_by_admin_id: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    answers: List[SignupAnswer] = Field(default_factory=list)


class SignupReviewRequest(ORMModel):
    action: str = Field(pattern="^(approve|reject)$")
    message: Optional[str] = None


class SignupReminderRequest(ORMModel):
    event: NotificationEvent = NotificationEvent.SIGNUP_REMINDER


class SignupCheckinRequest(ORMModel):
    token: str
    force: bool = False


class RecentSignupUser(ORMModel):
    user_id: int
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime


class BulkReviewRequest(ORMModel):
    """Request schema for bulk review of signups."""
    signup_ids: List[int] = Field(..., description="要审核的报名ID列表")
    action: str = Field(pattern="^(approve|reject)$", description="审核动作: approve 或 reject")
    remark: Optional[str] = Field(None, description="审核备注/驳回原因")


class BulkReviewResult(ORMModel):
    """Response schema for bulk review operation."""
    success: int = Field(description="成功审核的数量")
    failed: int = Field(description="失败的数量")
    skipped: int = Field(description="跳过的数量(状态不符)")
    details: List[dict] = Field(default_factory=list, description="每条记录的处理结果")
