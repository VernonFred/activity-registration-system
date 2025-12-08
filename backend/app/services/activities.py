"""Domain service layer for activities."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Iterable, Mapping, Sequence

from sqlalchemy.orm import Session

from app.models.activity import Activity
from app.models.enums import ActivityStatus, AuditAction, AuditEntity
from app.models.form_field import ActivityFormField, ActivityFormFieldOption
from app.repositories.activities import ActivityRepository
from app.schemas.activity import ActivityCreate, ActivityDetail, ActivitySummary, ActivityUpdate
from app.schemas.form_field import (
    ActivityFormFieldCreate,
    ActivityFormFieldOptionRead,
    ActivityFormFieldRead,
)
from app.services.exceptions import InvalidStatusTransition
from app.services.audit import AuditLogService
from app.utils.tokens import generate_token


class ActivityService:
    """Business logic for managing activities."""

    ALLOWED_TRANSITIONS: Mapping[ActivityStatus, set[ActivityStatus]] = {
        ActivityStatus.DRAFT: {
            ActivityStatus.SCHEDULED,
            ActivityStatus.PUBLISHED,
            ActivityStatus.ARCHIVED,
        },
        ActivityStatus.SCHEDULED: {
            ActivityStatus.PUBLISHED,
            ActivityStatus.CLOSED,
            ActivityStatus.ARCHIVED,
        },
        ActivityStatus.PUBLISHED: {
            ActivityStatus.CLOSED,
            ActivityStatus.ARCHIVED,
        },
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
        activities = self.repo.list(
            statuses=statuses,
            keyword=keyword,
            limit=limit,
            offset=offset,
        )
        return [self._to_summary_schema(a) for a in activities]

    def get(self, activity_id: int) -> ActivityDetail | None:
        activity = self.repo.get(activity_id)
        if not activity:
            return None
        return self._to_detail_schema(activity)

    def create(self, payload: ActivityCreate) -> ActivityDetail:
        data = payload.model_dump(exclude={"form_fields"})
        activity = self.repo.create(data)
        self._apply_status_side_effects(activity, previous_status=None)
        self._apply_form_fields(activity, payload.form_fields)
        self.session.commit()
        self.session.refresh(activity)
        return self._to_detail_schema(activity)

    def update(self, activity_id: int, payload: ActivityUpdate) -> ActivityDetail | None:
        activity = self.repo.get(activity_id)
        if not activity:
            return None
        current_status = activity.status
        data = payload.model_dump(exclude_unset=True, exclude={"form_fields", "status"})
        updated = self.repo.update(activity, data)
        if payload.status is not None:
            self._apply_status_transition(current_status, payload.status, updated)
        if payload.form_fields is not None:
            self._apply_form_fields(updated, payload.form_fields)
        self.session.commit()
        self.session.refresh(updated)
        return self._to_detail_schema(updated)

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
        activity.checkin_token_expires_at = datetime.now(timezone.utc) + timedelta(
            minutes=expires_minutes
        )
        self.session.add(activity)
        self.audit.record(
            action=AuditAction.CHECKIN_TOKEN_GENERATED,
            entity_type=AuditEntity.ACTIVITY,
            entity_id=activity.id,
            actor_admin_id=actor_admin_id,
            context={
                "expires_minutes": expires_minutes,
                "checkin_token": activity.checkin_token,
            },
        )
        self.session.commit()
        self.session.refresh(activity)
        return self._to_detail_schema(activity)

    def _apply_form_fields(
        self,
        activity: Activity,
        form_fields: Sequence[ActivityFormFieldCreate] | None,
    ) -> None:
        if form_fields is None:
            return
        # Clear current fields
        for existing in list(activity.form_fields):
            self.session.delete(existing)
        self.session.flush()

        for order, field_payload in enumerate(form_fields):
            field = ActivityFormField(
                activity_id=activity.id,
                preset_key=field_payload.preset_key,
                name=field_payload.name,
                label=field_payload.label,
                field_type=field_payload.field_type,
                placeholder=field_payload.placeholder,
                helper_text=field_payload.helper_text,
                required=field_payload.required,
                display_order=(
                    field_payload.display_order
                    if field_payload.display_order is not None
                    else order
                ),
                config=field_payload.config,
                visible=field_payload.visible,
            )

            for opt_order, option_payload in enumerate(field_payload.options):
                option = ActivityFormFieldOption(
                    label=option_payload.label,
                    value=option_payload.value,
                    display_order=(
                        option_payload.display_order
                        if option_payload.display_order is not None
                        else opt_order
                    ),
                    is_default=option_payload.is_default,
                    extra=option_payload.extra,
                )
                field.options.append(option)

            activity.form_fields.append(field)

        self.session.flush()

    def _apply_status_transition(
        self,
        current_status: ActivityStatus,
        target_status: ActivityStatus,
        activity: Activity,
    ) -> None:
        if current_status == target_status:
            activity.status = target_status
            self._apply_status_side_effects(activity, previous_status=current_status)
            return

        allowed = self.ALLOWED_TRANSITIONS.get(current_status, set())
        if target_status not in allowed:
            raise InvalidStatusTransition(current_status.value, target_status.value)

        activity.status = target_status
        self._apply_status_side_effects(activity, previous_status=current_status)

    def _apply_status_side_effects(
        self,
        activity: Activity,
        previous_status: ActivityStatus | None,
    ) -> None:
        """Update timestamps according to the activity status."""

        if activity.status == ActivityStatus.PUBLISHED:
            if not activity.publish_time:
                activity.publish_time = datetime.now(timezone.utc)
        if activity.status == ActivityStatus.CLOSED:
            # Closing活动不自动归档，但保留发布时间。
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

    def _to_detail_schema(self, activity: Activity) -> ActivityDetail:
        return ActivityDetail(
            id=activity.id,
            title=activity.title,
            subtitle=activity.subtitle,
            category=activity.category,
            tags=activity.tags,
            cover_image_url=activity.cover_image_url,
            banner_image_url=activity.banner_image_url,
            city=activity.city,
            location=activity.location,
            location_detail=activity.location_detail,
            contact_name=activity.contact_name,
            contact_phone=activity.contact_phone,
            contact_email=activity.contact_email,
            description=activity.description,
            agenda=activity.agenda,
            materials=activity.materials,
            start_time=activity.start_time,
            end_time=activity.end_time,
            signup_start_time=activity.signup_start_time,
            signup_end_time=activity.signup_end_time,
            checkin_start_time=activity.checkin_start_time,
            checkin_end_time=activity.checkin_end_time,
            max_participants=activity.max_participants,
            approval_required=activity.approval_required,
            require_payment=activity.require_payment,
            allow_feedback=activity.allow_feedback,
            allow_waitlist=activity.allow_waitlist,
            group_qr_image_url=activity.group_qr_image_url,
            extra=activity.extra,
            status=activity.status,
            code=activity.code,
            publish_time=activity.publish_time,
            archive_time=activity.archive_time,
            checkin_token=activity.checkin_token,
            checkin_token_expires_at=activity.checkin_token_expires_at,
            form_fields=[self._to_form_field_schema(f) for f in activity.form_fields],
            created_at=activity.created_at,
            updated_at=activity.updated_at,
        )

    def _to_summary_schema(self, activity: Activity) -> ActivitySummary:
        return ActivitySummary(
            id=activity.id,
            title=activity.title,
            subtitle=activity.subtitle,
            category=activity.category,
            tags=activity.tags,
            cover_image_url=activity.cover_image_url,
            banner_image_url=activity.banner_image_url,
            city=activity.city,
            location=activity.location,
            location_detail=activity.location_detail,
            contact_name=activity.contact_name,
            contact_phone=activity.contact_phone,
            contact_email=activity.contact_email,
            description=activity.description,
            agenda=activity.agenda,
            materials=activity.materials,
            start_time=activity.start_time,
            end_time=activity.end_time,
            signup_start_time=activity.signup_start_time,
            signup_end_time=activity.signup_end_time,
            checkin_start_time=activity.checkin_start_time,
            checkin_end_time=activity.checkin_end_time,
            max_participants=activity.max_participants,
            approval_required=activity.approval_required,
            require_payment=activity.require_payment,
            allow_feedback=activity.allow_feedback,
            allow_waitlist=activity.allow_waitlist,
            group_qr_image_url=activity.group_qr_image_url,
            extra=activity.extra,
            status=activity.status,
            created_at=activity.created_at,
            updated_at=activity.updated_at,
            signup_count=len(activity.signups),
        )

    def _to_form_field_schema(self, field) -> ActivityFormFieldRead:
        return ActivityFormFieldRead(
            id=field.id,
            name=field.name,
            label=field.label,
            field_type=field.field_type,
            placeholder=field.placeholder,
            helper_text=field.helper_text,
            required=field.required,
            display_order=field.display_order,
            config=field.config,
            visible=field.visible,
            preset_key=field.preset_key,
            options=[
                ActivityFormFieldOptionRead(
                    id=opt.id,
                    label=opt.label,
                    value=opt.value,
                    display_order=opt.display_order,
                    is_default=opt.is_default,
                    extra=opt.extra,
                    created_at=opt.created_at,
                    updated_at=opt.updated_at,
                )
                for opt in field.options
            ],
            created_at=field.created_at,
            updated_at=field.updated_at,
        )

    def count(
        self,
        *,
        statuses: Iterable[ActivityStatus] | None = None,
        keyword: str | None = None,
    ) -> int:
        return self.repo.count(statuses=statuses, keyword=keyword)
