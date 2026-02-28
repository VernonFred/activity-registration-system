"""Domain service for payment operations."""

from __future__ import annotations

import math
from typing import Optional, Sequence

from sqlalchemy.orm import Session

from app.models.payment import Payment
from app.repositories.payments import PaymentRepository
from app.schemas.payment import (
    PaymentCreate,
    PaymentListResponse,
    PaymentRead,
    PaymentUpdate,
)


class PaymentService:

    def __init__(self, session: Session):
        self.repo = PaymentRepository(session)
        self.session = session

    def list_paginated(
        self,
        *,
        user_id: Optional[int] = None,
        activity_id: Optional[int] = None,
        status: Optional[str] = None,
        category: Optional[str] = None,
        page: int = 1,
        per_page: int = 5,
    ) -> PaymentListResponse:
        total = self.repo.count(
            user_id=user_id,
            activity_id=activity_id,
            status=status,
            category=category,
        )
        total_pages = max(1, math.ceil(total / per_page))
        offset = (page - 1) * per_page
        items = self.repo.list(
            user_id=user_id,
            activity_id=activity_id,
            status=status,
            category=category,
            limit=per_page,
            offset=offset,
        )
        return PaymentListResponse(
            items=[self._to_schema(p) for p in items],
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
        )

    def get(self, payment_id: int) -> Optional[PaymentRead]:
        payment = self.repo.get(payment_id)
        if not payment:
            return None
        return self._to_schema(payment)

    def create(self, payload: PaymentCreate, user_id: int) -> PaymentRead:
        data = payload.model_dump()
        data["user_id"] = user_id
        payment = self.repo.create(data)
        self.session.commit()
        self.session.refresh(payment)
        return self._to_schema(payment)

    def update(self, payment_id: int, payload: PaymentUpdate) -> Optional[PaymentRead]:
        payment = self.repo.get(payment_id)
        if not payment:
            return None
        data = payload.model_dump(exclude_unset=True)
        self.repo.update(payment, data)
        self.session.commit()
        self.session.refresh(payment)
        return self._to_schema(payment)

    def delete(self, payment_id: int) -> bool:
        payment = self.repo.get(payment_id)
        if not payment:
            return False
        self.repo.delete(payment)
        self.session.commit()
        return True

    def bulk_delete(self, ids: list[int]) -> int:
        deleted = self.repo.delete_many(ids)
        self.session.commit()
        return deleted

    def _to_schema(self, payment: Payment) -> PaymentRead:
        return PaymentRead(
            id=payment.id,
            user_id=payment.user_id,
            activity_id=payment.activity_id,
            activity_title=payment.activity_title,
            amount=payment.amount,
            category=payment.category,
            status=payment.status,
            pay_date=payment.pay_date,
            cover_url=payment.cover_url,
            date_range=payment.date_range,
            time_range=payment.time_range,
            payer=payment.payer,
            order_no=payment.order_no,
            transaction_no=payment.transaction_no,
            payment_screenshot=payment.payment_screenshot,
            created_at=payment.created_at,
            updated_at=payment.updated_at,
        )
