from sqlalchemy import select

from app.models.activity import Activity
from app.models.audit import AuditLog
from app.models.enums import ActivityStatus, CheckinStatus, SignupStatus, AuditAction, AuditEntity
from app.models.user import UserProfile
from app.schemas.signup import SignupCreate, SignupReviewRequest
from app.services.signups import SignupService
from app.services.badges import BadgeService


def create_activity_and_user(session):
    activity = Activity(title="测试活动", status=ActivityStatus.PUBLISHED)
    session.add(activity)
    session.flush()

    user = UserProfile(openid="test-user", name="测试老师")
    session.add(user)
    session.flush()

    return activity, user


def test_review_signup(session, admin_user):
    activity, user = create_activity_and_user(session)
    service = SignupService(session)

    signup = service.create(
        SignupCreate(activity_id=activity.id, answers=[], extra=None),
        user_id=user.id,
    )
    assert signup.status == SignupStatus.PENDING

    approved = service.review(
        signup_id=signup.id,
        admin=admin_user,
        payload=SignupReviewRequest(action="approve", message="欢迎参加"),
    )
    assert approved is not None
    assert approved.status == SignupStatus.APPROVED
    assert approved.reviewed_by_admin_id == admin_user.id
    assert approved.approval_remark == "欢迎参加"

    # Attempt to re-review should keep status unchanged
    repeated = service.review(
        signup_id=signup.id,
        admin=admin_user,
        payload=SignupReviewRequest(action="reject", message="不会更新"),
    )
    assert repeated.status == SignupStatus.APPROVED

    logs = session.execute(select(AuditLog)).scalars().all()
    assert any(
        log.action == AuditAction.SIGNUP_REVIEWED
        and log.entity_type == AuditEntity.SIGNUP
        and log.entity_id == signup.id
    for log in logs)


def test_reject_signup(session, admin_user):
    activity, user = create_activity_and_user(session)
    service = SignupService(session)

    signup = service.create(
        SignupCreate(activity_id=activity.id, answers=[], extra=None),
        user_id=user.id,
    )

    rejected = service.review(
        signup_id=signup.id,
        admin=admin_user,
        payload=SignupReviewRequest(action="reject", message="名额已满"),
    )
    assert rejected.status == SignupStatus.REJECTED
    assert rejected.rejection_reason == "名额已满"
    assert rejected.approval_remark is None


def test_activity_stats_and_checkin_filters(session, admin_user):
    activity, user = create_activity_and_user(session)
    activity.checkin_token = "FORCE_TOKEN"
    session.add(activity)
    session.flush()
    service = SignupService(session)

    pending = service.create(SignupCreate(activity_id=activity.id, answers=[], extra=None), user_id=user.id)

    approved_user = UserProfile(openid="user-approved", name="已审批用户")
    session.add(approved_user)
    session.flush()
    approved_signup = service.create(
        SignupCreate(activity_id=activity.id, answers=[], extra=None),
        user_id=approved_user.id,
    )
    service.review(
        signup_id=approved_signup.id,
        admin=admin_user,
        payload=SignupReviewRequest(action="approve", message="通过"),
    )
    service.checkin(approved_signup.id, token="FORCE_TOKEN", force=True)

    stats = service.activity_stats(activity.id)
    assert stats["total_signups"] == 2
    assert stats["status_counts"][SignupStatus.APPROVED.value] == 1
    assert stats["status_counts"][SignupStatus.PENDING.value] == 1
    assert stats["checkin_counts"][CheckinStatus.CHECKED_IN.value] == 1

    checkins = service.list(activity_id=activity.id, checkin_status=CheckinStatus.CHECKED_IN)
    assert len(checkins) == 1
    assert checkins[0].id == approved_signup.id


def test_auto_award_badge_on_first_approval(session, admin_user):
    activity, user = create_activity_and_user(session)
    badge_service = BadgeService(session)
    badge_service.create_badge(code="first_attendance", name="首次参会")

    service = SignupService(session)
    signup = service.create(
        SignupCreate(activity_id=activity.id, answers=[], extra=None),
        user_id=user.id,
    )

    service.review(
        signup_id=signup.id,
        admin=admin_user,
        payload=SignupReviewRequest(action="approve", message="欢迎"),
    )

    user_badges = badge_service.list_user_badges(user.id)
    assert any(b.badge.code == "first_attendance" for b in user_badges)


def test_auto_award_badge_on_repeat_attendance(session, admin_user):
    activity, user = create_activity_and_user(session)
    badge_service = BadgeService(session)
    badge_service.create_badge(code="repeat_attendance", name="多次参会")

    service = SignupService(session)

    for idx in range(3):
        act = Activity(title=f"活动{idx}", status=ActivityStatus.PUBLISHED)
        session.add(act)
        session.flush()
        signup = service.create(
            SignupCreate(activity_id=act.id, answers=[], extra=None),
            user_id=user.id,
        )
        service.review(
            signup_id=signup.id,
            admin=admin_user,
            payload=SignupReviewRequest(action="approve", message="ok"),
        )

    badges = badge_service.list_user_badges(user.id)
    assert any(b.badge.code == "repeat_attendance" for b in badges)
