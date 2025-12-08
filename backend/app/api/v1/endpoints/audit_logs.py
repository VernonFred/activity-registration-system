"""Audit log listing endpoints."""

from typing import List, Optional

from fastapi import APIRouter, Depends, Query

from app.api.deps import get_audit_log_service, get_current_admin
from app.models.enums import AuditAction, AuditEntity
from app.schemas.audit import AuditLogRead
from app.services.audit import AuditLogService

router = APIRouter()


@router.get("", response_model=List[AuditLogRead])
def list_audit_logs(
    *,
    action: Optional[AuditAction] = Query(None),
    entity_type: Optional[AuditEntity] = Query(None),
    entity_id: Optional[int] = Query(None),
    actor_admin_id: Optional[int] = Query(None),
    actor_user_id: Optional[int] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    service: AuditLogService = Depends(get_audit_log_service),
    current_admin = Depends(get_current_admin),
) -> List[AuditLogRead]:
    return list(
        service.list_logs(
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            actor_admin_id=actor_admin_id,
            actor_user_id=actor_user_id,
            limit=limit,
            offset=offset,
        )
    )
