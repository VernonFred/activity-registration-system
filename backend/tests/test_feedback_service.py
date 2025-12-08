import pytest

from app.models.activity import Activity
from app.models.enums import ActivityStatus, CheckinStatus, SignupStatus
from app.models.signup import Signup
from app.models.user import UserProfile
from app.schemas.feedback import ActivityFeedbackSubmit
from app.services.feedbacks import ActivityFeedbackService


def create_checked_in_signup(session):
    activity = Activity(title="反馈活动", status=ActivityStatus.PUBLISHED)
    user = UserProfile(openid="feedback-user", name="反馈用户")
    signup = Signup(
        activity=activity,
        user=user,
        status=SignupStatus.APPROVED,
        checkin_status=CheckinStatus.CHECKED_IN,
    )
    session.add_all([activity, user, signup])
    session.flush()
    return activity, user, signup


def test_submit_feedback_success(session):
    activity, user, _ = create_checked_in_signup(session)
    service = ActivityFeedbackService(session)

    feedback = service.submit_feedback(
        user_id=user.id,
        activity_id=activity.id,
        payload=ActivityFeedbackSubmit(rating=5, comment="很好", is_public=True),
    )

    assert feedback.rating == 5
    assert feedback.comment == "很好"

    # Update existing feedback
    updated = service.submit_feedback(
        user_id=user.id,
        activity_id=activity.id,
        payload=ActivityFeedbackSubmit(rating=4, comment="还不错", is_public=False),
    )
    assert updated.rating == 4
    assert updated.is_public is False

    stats = service.aggregate(activity.id)
    assert stats["average_rating"] == 4.0
    assert stats["total_feedbacks"] == 1


def test_submit_feedback_requires_checkin(session):
    activity = Activity(title="未签到", status=ActivityStatus.PUBLISHED)
    user = UserProfile(openid="pending-user", name="未签到用户")
    signup = Signup(
        activity=activity,
        user=user,
        status=SignupStatus.APPROVED,
        checkin_status=CheckinStatus.NOT_CHECKED_IN,
    )
    session.add_all([activity, user, signup])
    session.flush()

    service = ActivityFeedbackService(session)

    with pytest.raises(ValueError, match="signup_not_checked_in"):
        service.submit_feedback(
            user_id=user.id,
            activity_id=activity.id,
            payload=ActivityFeedbackSubmit(rating=5, comment="想评价", is_public=True),
        )


def test_submit_feedback_invalid_rating(session):
    activity, user, _ = create_checked_in_signup(session)
    service = ActivityFeedbackService(session)

    with pytest.raises(ValueError, match="invalid_rating"):
        service.submit_feedback(
            user_id=user.id,
            activity_id=activity.id,
            payload=ActivityFeedbackSubmit(rating=6, comment="无效", is_public=True),
        )
