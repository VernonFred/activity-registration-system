"""A minimal in-process scheduler facade for periodic jobs.

This is intentionally simple so it can later be swapped for APScheduler/Celery.
It does not spawn background threads; callers should invoke `run_due()` from
an external trigger (e.g., cron or management endpoint).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Callable, Optional

from sqlalchemy.orm import Session

from app.models.enums import AuditAction, AuditEntity
from app.services.audit import AuditLogService
from app.services.notifications import NotificationService


TaskFunc = Callable[[], int | None]


@dataclass
class ScheduledTask:
    name: str
    func: TaskFunc
    interval_seconds: int
    enabled: bool = True
    last_run_at: Optional[datetime] = None
    next_run_at: Optional[datetime] = None

    def schedule_next(self, now: datetime) -> None:
        self.last_run_at = now
        self.next_run_at = now + timedelta(seconds=self.interval_seconds)


class SchedulerService:
    """Register and run lightweight periodic tasks."""

    def __init__(self, session: Session) -> None:
        self.session = session
        self.audit = AuditLogService(session)
        self._tasks: dict[str, ScheduledTask] = {}

    def register(self, name: str, func: TaskFunc, *, interval_seconds: int) -> None:
        task = ScheduledTask(name=name, func=func, interval_seconds=interval_seconds)
        # schedule initial run immediately
        task.next_run_at = datetime.now(timezone.utc)
        self._tasks[name] = task

    def register_defaults(self) -> None:
        """Register built-in periodic tasks used by the system."""
        notif = NotificationService(self.session)
        self.register(
            name="notifications_dispatch",
            func=lambda: notif.dispatch_pending(limit=100),
            interval_seconds=60,
        )

    def due_tasks(self, *, now: Optional[datetime] = None) -> list[ScheduledTask]:
        now = now or datetime.now(timezone.utc)
        return [t for t in self._tasks.values() if t.enabled and (t.next_run_at is None or t.next_run_at <= now)]

    def run_due(self, *, now: Optional[datetime] = None, max_tasks: Optional[int] = None) -> list[dict]:
        now = now or datetime.now(timezone.utc)
        ran: list[dict] = []
        for task in self.due_tasks(now=now)[: max_tasks or 9999]:
            started_at = datetime.now(timezone.utc)
            status = "success"
            error: str | None = None
            affected: int | None = None
            try:
                result = task.func()
                if isinstance(result, int):
                    affected = result
            except Exception as exc:  # pragma: no cover - defensive
                status = "failed"
                error = str(exc)
            finished_at = datetime.now(timezone.utc)

            # record audit log for each run
            self.audit.record(
                action=AuditAction.TASK_RUN,
                entity_type=AuditEntity.TASK,
                description=f"run {task.name}",
                context={
                    "task": task.name,
                    "status": status,
                    "started_at": started_at.isoformat(),
                    "finished_at": finished_at.isoformat(),
                    "affected_count": affected,
                    "error": error,
                },
            )
            task.schedule_next(now)
            ran.append(
                {
                    "task": task.name,
                    "status": status,
                    "affected_count": affected,
                    "error": error,
                    "next_run_at": task.next_run_at,
                }
            )
        return ran

    def list_tasks(self) -> list[dict]:
        return [
            {
                "task": t.name,
                "enabled": t.enabled,
                "interval_seconds": t.interval_seconds,
                "last_run_at": t.last_run_at,
                "next_run_at": t.next_run_at,
            }
            for t in self._tasks.values()
        ]

