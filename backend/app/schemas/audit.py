"""Schemas for audit log operations."""

from datetime import datetime
from typing import Optional

from app.models.enums import AuditAction, AuditEntity
from app.schemas.common import ORMModel


class AuditLogRead(ORMModel):
    id: int
    action: AuditAction
    entity_type: AuditEntity
    entity_id: Optional[int] = None
    actor_admin_id: Optional[int] = None
    actor_user_id: Optional[int] = None
    description: Optional[str] = None
    context: Optional[dict] = None
    created_at: datetime
    updated_at: datetime


class AuditLogQuery(ORMModel):
    action: Optional[AuditAction] = None
    entity_type: Optional[AuditEntity] = None
    entity_id: Optional[int] = None
    actor_admin_id: Optional[int] = None
    actor_user_id: Optional[int] = None
    limit: int = 50
    offset: int = 0
