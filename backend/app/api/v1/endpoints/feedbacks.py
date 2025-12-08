"""Endpoints for activity feedback management."""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import (
    get_current_admin,
    get_current_user,
    get_feedback_service,
)
from app.models.admin import AdminUser
from app.models.user import UserProfile
from app.schemas.feedback import (
    ActivityFeedbackRead,
    ActivityFeedbackSubmit,
)
from app.services.feedbacks import ActivityFeedbackService

router = APIRouter()


@router.post(
    "/activities/{activity_id}/feedback",
    response_model=ActivityFeedbackRead,
    status_code=status.HTTP_200_OK,
)
def submit_feedback(
    activity_id: int,
    payload: ActivityFeedbackSubmit,
    service: ActivityFeedbackService = Depends(get_feedback_service),
    current_user: UserProfile = Depends(get_current_user),
) -> ActivityFeedbackRead:
    try:
        feedback = service.submit_feedback(
            user_id=current_user.id,
            activity_id=activity_id,
            payload=payload,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return feedback


@router.get(
    "/activities/{activity_id}/feedback/me",
    response_model=ActivityFeedbackRead,
)
def get_my_feedback(
    activity_id: int,
    service: ActivityFeedbackService = Depends(get_feedback_service),
    current_user: UserProfile = Depends(get_current_user),
) -> ActivityFeedbackRead:
    feedback = service.get_my_feedback(user_id=current_user.id, activity_id=activity_id)
    if not feedback:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="feedback_not_found")
    return feedback


@router.delete(
    "/activities/{activity_id}/feedback",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_my_feedback(
    activity_id: int,
    service: ActivityFeedbackService = Depends(get_feedback_service),
    current_user: UserProfile = Depends(get_current_user),
) -> None:
    deleted = service.delete_feedback(user_id=current_user.id, activity_id=activity_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="feedback_not_found")


@router.get(
    "/activities/{activity_id}/feedbacks",
    response_model=List[ActivityFeedbackRead],
)
def list_activity_feedbacks(
    activity_id: int,
    is_public: Optional[bool] = Query(None, description="Filter by visibility"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    service: ActivityFeedbackService = Depends(get_feedback_service),
    current_admin: AdminUser = Depends(get_current_admin),
) -> List[ActivityFeedbackRead]:
    return list(
        service.list_activity_feedbacks(
            activity_id=activity_id,
            is_public=is_public,
            limit=limit,
            offset=offset,
        )
    )
