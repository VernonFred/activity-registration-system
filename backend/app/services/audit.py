"""Service layer for recording and listing audit logs."""

from __future__ import annotations

from typing import Optional, Sequence

from sqlalchemy.orm import Session

from app.models.enums import AuditAction, AuditEntity
from app.repositories.audit_logs import AuditLogRepository
from app.schemas.audit import AuditLogRead


class AuditLogService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.repo = AuditLogRepository(session)

    def record(
        self,
        *,
        action: AuditAction,
        entity_type: AuditEntity,
        entity_id: Optional[int] = None,
        actor_admin_id: Optional[int] = None,
        actor_user_id: Optional[int] = None,
        description: Optional[str] = None,
        context: Optional[dict] = None,
    ) -> None:
        action_value = action.value if isinstance(action, AuditAction) else action
        entity_value = entity_type.value if isinstance(entity_type, AuditEntity) else entity_type
        self.repo.create(
            {
                "action": action_value,
                "entity_type": entity_value,
                "entity_id": entity_id,
                "actor_admin_id": actor_admin_id,
                "actor_user_id": actor_user_id,
                "description": description,
                "context": context,
            }
        )
        self.session.flush()

    def list_logs(
        self,
        *,
        action: Optional[AuditAction] = None,
        entity_type: Optional[AuditEntity] = None,
        entity_id: Optional[int] = None,
        actor_admin_id: Optional[int] = None,
        actor_user_id: Optional[int] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
    ) -> Sequence[AuditLogRead]:
        logs = self.repo.list(
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            actor_admin_id=actor_admin_id,
            actor_user_id=actor_user_id,
            limit=limit,
            offset=offset,
        )
        return [AuditLogRead.model_validate(log, from_attributes=True) for log in logs]
