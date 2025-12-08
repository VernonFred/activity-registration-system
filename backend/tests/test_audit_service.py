from sqlalchemy import select

from app.models.audit import AuditLog
from app.models.enums import AuditAction, AuditEntity
from app.services.audit import AuditLogService


def test_record_and_list_audit_logs(session):
    service = AuditLogService(session)

    service.record(
        action=AuditAction.ACTIVITY_CREATED,
        entity_type=AuditEntity.ACTIVITY,
        entity_id=1,
        actor_admin_id=10,
        context={"title": "测试活动"},
    )
    session.commit()

    logs = service.list_logs(limit=10)
    assert len(logs) == 1
    log = logs[0]
    assert log.action == AuditAction.ACTIVITY_CREATED
    assert log.entity_type == AuditEntity.ACTIVITY
    assert log.actor_admin_id == 10
    assert log.context == {"title": "测试活动"}

    stored = session.execute(select(AuditLog)).scalars().one()
    assert stored.context == {"title": "测试活动"}
