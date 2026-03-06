"""Domain service layer for activities."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Iterable, Mapping, Sequence

from sqlalchemy.orm import Session

from app.models.activity import Activity
from app.models.enums import ActivityStatus, AuditAction, AuditEntity
from app.repositories.activities import ActivityRepository
from app.schemas.activity import ActivityCreate, ActivityDetail, ActivitySummary, ActivityUpdate
from app.schemas.form_field import ActivityFormFieldCreate
from app.services.activity_helpers.form_fields import apply_form_fields
from app.services.activity_helpers.schema import to_detail_schema, to_summary_schema
from app.services.audit import AuditLogService
from app.services.exceptions import InvalidStatusTransition
from app.utils.tokens import generate_token


class ActivityService:
    """Business logic for managing activities."""

    ALLOWED_TRANSITIONS: Mapping[ActivityStatus, set[ActivityStatus]] = {
        ActivityStatus.DRAFT: {ActivityStatus.SCHEDULED, ActivityStatus.PUBLISHED, ActivityStatus.ARCHIVED},
        ActivityStatus.SCHEDULED: {ActivityStatus.PUBLISHED, ActivityStatus.CLOSED, ActivityStatus.ARCHIVED},
        ActivityStatus.PUBLISHED: {ActivityStatus.CLOSED, ActivityStatus.ARCHIVED},
        ActivityStatus.CLOSED: {ActivityStatus.ARCHIVED},
        ActivityStatus.ARCHIVED: set(),
    }

    def __init__(self, session: Session):
        self.repo = ActivityRepository(session)
        self.session = session
        self.audit = AuditLogService(session)

    def list(
        self,
        *,
        statuses: Iterable[ActivityStatus] | None = None,
        keyword: str | None = None,
        limit: int | None = None,
        offset: int | None = None,
    ) -> Sequence[ActivitySummary]:
        return [
            to_summary_schema(activity)
            for activity in self.repo.list(statuses=statuses, keyword=keyword, limit=limit, offset=offset)
        ]

    def get(self, activity_id: int) -> ActivityDetail | None:
        activity = self.repo.get(activity_id)
        return to_detail_schema(activity) if activity else None

    def create(self, payload: ActivityCreate) -> ActivityDetail:
        activity = self.repo.create(payload.model_dump(exclude={'form_fields'}))
        self._apply_status_side_effects(activity, previous_status=None)
        self._apply_form_fields(activity, payload.form_fields)
        self.session.commit()
        self.session.refresh(activity)
        return to_detail_schema(activity)

    def update(self, activity_id: int, payload: ActivityUpdate) -> ActivityDetail | None:
        activity = self.repo.get(activity_id)
        if not activity:
            return None

        current_status = activity.status
        updated = self.repo.update(activity, payload.model_dump(exclude_unset=True, exclude={'form_fields', 'status'}))
        if payload.status is not None:
            self._apply_status_transition(current_status, payload.status, updated)
        if payload.form_fields is not None:
            self._apply_form_fields(updated, payload.form_fields)
        self.session.commit()
        self.session.refresh(updated)
        return to_detail_schema(updated)

    def delete(self, activity_id: int) -> bool:
        activity = self.repo.get(activity_id)
        if not activity:
            return False
        self.repo.delete(activity)
        self.session.commit()
        return True

    def generate_checkin_token(
        self,
        activity_id: int,
        expires_minutes: int = 60,
        *,
        actor_admin_id: int | None = None,
    ) -> ActivityDetail | None:
        activity = self.repo.get(activity_id)
        if not activity:
            return None

        activity.checkin_token = generate_token(32)
        activity.checkin_token_expires_at = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
        self.session.add(activity)
        self.audit.record(
            action=AuditAction.CHECKIN_TOKEN_GENERATED,
            entity_type=AuditEntity.ACTIVITY,
            entity_id=activity.id,
            actor_admin_id=actor_admin_id,
            context={"expires_minutes": expires_minutes, "checkin_token": activity.checkin_token},
        )
        self.session.commit()
        self.session.refresh(activity)
        return to_detail_schema(activity)

    def _apply_form_fields(self, activity: Activity, form_fields: Sequence[ActivityFormFieldCreate] | None) -> None:
        apply_form_fields(self.session, activity, form_fields)

    def _apply_status_transition(self, current_status: ActivityStatus, target_status: ActivityStatus, activity: Activity) -> None:
        if current_status == target_status:
            activity.status = target_status
            self._apply_status_side_effects(activity, previous_status=current_status)
            return

        allowed = self.ALLOWED_TRANSITIONS.get(current_status, set())
        if target_status not in allowed:
            raise InvalidStatusTransition(current_status.value, target_status.value)

        activity.status = target_status
        self._apply_status_side_effects(activity, previous_status=current_status)

    def _apply_status_side_effects(self, activity: Activity, previous_status: ActivityStatus | None) -> None:
        if activity.status == ActivityStatus.PUBLISHED and not activity.publish_time:
            activity.publish_time = datetime.now(timezone.utc)
        if activity.status == ActivityStatus.CLOSED:
            activity.archive_time = None
        if activity.status == ActivityStatus.ARCHIVED:
            if not activity.publish_time:
                activity.publish_time = datetime.now(timezone.utc)
            if not activity.archive_time:
                activity.archive_time = datetime.now(timezone.utc)
        if activity.status in {ActivityStatus.DRAFT, ActivityStatus.SCHEDULED} and previous_status:
            if previous_status not in {ActivityStatus.DRAFT, ActivityStatus.SCHEDULED}:
                activity.publish_time = None
                activity.archive_time = None

    def count(self, *, statuses: Iterable[ActivityStatus] | None = None, keyword: str | None = None) -> int:
        return self.repo.count(statuses=statuses, keyword=keyword)
