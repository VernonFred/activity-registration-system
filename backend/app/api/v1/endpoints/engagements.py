"""Endpoints for activity favorites, likes, shares, and comments."""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import (
    get_activity_service,
    get_current_admin,
    get_current_user,
    get_engagement_service,
    get_optional_admin,
    get_optional_user,
)
from app.models.activity import Activity
from app.models.user import UserProfile
from app.schemas.engagement import (
    ActivityCommentCreate,
    ActivityCommentRead,
    ActivityEngagementSummary,
    ActivityFeedItem,
    ActivityShareRequest,
)
from app.services.activities import ActivityService
from app.services.engagements import ActivityEngagementService

router = APIRouter()


def _ensure_activity(activity_id: int, activity_service: ActivityService) -> Activity:
    activity = activity_service.get(activity_id)
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    return activity


@router.post("/{activity_id}/favorite", response_model=ActivityEngagementSummary)
def favorite_activity(
    activity_id: int,
    engagement_service: ActivityEngagementService = Depends(get_engagement_service),
    activity_service: ActivityService = Depends(get_activity_service),
    current_user: UserProfile = Depends(get_current_user),
) -> ActivityEngagementSummary:
    _ensure_activity(activity_id, activity_service)
    return engagement_service.favorite(activity_id=activity_id, user_id=current_user.id)


@router.delete("/{activity_id}/favorite", response_model=ActivityEngagementSummary)
def unfavorite_activity(
    activity_id: int,
    engagement_service: ActivityEngagementService = Depends(get_engagement_service),
    activity_service: ActivityService = Depends(get_activity_service),
    current_user: UserProfile = Depends(get_current_user),
) -> ActivityEngagementSummary:
    _ensure_activity(activity_id, activity_service)
    return engagement_service.unfavorite(activity_id=activity_id, user_id=current_user.id)


@router.post("/{activity_id}/like", response_model=ActivityEngagementSummary)
def like_activity(
    activity_id: int,
    engagement_service: ActivityEngagementService = Depends(get_engagement_service),
    activity_service: ActivityService = Depends(get_activity_service),
    current_user: UserProfile = Depends(get_current_user),
) -> ActivityEngagementSummary:
    _ensure_activity(activity_id, activity_service)
    return engagement_service.like(activity_id=activity_id, user_id=current_user.id)


@router.delete("/{activity_id}/like", response_model=ActivityEngagementSummary)
def unlike_activity(
    activity_id: int,
    engagement_service: ActivityEngagementService = Depends(get_engagement_service),
    activity_service: ActivityService = Depends(get_activity_service),
    current_user: UserProfile = Depends(get_current_user),
) -> ActivityEngagementSummary:
    _ensure_activity(activity_id, activity_service)
    return engagement_service.unlike(activity_id=activity_id, user_id=current_user.id)


@router.post("/{activity_id}/share", response_model=ActivityEngagementSummary)
def share_activity(
    activity_id: int,
    payload: ActivityShareRequest,
    engagement_service: ActivityEngagementService = Depends(get_engagement_service),
    activity_service: ActivityService = Depends(get_activity_service),
    current_user: Optional[UserProfile] = Depends(get_optional_user),
) -> ActivityEngagementSummary:
    _ensure_activity(activity_id, activity_service)
    user_id = current_user.id if current_user else None
    return engagement_service.share(activity_id=activity_id, user_id=user_id, payload=payload)


@router.get("/{activity_id}/engagement", response_model=ActivityEngagementSummary)
def get_activity_engagement(
    activity_id: int,
    engagement_service: ActivityEngagementService = Depends(get_engagement_service),
    activity_service: ActivityService = Depends(get_activity_service),
    current_user: Optional[UserProfile] = Depends(get_optional_user),
) -> ActivityEngagementSummary:
    _ensure_activity(activity_id, activity_service)
    user_id = current_user.id if current_user else None
    return engagement_service.get_summary(activity_id, user_id=user_id)


@router.get("/{activity_id}/comments", response_model=List[ActivityCommentRead])
def list_activity_comments(
    activity_id: int,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    engagement_service: ActivityEngagementService = Depends(get_engagement_service),
    activity_service: ActivityService = Depends(get_activity_service),
) -> List[ActivityCommentRead]:
    _ensure_activity(activity_id, activity_service)
    return list(
        engagement_service.list_comments(
            activity_id=activity_id,
            limit=limit,
            offset=offset,
        )
    )


@router.post("/{activity_id}/comments", response_model=ActivityCommentRead, status_code=status.HTTP_201_CREATED)
def create_activity_comment(
    activity_id: int,
    payload: ActivityCommentCreate,
    engagement_service: ActivityEngagementService = Depends(get_engagement_service),
    activity_service: ActivityService = Depends(get_activity_service),
    current_user: UserProfile = Depends(get_current_user),
) -> ActivityCommentRead:
    _ensure_activity(activity_id, activity_service)
    if not payload.content.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="content_required")
    return engagement_service.create_comment(
        activity_id=activity_id,
        user_id=current_user.id,
        payload=payload,
    )


@router.delete("/{activity_id}/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity_comment(
    activity_id: int,
    comment_id: int,
    engagement_service: ActivityEngagementService = Depends(get_engagement_service),
    activity_service: ActivityService = Depends(get_activity_service),
    current_user: Optional[UserProfile] = Depends(get_optional_user),
    current_admin=Depends(get_optional_admin),
) -> None:
    _ensure_activity(activity_id, activity_service)
    actor_user_id = current_user.id if current_user else None
    actor_admin_id = current_admin.id if current_admin else None
    deleted = engagement_service.delete_comment(
        comment_id=comment_id,
        actor_user_id=actor_user_id,
        actor_admin_id=actor_admin_id,
    )
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="comment_not_found")


@router.get("/{activity_id}/feed", response_model=List[ActivityFeedItem])
def recent_activity_feed(
    activity_id: int,
    limit: int = Query(20, ge=1, le=100),
    engagement_service: ActivityEngagementService = Depends(get_engagement_service),
    activity_service: ActivityService = Depends(get_activity_service),
) -> List[ActivityFeedItem]:
    _ensure_activity(activity_id, activity_service)
    return engagement_service.recent_feed(activity_id=activity_id, limit=limit)
