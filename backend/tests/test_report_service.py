from app.models.activity import Activity
from app.models.enums import ActivityStatus, CheckinStatus, SignupStatus
from app.models.signup import Signup
from app.models.user import UserProfile
from app.services.reports import ReportService


def create_sample_data(session):
    activity = Activity(title="统计活动", status=ActivityStatus.PUBLISHED)
    user = UserProfile(openid="report-user", name="报告用户")
    signup = Signup(
        activity=activity,
        user=user,
        status=SignupStatus.APPROVED,
        checkin_status=CheckinStatus.CHECKED_IN,
    )
    session.add_all([activity, user, signup])
    session.flush()
    return signup


def test_report_overview(session):
    create_sample_data(session)
    service = ReportService(session)

    overview = service.overview()

    assert overview["total_signups"] >= 1
    assert overview["approved_signups"] >= 1
    assert overview["checked_in_signups"] >= 1
    assert "approval_rate" in overview
    assert "checkin_rate" in overview
    assert "average_rating" in overview
    assert "total_favorites" in overview
    assert "total_likes" in overview
    assert "total_shares" in overview
    assert "total_comments" in overview
