"""Repository for payment persistence operations."""

from __future__ import annotations

import math
from typing import Optional, Sequence

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.models.payment import Payment


class PaymentRepository:

    def __init__(self, session: Session):
        self.session = session

    def _base_query(self) -> Select:
        return select(Payment)

    def list(
        self,
        *,
        user_id: Optional[int] = None,
        activity_id: Optional[int] = None,
        status: Optional[str] = None,
        category: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> Sequence[Payment]:
        query = self._base_query()
        if user_id is not None:
            query = query.where(Payment.user_id == user_id)
        if activity_id is not None:
            query = query.where(Payment.activity_id == activity_id)
        if status is not None:
            query = query.where(Payment.status == status)
        if category is not None:
            query = query.where(Payment.category == category)
        query = query.order_by(Payment.created_at.desc())
        query = query.limit(limit).offset(offset)
        return self.session.execute(query).scalars().all()

    def count(
        self,
        *,
        user_id: Optional[int] = None,
        activity_id: Optional[int] = None,
        status: Optional[str] = None,
        category: Optional[str] = None,
    ) -> int:
        query = select(func.count()).select_from(Payment)
        if user_id is not None:
            query = query.where(Payment.user_id == user_id)
        if activity_id is not None:
            query = query.where(Payment.activity_id == activity_id)
        if status is not None:
            query = query.where(Payment.status == status)
        if category is not None:
            query = query.where(Payment.category == category)
        return self.session.execute(query).scalar_one()

    def get(self, payment_id: int) -> Optional[Payment]:
        return self.session.execute(
            self._base_query().where(Payment.id == payment_id)
        ).scalar_one_or_none()

    def create(self, data: dict) -> Payment:
        payment = Payment(**data)
        self.session.add(payment)
        self.session.flush()
        return payment

    def update(self, payment: Payment, data: dict) -> Payment:
        for key, value in data.items():
            setattr(payment, key, value)
        self.session.add(payment)
        self.session.flush()
        return payment

    def delete(self, payment: Payment) -> None:
        self.session.delete(payment)
        self.session.flush()

    def delete_many(self, ids: list[int]) -> int:
        if not ids:
            return 0
        payments = self.session.execute(
            select(Payment).where(Payment.id.in_(ids))
        ).scalars().all()
        deleted = 0
        for p in payments:
            self.session.delete(p)
            deleted += 1
        self.session.flush()
        return deleted
