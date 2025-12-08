from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import select

from app.models.activity import Activity
from app.models.enums import (
    ActivityStatus,
    AuditAction,
    CheckinStatus,
    NotificationChannel,
    NotificationEvent,
    NotificationStatus,
    SignupStatus,
)
from app.models.audit import AuditLog
from app.models.notification import NotificationLog
from app.models.signup import Signup
from app.models.user import UserProfile
from app.services.notifications import NotificationService
from app.services.notification_senders import NotificationContext, NotificationSender


def test_notification_enqueue_auto_sends(session):
    user = UserProfile(openid="notif-user", name="通知用户")
    session.add(user)
    session.flush()

    service = NotificationService(session)
    log = service.enqueue(
        user_id=user.id,
        activity_id=None,
        signup_id=None,
        channel=NotificationChannel.WECHAT,
        event=NotificationEvent.SIGNUP_SUBMITTED,
        payload={"template": "signup"},
    )

    assert log.status == NotificationStatus.SENT
    assert log.sent_at is not None

    logs = session.execute(select(NotificationLog)).scalars().all()
    assert len(logs) == 1
    assert logs[0].status == NotificationStatus.SENT
    audit_logs = session.execute(select(AuditLog)).scalars().all()
    assert any(log.action == AuditAction.NOTIFICATION_SENT for log in audit_logs)


def test_notification_dispatch_pending(session):
    user = UserProfile(openid="notif-scheduled", name="通知用户2")
    session.add(user)
    session.flush()

    service = NotificationService(session)
    log = service.enqueue(
        user_id=user.id,
        activity_id=None,
        signup_id=None,
        channel=NotificationChannel.WECHAT,
        event=NotificationEvent.SIGNUP_SUBMITTED,
        scheduled_send_at=datetime.now(timezone.utc) + timedelta(minutes=5),
    )
    assert log.status == NotificationStatus.PENDING

    log.scheduled_send_at = datetime.now(timezone.utc) - timedelta(seconds=1)
    session.add(log)
    session.flush()

    dispatched = service.dispatch_pending(limit=10)
    assert dispatched == 1
    assert log.status == NotificationStatus.SENT


def test_notification_mark_failed_increments_retry(session):
    user = UserProfile(openid="notif-fail", name="通知失败用户")
    session.add(user)
    session.flush()

    service = NotificationService(session)
    log = service.enqueue(
        user_id=user.id,
        activity_id=None,
        signup_id=None,
        channel=NotificationChannel.WECHAT,
        event=NotificationEvent.SIGNUP_APPROVED,
    )

    service.mark_failed(log, "network error")
    assert log.status == NotificationStatus.FAILED
    assert log.retry_count == 1
    assert log.error_message == "network error"
    assert log.sent_at is None

    service.mark_failed(log, "still failing")
    assert log.retry_count == 2
    assert log.error_message == "still failing"


class FailingSender(NotificationSender):
    def send(self, context: NotificationContext) -> None:  # pragma: no cover - executed in test
        raise RuntimeError("fail to send")


def test_notification_sender_failure_marks_failed(session):
    user = UserProfile(openid="notif-failure", name="失败用户")
    session.add(user)
    session.flush()

    service = NotificationService(
        session,
        senders={NotificationChannel.WECHAT: FailingSender()},
    )

    log = service.enqueue(
        user_id=user.id,
        activity_id=None,
        signup_id=None,
        channel=NotificationChannel.WECHAT,
        event=NotificationEvent.SIGNUP_REJECTED,
    )

    assert log.status == NotificationStatus.FAILED
    assert log.retry_count == 1
    assert log.error_message == "fail to send"
    assert log.sent_at is None
    audit_entries = session.execute(select(AuditLog)).scalars().all()
    assert any(entry.action == AuditAction.NOTIFICATION_SENT and entry.context.get("error") == "fail to send" for entry in audit_entries)


def test_notification_preview(session):
    activity = Activity(title="预览活动", status=ActivityStatus.PUBLISHED)
    user = UserProfile(openid="preview-user", name="预览用户")
    signup = Signup(
        activity=activity,
        user=user,
        status=SignupStatus.APPROVED,
        checkin_status=CheckinStatus.NOT_CHECKED_IN,
    )
    session.add_all([activity, user, signup])
    session.flush()

    service = NotificationService(session)
    preview = service.preview(
        channel=NotificationChannel.WECHAT,
        event=NotificationEvent.SIGNUP_APPROVED,
        signup_id=signup.id,
        payload={"template": "approved"},
    )

    assert preview["user"]["id"] == user.id
    assert preview["activity"]["id"] == activity.id
    assert preview["signup"]["id"] == signup.id

    with pytest.raises(ValueError, match="signup_not_found"):
        service.preview(
            channel=NotificationChannel.WECHAT,
            event=NotificationEvent.SIGNUP_APPROVED,
            signup_id=999,
        )
