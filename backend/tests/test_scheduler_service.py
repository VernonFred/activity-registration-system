from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from app.models.audit import AuditLog
from app.models.enums import AuditAction, NotificationChannel, NotificationEvent, NotificationStatus
from app.models.user import UserProfile
from app.models.notification import NotificationLog
from app.services.notifications import NotificationService
from app.services.scheduler import SchedulerService


def test_scheduler_runs_notification_dispatch(session):
    # create a pending notification scheduled in the future
    user = UserProfile(openid="sched-user", name="调度用户")
    session.add(user)
    session.flush()

    notif = NotificationService(session)
    log = notif.enqueue(
        user_id=user.id,
        activity_id=None,
        signup_id=None,
        channel=NotificationChannel.WECHAT,
        event=NotificationEvent.SIGNUP_REMINDER,
        scheduled_send_at=datetime.now(timezone.utc) + timedelta(minutes=2),
    )
    assert log.status == NotificationStatus.PENDING

    # make it due
    log.scheduled_send_at = datetime.now(timezone.utc) - timedelta(seconds=1)
    session.add(log)
    session.flush()

    scheduler = SchedulerService(session)
    scheduler.register_defaults()
    results = scheduler.run_due()

    assert any(r["task"] == "notifications_dispatch" for r in results)
    # the pending one should be sent now
    logs = session.execute(select(NotificationLog)).scalars().all()
    assert any(l.status == NotificationStatus.SENT for l in logs)

    audits = session.execute(select(AuditLog)).scalars().all()
    assert any(a.action == AuditAction.TASK_RUN and a.context.get("task") == "notifications_dispatch" for a in audits)


def test_scheduler_logs_failure(session):
    # register a failing task
    scheduler = SchedulerService(session)

    def boom():
        raise RuntimeError("boom")

    scheduler.register(name="failing_task", func=boom, interval_seconds=60)
    scheduler.run_due()

    audits = session.execute(select(AuditLog)).scalars().all()
    assert any(
        a.action == AuditAction.TASK_RUN and a.context.get("task") == "failing_task" and a.context.get("status") == "failed"
        for a in audits
    )

