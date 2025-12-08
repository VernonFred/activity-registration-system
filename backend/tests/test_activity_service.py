import pytest
from sqlalchemy import select

from app.models.audit import AuditLog
from app.models.enums import ActivityStatus, FieldType, AuditAction, AuditEntity
from app.schemas.activity import ActivityCreate, ActivityUpdate
from app.schemas.form_field import ActivityFormFieldCreate, ActivityFormFieldOptionCreate
from app.services.activities import ActivityService
from app.services.exceptions import InvalidStatusTransition


def build_field(name: str, label: str, field_type: FieldType) -> ActivityFormFieldCreate:
    options = []
    if field_type in {FieldType.SELECT, FieldType.RADIO}:
        options = [
            ActivityFormFieldOptionCreate(label="选项A", value="A"),
            ActivityFormFieldOptionCreate(label="选项B", value="B"),
        ]
    return ActivityFormFieldCreate(
        name=name,
        label=label,
        field_type=field_type,
        required=True,
        options=options,
    )


def test_create_activity_with_form_fields(session):
    service = ActivityService(session)
    payload = ActivityCreate(
        title="测试活动",
        status=ActivityStatus.DRAFT,
        form_fields=[build_field("arrival_station", "接站点", FieldType.SELECT)],
    )

    result = service.create(payload)

    assert result.id is not None
    assert result.status == ActivityStatus.DRAFT
    assert len(result.form_fields) == 1
    assert result.form_fields[0].options[0].label == "选项A"


def test_publish_and_archive_flow(session):
    service = ActivityService(session)
    create_payload = ActivityCreate(
        title="流程测试",
        status=ActivityStatus.DRAFT,
        form_fields=[],
    )
    created = service.create(create_payload)

    published = service.update(
        created.id,
        ActivityUpdate(status=ActivityStatus.PUBLISHED),
    )

    assert published.status == ActivityStatus.PUBLISHED
    assert published.publish_time is not None

    closed = service.update(
        created.id,
        ActivityUpdate(status=ActivityStatus.CLOSED),
    )
    assert closed.status == ActivityStatus.CLOSED
    assert closed.archive_time is None

    archived = service.update(
        created.id,
        ActivityUpdate(status=ActivityStatus.ARCHIVED),
    )
    assert archived.status == ActivityStatus.ARCHIVED
    assert archived.archive_time is not None


def test_invalid_status_transition_raises(session):
    service = ActivityService(session)
    created = service.create(
        ActivityCreate(
            title="非法状态",
            status=ActivityStatus.PUBLISHED,
            form_fields=[],
        )
    )

    with pytest.raises(InvalidStatusTransition):
        service.update(
            created.id,
            ActivityUpdate(status=ActivityStatus.DRAFT),
        )


def test_replace_form_fields_on_update(session):
    service = ActivityService(session)
    created = service.create(
        ActivityCreate(
            title="表单更新",
            status=ActivityStatus.DRAFT,
            form_fields=[build_field("field1", "字段1", FieldType.SELECT)],
        )
    )

    updated = service.update(
        created.id,
        ActivityUpdate(
            form_fields=[
                build_field("field2", "字段2", FieldType.TEXT),
            ]
        ),
    )

    assert len(updated.form_fields) == 1
    assert updated.form_fields[0].name == "field2"


def test_generate_checkin_token_records_audit(session, admin_user):
    service = ActivityService(session)
    payload = ActivityCreate(
        title="签到测试",
        status=ActivityStatus.DRAFT,
        form_fields=[],
    )
    created = service.create(payload)

    service.generate_checkin_token(created.id, actor_admin_id=admin_user.id)

    logs = session.execute(select(AuditLog)).scalars().all()
    assert any(
        log.action == AuditAction.CHECKIN_TOKEN_GENERATED
        and log.entity_type == AuditEntity.ACTIVITY
        and log.entity_id == created.id
        and log.actor_admin_id == admin_user.id
    for log in logs)
