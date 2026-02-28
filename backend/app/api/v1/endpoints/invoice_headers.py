"""InvoiceHeader API endpoints — 发票抬头 CRUD + 分页 + 复制."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import UserProfile
from app.schemas.invoice_header import (
    InvoiceHeaderCopyText,
    InvoiceHeaderCreate,
    InvoiceHeaderListResponse,
    InvoiceHeaderRead,
    InvoiceHeaderUpdate,
)
from app.services.invoice_headers import InvoiceHeaderService

router = APIRouter()


def get_invoice_header_service(session: Session = Depends(get_db)) -> InvoiceHeaderService:
    return InvoiceHeaderService(session)


@router.get("", response_model=InvoiceHeaderListResponse)
def list_invoice_headers(
    *,
    service: InvoiceHeaderService = Depends(get_invoice_header_service),
    current_user: UserProfile = Depends(get_current_user),
    type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(4, ge=1, le=50),
) -> InvoiceHeaderListResponse:
    return service.list_paginated(
        user_id=current_user.id,
        type=type,
        page=page,
        per_page=per_page,
    )


@router.get("/{header_id}", response_model=InvoiceHeaderRead)
def get_invoice_header(
    header_id: int,
    service: InvoiceHeaderService = Depends(get_invoice_header_service),
    current_user: UserProfile = Depends(get_current_user),
) -> InvoiceHeaderRead:
    header = service.get(header_id)
    if not header or header.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice header not found")
    return header


@router.get("/{header_id}/copy-text", response_model=InvoiceHeaderCopyText)
def get_invoice_header_copy_text(
    header_id: int,
    service: InvoiceHeaderService = Depends(get_invoice_header_service),
    current_user: UserProfile = Depends(get_current_user),
) -> InvoiceHeaderCopyText:
    """返回发票抬头完整文本信息，前端用于复制到剪贴板."""
    result = service.get_copy_text(header_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice header not found")
    return result


@router.post("", response_model=InvoiceHeaderRead, status_code=status.HTTP_201_CREATED)
def create_invoice_header(
    payload: InvoiceHeaderCreate,
    current_user: UserProfile = Depends(get_current_user),
    service: InvoiceHeaderService = Depends(get_invoice_header_service),
) -> InvoiceHeaderRead:
    return service.create(payload, user_id=current_user.id)


@router.patch("/{header_id}", response_model=InvoiceHeaderRead)
def update_invoice_header(
    header_id: int,
    payload: InvoiceHeaderUpdate,
    service: InvoiceHeaderService = Depends(get_invoice_header_service),
    current_user: UserProfile = Depends(get_current_user),
) -> InvoiceHeaderRead:
    existing = service.get(header_id)
    if not existing or existing.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice header not found")
    result = service.update(header_id, payload)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice header not found")
    return result


@router.delete("/{header_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_invoice_header(
    header_id: int,
    service: InvoiceHeaderService = Depends(get_invoice_header_service),
    current_user: UserProfile = Depends(get_current_user),
) -> None:
    existing = service.get(header_id)
    if not existing or existing.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice header not found")
    service.delete(header_id)
