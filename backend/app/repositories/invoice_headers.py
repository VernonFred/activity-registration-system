"""Repository for invoice header persistence operations."""

from __future__ import annotations

from typing import Optional, Sequence

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.models.invoice_header import InvoiceHeader


class InvoiceHeaderRepository:

    def __init__(self, session: Session):
        self.session = session

    def _base_query(self) -> Select:
        return select(InvoiceHeader)

    def list(
        self,
        *,
        user_id: Optional[int] = None,
        type: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> Sequence[InvoiceHeader]:
        query = self._base_query()
        if user_id is not None:
            query = query.where(InvoiceHeader.user_id == user_id)
        if type is not None:
            query = query.where(InvoiceHeader.type == type)
        query = query.order_by(InvoiceHeader.created_at.desc())
        query = query.limit(limit).offset(offset)
        return self.session.execute(query).scalars().all()

    def count(
        self,
        *,
        user_id: Optional[int] = None,
        type: Optional[str] = None,
    ) -> int:
        query = select(func.count()).select_from(InvoiceHeader)
        if user_id is not None:
            query = query.where(InvoiceHeader.user_id == user_id)
        if type is not None:
            query = query.where(InvoiceHeader.type == type)
        return self.session.execute(query).scalar_one()

    def get(self, header_id: int) -> Optional[InvoiceHeader]:
        return self.session.execute(
            self._base_query().where(InvoiceHeader.id == header_id)
        ).scalar_one_or_none()

    def create(self, data: dict) -> InvoiceHeader:
        header = InvoiceHeader(**data)
        self.session.add(header)
        self.session.flush()
        return header

    def update(self, header: InvoiceHeader, data: dict) -> InvoiceHeader:
        for key, value in data.items():
            setattr(header, key, value)
        self.session.add(header)
        self.session.flush()
        return header

    def delete(self, header: InvoiceHeader) -> None:
        self.session.delete(header)
        self.session.flush()
