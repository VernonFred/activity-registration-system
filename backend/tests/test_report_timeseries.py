from datetime import datetime, timedelta, timezone

from app.models.activity import Activity
from app.models.activity_engagement import ActivityFavorite, ActivityLike, ActivityShare, ActivityComment
from app.models.activity_feedback import ActivityFeedback
from app.models.enums import ActivityStatus, CheckinStatus, SignupStatus
from app.models.signup import Signup
from app.models.user import UserProfile
from app.services.reports import ReportService


def _dt(days_offset: int) -> datetime:
    return datetime.now(timezone.utc) - timedelta(days=days_offset)


def test_report_overview_timeseries(session):
    # Prepare two days of data
    a = Activity(title="TS 活动", status=ActivityStatus.PUBLISHED)
    u = UserProfile(openid="ts-user", name="TS用户")
    s1 = Signup(activity=a, user=u, status=SignupStatus.APPROVED, checkin_status=CheckinStatus.CHECKED_IN)
    s1.created_at = _dt(1)
    s1.approved_at = _dt(1)
    s1.checkin_time = _dt(1)

    # engagements/feedback
    fav = ActivityFavorite(activity=a, user=u)
    fav.created_at = _dt(0)
    like = ActivityLike(activity=a, user=u)
    like.created_at = _dt(0)
    share = ActivityShare(activity=a, user=u, channel="weapp")
    share.created_at = _dt(1)
    comment = ActivityComment(activity=a, user=u, content="不错")
    comment.created_at = _dt(1)
    fb = ActivityFeedback(activity=a, user=u, rating=5, comment="很好")
    fb.created_at = _dt(1)

    session.add_all([a, u, s1, fav, like, share, comment, fb])
    session.flush()

    service = ReportService(session)
    data = service.overview(days=2)
    assert "time_series" in data
    series = data["time_series"]
    # Should contain 2 days
    assert len(series) == 2
    # Basic fields present
    for point in series:
        assert {"date", "signups", "approvals", "checkins", "feedbacks", "favorites", "likes", "shares", "comments"}.issubset(
            set(point.keys())
        )


def test_activity_report_timeseries(session):
    a = Activity(title="TS 活动2", status=ActivityStatus.PUBLISHED)
    u = UserProfile(openid="ts-user2", name="TS用户2")
    s1 = Signup(activity=a, user=u, status=SignupStatus.APPROVED, checkin_status=CheckinStatus.NOT_CHECKED_IN)
    s1.created_at = _dt(0)
    s1.approved_at = _dt(0)

    session.add_all([a, u, s1])
    session.flush()

    service = ReportService(session)
    data = service.activity_report(a.id, days=1)
    assert data["activity_id"] == a.id
    assert "time_series" in data
    assert len(data["time_series"]) == 1
