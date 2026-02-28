"""Domain service for invoice header operations."""

from __future__ import annotations

import math
from typing import Optional

from sqlalchemy.orm import Session

from app.models.invoice_header import InvoiceHeader
from app.repositories.invoice_headers import InvoiceHeaderRepository
from app.schemas.invoice_header import (
    InvoiceHeaderCopyText,
    InvoiceHeaderCreate,
    InvoiceHeaderListResponse,
    InvoiceHeaderRead,
    InvoiceHeaderUpdate,
)


class InvoiceHeaderService:

    def __init__(self, session: Session):
        self.repo = InvoiceHeaderRepository(session)
        self.session = session

    def list_paginated(
        self,
        *,
        user_id: Optional[int] = None,
        type: Optional[str] = None,
        page: int = 1,
        per_page: int = 4,
    ) -> InvoiceHeaderListResponse:
        total = self.repo.count(user_id=user_id, type=type)
        total_pages = max(1, math.ceil(total / per_page))
        offset = (page - 1) * per_page
        items = self.repo.list(
            user_id=user_id,
            type=type,
            limit=per_page,
            offset=offset,
        )
        return InvoiceHeaderListResponse(
            items=[self._to_schema(h) for h in items],
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
        )

    def get(self, header_id: int) -> Optional[InvoiceHeaderRead]:
        header = self.repo.get(header_id)
        if not header:
            return None
        return self._to_schema(header)

    def get_copy_text(self, header_id: int) -> Optional[InvoiceHeaderCopyText]:
        """返回发票抬头完整文本，供前端复制到剪贴板."""
        header = self.repo.get(header_id)
        if not header:
            return None
        lines = [header.name]
        if header.type == "company":
            if header.tax_number:
                lines.append(f"税号: {header.tax_number}")
            if header.address:
                lines.append(f"地址: {header.address}")
            if header.phone:
                lines.append(f"电话: {header.phone}")
            if header.bank_name:
                lines.append(f"开户银行: {header.bank_name}")
            if header.bank_account:
                lines.append(f"银行账号: {header.bank_account}")
        return InvoiceHeaderCopyText(text="\n".join(lines))

    def create(self, payload: InvoiceHeaderCreate, user_id: int) -> InvoiceHeaderRead:
        data = payload.model_dump()
        data["user_id"] = user_id
        header = self.repo.create(data)
        self.session.commit()
        self.session.refresh(header)
        return self._to_schema(header)

    def update(self, header_id: int, payload: InvoiceHeaderUpdate) -> Optional[InvoiceHeaderRead]:
        header = self.repo.get(header_id)
        if not header:
            return None
        data = payload.model_dump(exclude_unset=True)
        self.repo.update(header, data)
        self.session.commit()
        self.session.refresh(header)
        return self._to_schema(header)

    def delete(self, header_id: int) -> bool:
        header = self.repo.get(header_id)
        if not header:
            return False
        self.repo.delete(header)
        self.session.commit()
        return True

    def _to_schema(self, header: InvoiceHeader) -> InvoiceHeaderRead:
        return InvoiceHeaderRead(
            id=header.id,
            user_id=header.user_id,
            name=header.name,
            type=header.type,
            tax_number=header.tax_number,
            address=header.address,
            phone=header.phone,
            bank_name=header.bank_name,
            bank_account=header.bank_account,
            created_at=header.created_at,
            updated_at=header.updated_at,
        )
