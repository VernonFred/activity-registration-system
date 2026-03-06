from __future__ import annotations

from collections.abc import Sequence

from app.models.activity import Activity
from app.models.form_field import ActivityFormField, ActivityFormFieldOption
from app.schemas.form_field import ActivityFormFieldCreate


def apply_form_fields(session, activity: Activity, form_fields: Sequence[ActivityFormFieldCreate] | None) -> None:
    if form_fields is None:
        return

    for existing in list(activity.form_fields):
        session.delete(existing)
    session.flush()

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
            display_order=field_payload.display_order if field_payload.display_order is not None else order,
            config=field_payload.config,
            visible=field_payload.visible,
        )
        for opt_order, option_payload in enumerate(field_payload.options):
            field.options.append(
                ActivityFormFieldOption(
                    label=option_payload.label,
                    value=option_payload.value,
                    display_order=option_payload.display_order if option_payload.display_order is not None else opt_order,
                    is_default=option_payload.is_default,
                    extra=option_payload.extra,
                )
            )
        activity.form_fields.append(field)

    session.flush()
