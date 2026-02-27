"""Notification log endpoints."""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import get_current_admin, get_current_user, get_notification_service
from app.models.user import UserProfile
from app.schemas.notification import (
    NotificationBatchDeleteRequest,
    NotificationLogRead,
    NotificationPreviewRequest,
    NotificationPreviewResponse,
    NotificationEnqueueRequest,
)
from app.services.notifications import NotificationService

router = APIRouter()


@router.get("", response_model=List[NotificationLogRead])
def list_notifications(
    *,
    user_id: Optional[int] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    service: NotificationService = Depends(get_notification_service),
    current_admin = Depends(get_current_admin),
) -> List[NotificationLogRead]:
    logs = service.list_logs(user_id=user_id, limit=limit)
    return [NotificationLogRead.model_validate(log, from_attributes=True) for log in logs]


@router.get("/me", response_model=List[NotificationLogRead])
def list_my_notifications(
    service: NotificationService = Depends(get_notification_service),
    current_user: UserProfile = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=200),
) -> List[NotificationLogRead]:
    logs = service.list_logs(user_id=current_user.id, limit=limit)
    return [NotificationLogRead.model_validate(log, from_attributes=True) for log in logs]


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def clear_my_notifications(
    service: NotificationService = Depends(get_notification_service),
    current_user: UserProfile = Depends(get_current_user),
) -> None:
    service.delete_all_for_user(current_user.id)


@router.put("/me/read-all", status_code=status.HTTP_204_NO_CONTENT)
def mark_all_read(
    service: NotificationService = Depends(get_notification_service),
    current_user: UserProfile = Depends(get_current_user),
) -> None:
    service.mark_all_read(current_user.id)


@router.post("/me/batch-delete", status_code=status.HTTP_204_NO_CONTENT)
def batch_delete_notifications(
    body: NotificationBatchDeleteRequest,
    service: NotificationService = Depends(get_notification_service),
    current_user: UserProfile = Depends(get_current_user),
) -> None:
    service.batch_delete(body.ids, user_id=current_user.id)


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notification_id: int,
    service: NotificationService = Depends(get_notification_service),
    current_user: UserProfile = Depends(get_current_user),
) -> None:
    deleted = service.delete_notification(notification_id, user_id=current_user.id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="notification_not_found")


@router.post("/preview", response_model=NotificationPreviewResponse, status_code=status.HTTP_200_OK)
def preview_notification(
    payload: NotificationPreviewRequest,
    service: NotificationService = Depends(get_notification_service),
    current_admin = Depends(get_current_admin),
) -> NotificationPreviewResponse:
    try:
        preview = service.preview(
            channel=payload.channel,
            event=payload.event,
            user_id=payload.user_id,
            activity_id=payload.activity_id,
            signup_id=payload.signup_id,
            payload=payload.payload,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return NotificationPreviewResponse(
        channel=preview["channel"],
        event=preview["event"],
        payload=preview["payload"],
        user=preview["user"],
        activity=preview["activity"],
        signup=preview["signup"],
    )


@router.post("/enqueue", response_model=NotificationLogRead, status_code=status.HTTP_201_CREATED)
def enqueue_notification(
    payload: NotificationEnqueueRequest,
    service: NotificationService = Depends(get_notification_service),
    current_admin = Depends(get_current_admin),
) -> NotificationLogRead:
    log = service.enqueue(
        user_id=payload.user_id,
        activity_id=payload.activity_id,
        signup_id=payload.signup_id,
        channel=payload.channel,
        event=payload.event,
        payload=payload.payload,
        scheduled_send_at=payload.scheduled_send_at,
    )
    return NotificationLogRead.model_validate(log, from_attributes=True)
