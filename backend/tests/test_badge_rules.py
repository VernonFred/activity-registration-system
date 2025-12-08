import pytest

from app.models.activity import Activity
from app.models.enums import ActivityStatus, SignupStatus
from app.models.user import UserProfile
from app.schemas.badge_rule import BadgeRuleCreate, BadgeRulePreviewRequest
from app.schemas.signup import SignupCreate, SignupReviewRequest
from app.services.badge_rules import BadgeRuleService
from app.services.badges import BadgeService
from app.services.checkins import CheckinService
from app.services.signups import SignupService


def setup_user_activity(session):
    activity = Activity(title="规则活动", status=ActivityStatus.PUBLISHED)
    user = UserProfile(openid="rule-user", name="规则用户")
    session.add_all([activity, user])
    session.flush()
    return activity, user


def test_badge_rule_first_approved(session, admin_user):
    activity, user = setup_user_activity(session)

    badge_service = BadgeService(session)
    badge = badge_service.create_badge(code="auto_first_rule", name="规则-首次")

    rule_service = BadgeRuleService(session)
    rule_service.create_rule(
        BadgeRuleCreate(name="首次审批", rule_type="first_approved", badge_id=badge.id)
    )

    signup_service = SignupService(session)
    signup = signup_service.create(SignupCreate(activity_id=activity.id, answers=[], extra=None), user_id=user.id)
    signup_service.review(
        signup_id=signup.id,
        admin=admin_user,
        payload=SignupReviewRequest(action="approve", message="通过"),
    )

    user_badges = badge_service.list_user_badges(user.id)
    assert any(b.badge.code == "auto_first_rule" for b in user_badges)


def test_badge_rule_total_checked_in(session, admin_user):
    activity, user = setup_user_activity(session)

    badge_service = BadgeService(session)
    badge = badge_service.create_badge(code="auto_checkin_rule", name="规则-签到")

    rule_service = BadgeRuleService(session)
    rule_service.create_rule(
        BadgeRuleCreate(name="累计签到", rule_type="total_checked_in", badge_id=badge.id, threshold=1)
    )

    # 先审批通过
    signup_service = SignupService(session)
    signup = signup_service.create(SignupCreate(activity_id=activity.id, answers=[], extra=None), user_id=user.id)
    signup_service.review(
        signup_id=signup.id,
        admin=admin_user,
        payload=SignupReviewRequest(action="approve", message="通过"),
    )

    # 设置签到 token 并签到
    activity.checkin_token = "T123"
    session.add(activity)
    session.flush()

    checkin = CheckinService(session)
    checkin.checkin(signup.id, token="T123")

    user_badges = badge_service.list_user_badges(user.id)
    assert any(b.badge.code == "auto_checkin_rule" for b in user_badges)


def test_badge_rule_activity_tag_attendance(session, admin_user):
    # Two activities under same tag series
    a1 = Activity(title="系列A-1", status=ActivityStatus.PUBLISHED)
    a1.tags = ["系列A"]
    a2 = Activity(title="系列A-2", status=ActivityStatus.PUBLISHED)
    a2.tags = ["系列A"]
    user = UserProfile(openid="tag-user", name="标签用户")
    session.add_all([a1, a2, user])
    session.flush()

    badge_service = BadgeService(session)
    badge = badge_service.create_badge(code="auto_tag_rule", name="规则-系列A")

    rule_service = BadgeRuleService(session)
    rule_service.create_rule(
        BadgeRuleCreate(
            name="系列A徽章",
            rule_type="activity_tag_attendance",
            badge_id=badge.id,
            threshold=2,
            activity_tag_scope=["系列A"],
        )
    )

    signup_service = SignupService(session)
    # Approve first activity (should not yet award)
    s1 = signup_service.create(SignupCreate(activity_id=a1.id, answers=[], extra=None), user_id=user.id)
    signup_service.review(s1.id, admin=admin_user, payload=SignupReviewRequest(action="approve", message="ok"))
    user_badges = badge_service.list_user_badges(user.id)
    assert not any(b.badge.code == "auto_tag_rule" for b in user_badges)

    # Approve second activity in the same tag series (should award)
    s2 = signup_service.create(SignupCreate(activity_id=a2.id, answers=[], extra=None), user_id=user.id)
    signup_service.review(s2.id, admin=admin_user, payload=SignupReviewRequest(action="approve", message="ok"))
    user_badges = badge_service.list_user_badges(user.id)
    assert any(b.badge.code == "auto_tag_rule" for b in user_badges)
