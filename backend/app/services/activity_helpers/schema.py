from __future__ import annotations

from app.models.activity import Activity
from app.schemas.activity import ActivityDetail, ActivitySummary
from app.schemas.form_field import ActivityFormFieldOptionRead, ActivityFormFieldRead


def to_form_field_schema(field) -> ActivityFormFieldRead:
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


def to_detail_schema(activity: Activity) -> ActivityDetail:
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
        form_fields=[to_form_field_schema(field) for field in activity.form_fields],
        created_at=activity.created_at,
        updated_at=activity.updated_at,
    )


def to_summary_schema(activity: Activity) -> ActivitySummary:
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
