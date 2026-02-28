"""Payment API endpoints — 缴费记录 CRUD + 分页."""

from typing import List, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import UserProfile
from app.schemas.payment import PaymentCreate, PaymentListResponse, PaymentRead, PaymentUpdate
from app.services.payments import PaymentService

router = APIRouter()


def get_payment_service(session: Session = Depends(get_db)) -> PaymentService:
    return PaymentService(session)


@router.get("", response_model=PaymentListResponse)
def list_payments(
    *,
    service: PaymentService = Depends(get_payment_service),
    current_user: UserProfile = Depends(get_current_user),
    activity_id: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(5, ge=1, le=50),
) -> PaymentListResponse:
    return service.list_paginated(
        user_id=current_user.id,
        activity_id=activity_id,
        status=status_filter,
        category=category,
        page=page,
        per_page=per_page,
    )


@router.get("/{payment_id}", response_model=PaymentRead)
def get_payment(
    payment_id: int,
    service: PaymentService = Depends(get_payment_service),
    current_user: UserProfile = Depends(get_current_user),
) -> PaymentRead:
    payment = service.get(payment_id)
    if not payment or payment.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    return payment


@router.post("", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
def create_payment(
    payload: PaymentCreate,
    current_user: UserProfile = Depends(get_current_user),
    service: PaymentService = Depends(get_payment_service),
) -> PaymentRead:
    return service.create(payload, user_id=current_user.id)


@router.patch("/{payment_id}", response_model=PaymentRead)
def update_payment(
    payment_id: int,
    payload: PaymentUpdate,
    service: PaymentService = Depends(get_payment_service),
    current_user: UserProfile = Depends(get_current_user),
) -> PaymentRead:
    existing = service.get(payment_id)
    if not existing or existing.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    result = service.update(payment_id, payload)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    return result


@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(
    payment_id: int,
    service: PaymentService = Depends(get_payment_service),
    current_user: UserProfile = Depends(get_current_user),
) -> None:
    existing = service.get(payment_id)
    if not existing or existing.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    service.delete(payment_id)


@router.post("/bulk-delete")
def bulk_delete_payments(
    ids: List[int] = Body(..., embed=True),
    service: PaymentService = Depends(get_payment_service),
    current_user: UserProfile = Depends(get_current_user),
) -> dict[str, int]:
    deleted = service.bulk_delete(ids)
    return {"deleted": deleted}
