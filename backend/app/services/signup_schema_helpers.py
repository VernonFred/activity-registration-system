from __future__ import annotations

from datetime import datetime, timezone

from app.models.enums import CheckinStatus, SignupStatus
from app.models.signup import Signup
from app.schemas.signup import RecentSignupUser, SignupAnswer, SignupRead


def build_signup_schema(signup: Signup) -> SignupRead:
    return SignupRead(
        id=signup.id,
        activity_id=signup.activity_id,
        user_id=signup.user_id,
        status=signup.status,
        checkin_status=signup.checkin_status,
        approval_remark=signup.approval_remark,
        rejection_reason=signup.rejection_reason,
        approved_at=signup.approved_at,
        cancelled_at=signup.cancelled_at,
        checkin_time=signup.checkin_time,
        form_snapshot=signup.form_snapshot,
        extra=signup.extra,
        reviewed_by_admin_id=signup.reviewed_by_admin_id,
        reviewed_at=signup.reviewed_at,
        answers=[
            SignupAnswer(
                field_id=answer.field_id,
                value_text=answer.value_text,
                value_json=answer.value_json,
            )
            for answer in signup.answers
        ],
        created_at=signup.created_at,
        updated_at=signup.updated_at,
    )


def build_activity_stats(activity_id: int, counts: dict) -> dict:
    status_counts = {status: 0 for status in SignupStatus}
    for status, count in counts["status"].items():
        status_counts[status] = count

    checkin_counts = {status: 0 for status in CheckinStatus}
    for status, count in counts["checkin"].items():
        checkin_counts[status] = count

    total = sum(status_counts.values())
    return {
        "activity_id": activity_id,
        "total_signups": total,
        "status_counts": {status.value: count for status, count in status_counts.items()},
        "checkin_counts": {status.value: count for status, count in checkin_counts.items()},
    }


def build_recent_signups(repo, activity_id: int, *, since_hours: int = 24, limit: int = 3) -> list[RecentSignupUser]:
    all_signups = repo.list(activity_id=activity_id, limit=200)
    now_ts = datetime.now(timezone.utc).timestamp()

    def _ts(dt):
        if not dt:
            return 0
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc).timestamp()
        return dt.timestamp()

    within = [signup for signup in all_signups if (now_ts - _ts(signup.created_at)) <= since_hours * 3600]
    pool = within if within else all_signups
    return [
        RecentSignupUser(
            user_id=signup.user_id,
            name=signup.user.name if signup.user else None,
            avatar_url=signup.user.avatar_url if signup.user else None,
            created_at=signup.created_at,
        )
        for signup in pool[:limit]
    ]
