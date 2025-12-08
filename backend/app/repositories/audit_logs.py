"""Repository for audit log operations."""

from __future__ import annotations

from typing import Optional, Sequence

from sqlalchemy import Select, desc, select
from sqlalchemy.orm import Session, selectinload

from app.models.audit import AuditLog
from app.models.enums import AuditAction, AuditEntity


class AuditLogRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def _base_query(self) -> Select:
        return select(AuditLog).options(
            selectinload(AuditLog.actor_admin),
            selectinload(AuditLog.actor_user),
        )

    def create(self, payload: dict) -> AuditLog:
        log = AuditLog(**payload)
        self.session.add(log)
        self.session.flush()
        return log

    def list(
        self,
        *,
        action: Optional[AuditAction] = None,
        entity_type: Optional[AuditEntity] = None,
        entity_id: Optional[int] = None,
        actor_admin_id: Optional[int] = None,
        actor_user_id: Optional[int] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
    ) -> Sequence[AuditLog]:
        query = self._base_query()
        if action is not None:
            query = query.where(AuditLog.action == action)
        if entity_type is not None:
            query = query.where(AuditLog.entity_type == entity_type)
        if entity_id is not None:
            query = query.where(AuditLog.entity_id == entity_id)
        if actor_admin_id is not None:
            query = query.where(AuditLog.actor_admin_id == actor_admin_id)
        if actor_user_id is not None:
            query = query.where(AuditLog.actor_user_id == actor_user_id)
        query = query.order_by(desc(AuditLog.created_at))
        if limit:
            query = query.limit(limit)
        if offset:
            query = query.offset(offset)
        return self.session.execute(query).scalars().all()
