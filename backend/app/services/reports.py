"""Reporting services for aggregated metrics and time series."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from collections import defaultdict

from sqlalchemy import select, func

from sqlalchemy.orm import Session

from app.repositories.signups import SignupRepository
from app.repositories.feedbacks import ActivityFeedbackRepository
from app.repositories.engagements import ActivityEngagementRepository
from app.models.signup import Signup
from app.models.activity_feedback import ActivityFeedback
from app.models.activity_engagement import ActivityFavorite, ActivityLike, ActivityShare, ActivityComment
from app.models.audit import AuditLog
from app.models.badge_rule import BadgeRule
from app.models.enums import AuditAction, AuditEntity


class ReportService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.signups = SignupRepository(session)
        self.feedbacks = ActivityFeedbackRepository(session)
        self.engagements = ActivityEngagementRepository(session)

    def overview(self, *, days: int | None = None) -> dict:
        since = None
        if days:
            since = datetime.now(timezone.utc) - timedelta(days=days)
        counts = self.signups.overall_counts(since=since)
        feedback = self.feedbacks.aggregate_overall(since=since)
        engagement_counts = self.engagements.overall_counts()

        approval_rate = _safe_ratio(counts["approved"], counts["total"])
        checkin_rate = _safe_ratio(counts["checked_in"], counts["total"])

        data = {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "total_signups": counts["total"],
            "approved_signups": counts["approved"],
            "checked_in_signups": counts["checked_in"],
            "approval_rate": approval_rate,
            "checkin_rate": checkin_rate,
            "average_rating": feedback["average_rating"],
            "total_feedbacks": feedback["total_feedbacks"],
            "total_favorites": engagement_counts["favorites"],
            "total_likes": engagement_counts["likes"],
            "total_shares": engagement_counts["shares"],
            "total_comments": engagement_counts["comments"],
        }

        if days and days > 0:
            data["time_series"] = self._time_series(days=days)
            data["badge_rule_issuance"] = self._badge_rule_issuance(since=since)
        return data

    def activity_report(self, activity_id: int, *, days: int | None = None) -> dict:
        since = None
        if days:
            since = datetime.now(timezone.utc) - timedelta(days=days)

        # signups
        activity_signups = self.session.execute(
            select(Signup).where(Signup.activity_id == activity_id)
        ).scalars().all()
        total = len(activity_signups)
        approved = sum(1 for s in activity_signups if s.status.name.lower() == "approved")
        checked_in = sum(1 for s in activity_signups if s.checkin_time is not None)

        # feedback and engagements
        feedback_totals = self.feedbacks.aggregate_for_activity(activity_id)
        engagement_summary = self.engagements.engagement_summary(activity_id)

        data = {
            "activity_id": activity_id,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "total_signups": total,
            "approved_signups": approved,
            "checked_in_signups": checked_in,
            "average_rating": feedback_totals["average_rating"],
            "total_feedbacks": feedback_totals["total_feedbacks"],
            "total_favorites": engagement_summary["favorites"],
            "total_likes": engagement_summary["likes"],
            "total_shares": engagement_summary["shares"],
            "total_comments": engagement_summary["comments"],
        }

        if days and days > 0:
            data["time_series"] = self._time_series(days=days, activity_id=activity_id)
        return data

    def _time_series(self, *, days: int, activity_id: int | None = None) -> list[dict]:
        def bucket_key(dt: datetime | None) -> str | None:
            if not dt:
                return None
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc).strftime("%Y-%m-%d")

        # Build buckets from since..today
        today = datetime.now(timezone.utc).date()
        # inclusive range: [today-(days-1), today]
        start_date = (today - timedelta(days=days - 1))
        buckets: dict[str, dict[str, int]] = {
            (start_date + timedelta(days=i)).strftime("%Y-%m-%d"): {
                "signups": 0,
                "approvals": 0,
                "checkins": 0,
                "feedbacks": 0,
                "favorites": 0,
                "likes": 0,
                "shares": 0,
                "comments": 0,
            }
            for i in range(days)
        }

        # Query and aggregate
        signup_query = select(Signup)
        if activity_id is not None:
            signup_query = signup_query.where(Signup.activity_id == activity_id)
        signups = self.session.execute(signup_query).scalars().all()
        for s in signups:
            k = bucket_key(s.created_at)
            if k and k in buckets:
                buckets[k]["signups"] += 1
            k2 = bucket_key(s.approved_at)
            if k2 and k2 in buckets:
                buckets[k2]["approvals"] += 1
            k3 = bucket_key(s.checkin_time)
            if k3 and k3 in buckets:
                buckets[k3]["checkins"] += 1

        fb_query = select(ActivityFeedback)
        if activity_id is not None:
            fb_query = fb_query.where(ActivityFeedback.activity_id == activity_id)
        fbs = self.session.execute(fb_query).scalars().all()
        for f in fbs:
            k = bucket_key(f.created_at)
            if k and k in buckets:
                buckets[k]["feedbacks"] += 1

        def _agg(model, key: str):
            q = select(model)
            if activity_id is not None and hasattr(model, "activity_id"):
                q = q.where(getattr(model, "activity_id") == activity_id)
            rows = self.session.execute(q).scalars().all()
            for r in rows:
                k = bucket_key(getattr(r, "created_at", None))
                if k and k in buckets:
                    buckets[k][key] += 1

        _agg(ActivityFavorite, "favorites")
        _agg(ActivityLike, "likes")
        _agg(ActivityShare, "shares")
        _agg(ActivityComment, "comments")

        # Convert to list in chronological order
        return [
            {
                "date": date,
                **metrics,
            }
            for date, metrics in sorted(buckets.items(), key=lambda item: item[0])
        ]

    def _badge_rule_issuance(self, *, since: datetime) -> dict[str, int]:
        # Count audit logs of BADGE_RULE_TRIGGERED grouped by BadgeRule.rule_type
        rows = self.session.execute(
            select(BadgeRule.rule_type, func.count(AuditLog.id))
            .select_from(AuditLog)
            .join(BadgeRule, (AuditLog.entity_type == AuditEntity.BADGE_RULE) & (AuditLog.entity_id == BadgeRule.id))
            .where(AuditLog.action == AuditAction.BADGE_RULE_TRIGGERED, AuditLog.created_at >= since)
            .group_by(BadgeRule.rule_type)
        ).all()
        return {str(rule_type): count for rule_type, count in rows}


def _safe_ratio(value: int, total: int) -> float:
    if total == 0:
        return 0.0
    return round(value / total, 4)
