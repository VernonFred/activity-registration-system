"""Schemas for reporting endpoints."""

from datetime import datetime
from typing import Optional

from app.schemas.common import ORMModel


class TimeSeriesPoint(ORMModel):
    date: str
    signups: int
    approvals: int
    checkins: int
    feedbacks: int
    favorites: int
    likes: int
    shares: int
    comments: int


class ReportOverview(ORMModel):
    generated_at: datetime
    total_signups: int
    approved_signups: int
    checked_in_signups: int
    approval_rate: float
    checkin_rate: float
    average_rating: float | None
    total_feedbacks: int
    total_favorites: int
    total_likes: int
    total_shares: int
    total_comments: int
    time_series: Optional[list[TimeSeriesPoint]] = None
    badge_rule_issuance: Optional[dict[str, int]] = None


class ReportActivity(ORMModel):
    activity_id: int
    generated_at: datetime
    total_signups: int
    approved_signups: int
    checked_in_signups: int
    average_rating: float | None
    total_feedbacks: int
    total_favorites: int
    total_likes: int
    total_shares: int
    total_comments: int
    time_series: Optional[list[TimeSeriesPoint]] = None
