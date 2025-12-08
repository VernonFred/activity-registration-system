"""Notification repository."""

from __future__ import annotations

from typing import Optional, Sequence

from datetime import datetime

from sqlalchemy import Select, select, or_
from sqlalchemy.orm import Session

from app.models.enums import NotificationStatus
from app.models.notification import NotificationLog


class NotificationRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def _base_query(self) -> Select:
        return select(NotificationLog)

    def create(self, data: dict) -> NotificationLog:
        log = NotificationLog(**data)
        self.session.add(log)
        self.session.flush()
        return log

    def list(self, *, user_id: Optional[int] = None, limit: Optional[int] = None) -> Sequence[NotificationLog]:
        query = self._base_query()
        if user_id is not None:
            query = query.where(NotificationLog.user_id == user_id)
        query = query.order_by(NotificationLog.created_at.desc())
        if limit:
            query = query.limit(limit)
        return self.session.execute(query).scalars().all()

    def list_pending(self, *, limit: int, now: datetime) -> Sequence[NotificationLog]:
        query = (
            self._base_query()
            .where(
                NotificationLog.status == NotificationStatus.PENDING,
                or_(NotificationLog.scheduled_send_at.is_(None), NotificationLog.scheduled_send_at <= now),
            )
            .order_by(NotificationLog.created_at.asc())
            .limit(limit)
        )
        return self.session.execute(query).scalars().all()

    def get(self, notification_id: int) -> NotificationLog | None:
        return self.session.get(NotificationLog, notification_id)

    def mark_status(
        self,
        log: NotificationLog,
        status: NotificationStatus,
        *,
        error: str | None = None,
    ) -> NotificationLog:
        log.status = status
        if error:
            log.error_message = error
        elif status != NotificationStatus.FAILED:
            log.error_message = None
        self.session.add(log)
        self.session.flush()
        return log
