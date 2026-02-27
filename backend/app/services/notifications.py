"""Notification service for logging delivery events and dispatching."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.activity import Activity
from app.models.enums import AuditAction, AuditEntity, NotificationChannel, NotificationEvent, NotificationStatus
from app.models.notification import NotificationLog
from app.models.signup import Signup
from app.models.user import UserProfile
from app.repositories.notifications import NotificationRepository
from app.services.notification_senders import NotificationContext, NotificationSender, create_sender
from app.services.audit import AuditLogService


class NotificationService:
    def __init__(self, session: Session, *, senders: dict[NotificationChannel, NotificationSender] | None = None) -> None:
        self.repo = NotificationRepository(session)
        self.session = session
        self.settings = get_settings()
        self.audit = AuditLogService(session)
        self._senders = senders or self._build_senders_from_settings()
        self._default_sender = create_sender("mock")

    def _get_sender(self, channel: NotificationChannel) -> NotificationSender:
        return self._senders.get(channel) or self._default_sender

    def _build_senders_from_settings(self) -> dict[NotificationChannel, NotificationSender]:
        mapping: dict[NotificationChannel, NotificationSender] = {}
        channel_map = {
            NotificationChannel.WECHAT: self.settings.notification_sender_wechat,
            NotificationChannel.EMAIL: self.settings.notification_sender_email,
            NotificationChannel.SMS: self.settings.notification_sender_sms,
        }
        for channel, kind in channel_map.items():
            try:
                mapping[channel] = create_sender(kind)
            except ValueError:
                mapping[channel] = create_sender("mock")
        return mapping

    def _should_send_now(self, log: NotificationLog) -> bool:
        if log.scheduled_send_at and log.scheduled_send_at > datetime.now(timezone.utc):
            return False
        return True

    def _deliver(self, log: NotificationLog) -> NotificationLog:
        if log.status == NotificationStatus.SENT:
            return log
        if not self._should_send_now(log):
            return log

        self.repo.mark_status(log, NotificationStatus.SENDING)

        context = NotificationContext(
            channel=log.channel,
            event=log.event,
            user_id=log.user_id,
            activity_id=log.activity_id,
            signup_id=log.signup_id,
            payload=log.payload,
        )
        sender = self._get_sender(log.channel)
        try:
            sender.send(context)
        except Exception as exc:  # pragma: no cover - unexpected sender failure
            self.mark_failed(log, str(exc))
            return log
        else:
            self.mark_sent(log)
            return log

    def enqueue(
        self,
        *,
        user_id: Optional[int],
        activity_id: Optional[int],
        signup_id: Optional[int],
        channel: NotificationChannel,
        event: NotificationEvent,
        payload: Optional[dict[str, Any]] = None,
        scheduled_send_at: Optional[datetime] = None,
    ) -> NotificationLog:
        data = {
            "user_id": user_id,
            "activity_id": activity_id,
            "signup_id": signup_id,
            "channel": channel,
            "event": event,
            "payload": payload,
            "scheduled_send_at": scheduled_send_at,
            "status": NotificationStatus.PENDING,
        }
        log = self.repo.create(data)
        if self._should_send_now(log):
            self._deliver(log)
        return log

    def mark_sent(self, log: NotificationLog) -> NotificationLog:
        log.sent_at = datetime.now(timezone.utc)
        log = self.repo.mark_status(log, NotificationStatus.SENT)
        self.audit.record(
            action=AuditAction.NOTIFICATION_SENT,
            entity_type=AuditEntity.NOTIFICATION,
            entity_id=log.id,
            actor_admin_id=None,
            actor_user_id=log.user_id,
            context={
                "channel": log.channel.value,
                "event": log.event.value,
                "status": log.status.value,
            },
        )
        return log

    def mark_failed(self, log: NotificationLog, error: str) -> NotificationLog:
        log.sent_at = None
        log.retry_count += 1
        log = self.repo.mark_status(log, NotificationStatus.FAILED, error=error)
        self.audit.record(
            action=AuditAction.NOTIFICATION_SENT,
            entity_type=AuditEntity.NOTIFICATION,
            entity_id=log.id,
            actor_admin_id=None,
            actor_user_id=log.user_id,
            context={
                "channel": log.channel.value,
                "event": log.event.value,
                "status": log.status.value,
                "error": error,
            },
        )
        return log

    def list_logs(self, *, user_id: Optional[int] = None, limit: Optional[int] = None) -> list[NotificationLog]:
        return list(self.repo.list(user_id=user_id, limit=limit))

    def preview(
        self,
        *,
        channel: NotificationChannel,
        event: NotificationEvent,
        user_id: Optional[int] = None,
        activity_id: Optional[int] = None,
        signup_id: Optional[int] = None,
        payload: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        signup: Signup | None = None
        user: UserProfile | None = None
        activity: Activity | None = None
        if signup_id is not None:
            signup = self.session.get(Signup, signup_id)
            if not signup:
                raise ValueError("signup_not_found")
            if user_id is None:
                user_id = signup.user_id
            if activity_id is None:
                activity_id = signup.activity_id
        if user_id is not None:
            user = self.session.get(UserProfile, user_id)
            if not user:
                raise ValueError("user_not_found")
        if activity_id is not None:
            activity = self.session.get(Activity, activity_id)
            if not activity:
                raise ValueError("activity_not_found")
        if signup and activity_id is not None and signup.activity_id != activity_id:
            raise ValueError("signup_activity_mismatch")
        if signup and user_id is not None and signup.user_id != user_id:
            raise ValueError("signup_user_mismatch")
        return {
            "channel": channel,
            "event": event,
            "payload": payload,
            "user": {"id": user.id, "name": user.name} if user else None,
            "activity": {"id": activity.id, "title": activity.title} if activity else None,
            "signup": {
                "id": signup.id,
                "status": signup.status,
                "checkin_status": signup.checkin_status,
            }
            if signup
            else None,
        }

    def delete_notification(self, notification_id: int, *, user_id: int) -> bool:
        return self.repo.delete_one(notification_id, user_id=user_id)

    def batch_delete(self, notification_ids: list[int], *, user_id: int) -> int:
        return self.repo.delete_batch(notification_ids, user_id=user_id)

    def delete_all_for_user(self, user_id: int) -> int:
        return self.repo.delete_all_for_user(user_id)

    def mark_all_read(self, user_id: int) -> int:
        return self.repo.mark_all_read(user_id)

    def dispatch_pending(self, *, limit: int = 50) -> int:
        now = datetime.now(timezone.utc)
        logs = self.repo.list_pending(limit=limit, now=now)
        dispatched = 0
        for log in logs:
            self._deliver(log)
            dispatched += 1
        return dispatched
