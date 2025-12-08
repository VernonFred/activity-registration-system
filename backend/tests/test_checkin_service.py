from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import select

from app.models.activity import Activity
from app.models.enums import (
    ActivityStatus,
    CheckinStatus,
    NotificationChannel,
    NotificationEvent,
    SignupStatus,
)
from app.models.notification import NotificationLog
from app.models.signup import Signup
from app.models.user import UserProfile
from app.services.checkins import CheckinService
from app.services.badges import BadgeService


def create_signup(session, *, status: SignupStatus) -> Signup:
    activity = Activity(
        title="活动",
        status=ActivityStatus.PUBLISHED,
        checkin_token="VALIDTOKEN",
        checkin_token_expires_at=datetime.now(timezone.utc) + timedelta(minutes=30),
    )
    user = UserProfile(openid="checkin-user", name="签到用户")
    signup = Signup(
        activity=activity,
        user=user,
        status=status,
        checkin_status=CheckinStatus.NOT_CHECKED_IN,
    )
    session.add_all([activity, user, signup])
    session.flush()
    return signup


def test_checkin_success_creates_log(session):
    signup = create_signup(session, status=SignupStatus.APPROVED)
    service = CheckinService(session)

    result = service.checkin(signup.id, token="VALIDTOKEN")

    assert result.checkin_status == CheckinStatus.CHECKED_IN
    assert result.checkin_time is not None

    logs = session.execute(select(NotificationLog)).scalars().all()
    assert len(logs) == 1
    assert logs[0].channel == NotificationChannel.WECHAT
    assert logs[0].event == NotificationEvent.CHECKIN_REMINDER


def test_checkin_rejects_invalid_token(session):
    signup = create_signup(session, status=SignupStatus.APPROVED)
    service = CheckinService(session)

    with pytest.raises(ValueError, match="invalid_checkin_token"):
        service.checkin(signup.id, token="WRONG")


def test_checkin_requires_approved_status(session):
    signup = create_signup(session, status=SignupStatus.PENDING)
    service = CheckinService(session)

    with pytest.raises(ValueError, match="signup_not_approved"):
        service.checkin(signup.id, token="VALIDTOKEN")


def test_checkin_force_allows_recheck(session):
    signup = create_signup(session, status=SignupStatus.APPROVED)
    service = CheckinService(session)
    service.checkin(signup.id, token="VALIDTOKEN")

    # Second attempt would normally fail without force
    with pytest.raises(ValueError, match="already_checked_in"):
        service.checkin(signup.id, token="VALIDTOKEN")

    forced = service.checkin(signup.id, token="WRONG", force=True)
    assert forced.checkin_status == CheckinStatus.CHECKED_IN


def test_auto_award_badge_on_checkin(session):
    signup = create_signup(session, status=SignupStatus.APPROVED)
    badge_service = BadgeService(session)
    badge_service.create_badge(code="checkin_complete", name="完成签到")

    service = CheckinService(session)
    service.checkin(signup.id, token="VALIDTOKEN")

    badges = badge_service.list_user_badges(signup.user_id)
    assert any(b.badge.code == "checkin_complete" for b in badges)
