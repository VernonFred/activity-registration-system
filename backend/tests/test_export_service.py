from sqlalchemy import select

from app.models.activity import Activity
from app.models.audit import AuditLog
from app.models.enums import ActivityStatus, AuditAction, AuditEntity, CheckinStatus, SignupStatus
from app.models.signup import Signup
from app.models.user import UserProfile
import csv
import io

from app.services.exports import ExportService
from app.services.engagements import ActivityEngagementService
from app.services.feedbacks import ActivityFeedbackService
from app.schemas.engagement import ActivityShareRequest, ActivityCommentCreate
from app.schemas.feedback import ActivityFeedbackSubmit


def create_signup(session):
    activity = Activity(title="导出活动", status=ActivityStatus.PUBLISHED)
    user = UserProfile(openid="export-user", name="导出用户")
    signup = Signup(
        activity=activity,
        user=user,
        status=SignupStatus.APPROVED,
        checkin_status=CheckinStatus.CHECKED_IN,
    )
    session.add_all([activity, user, signup])
    session.flush()
    return activity, user, signup


def test_activity_signups_csv(session, admin_user):
    activity, user, signup = create_signup(session)
    service = ExportService(session)

    engagement_service = ActivityEngagementService(session)
    engagement_service.favorite(activity_id=activity.id, user_id=user.id)
    engagement_service.like(activity_id=activity.id, user_id=user.id)
    engagement_service.share(
        activity_id=activity.id,
        user_id=user.id,
        payload=ActivityShareRequest(channel="wechat"),
    )
    engagement_service.create_comment(
        activity_id=activity.id,
        user_id=user.id,
        payload=ActivityCommentCreate(content="期待活动"),
    )

    feedback_service = ActivityFeedbackService(session)
    feedback_service.submit_feedback(
        user_id=user.id,
        activity_id=activity.id,
        payload=ActivityFeedbackSubmit(rating=5, comment="很棒", is_public=True),
    )

    result = service.activity_signups_csv(activity.id, actor_admin_id=admin_user.id)
    assert result is not None
    filename, content = result

    assert filename.startswith(f"activity_{activity.id}")
    csv_text = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(csv_text))
    rows = list(reader)
    assert len(rows) == 1
    row = rows[0]
    assert row["signup_id"] == str(signup.id)
    assert row["user_name"] == user.name
    assert row["feedback_rating"] == "5"
    assert row["feedback_comment"] == "很棒"
    assert row["is_favorited"] == "yes"
    assert row["is_liked"] == "yes"
    assert row["user_share_count"] == "1"
    assert row["user_comment_count"] == "1"

    logs = session.execute(select(AuditLog)).scalars().all()
    assert any(
        log.action == AuditAction.EXPORT_SIGNUPS
        and log.entity_type == AuditEntity.ACTIVITY
        and log.entity_id == activity.id
        and log.actor_admin_id == admin_user.id
    for log in logs)


def test_activity_comments_and_shares_export(session, admin_user):
    activity, user, _ = create_signup(session)
    engagement_service = ActivityEngagementService(session)
    engagement_service.create_comment(
        activity_id=activity.id,
        user_id=user.id,
        payload=ActivityCommentCreate(content="期待活动"),
    )
    engagement_service.share(
        activity_id=activity.id,
        user_id=user.id,
        payload=ActivityShareRequest(channel="moments"),
    )

    service = ExportService(session)

    comments_file = service.activity_comments_csv(activity.id, actor_admin_id=admin_user.id)
    assert comments_file is not None
    _, comments_bytes = comments_file
    assert "期待活动" in comments_bytes.decode("utf-8-sig")

    shares_file = service.activity_shares_csv(activity.id, actor_admin_id=admin_user.id)
    assert shares_file is not None
    _, shares_bytes = shares_file
    assert "moments" in shares_bytes.decode("utf-8-sig")
