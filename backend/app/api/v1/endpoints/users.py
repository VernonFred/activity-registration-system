"""User specific endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user, get_engagement_service, get_db
from app.schemas.engagement import UserEngagementStats
from app.schemas.user import UserProfileRead, UserProfileUpdate
from app.services.engagements import ActivityEngagementService
from app.services.users import UserService
from app.models.user import UserProfile
from sqlalchemy.orm import Session

router = APIRouter()


def get_user_service(session: Session = Depends(get_db)) -> UserService:
    return UserService(session)


@router.get("/me/stats", response_model=UserEngagementStats)
def get_my_stats(
    engagement_service: ActivityEngagementService = Depends(get_engagement_service),
    current_user: UserProfile = Depends(get_current_user),
) -> UserEngagementStats:
    return engagement_service.get_user_stats(current_user.id)


@router.get("/me", response_model=UserProfileRead)
def get_my_profile(
    current_user: UserProfile = Depends(get_current_user),
    service: UserService = Depends(get_user_service),
) -> UserProfileRead:
    """获取当前用户资料"""
    return service._to_schema(current_user)


@router.patch("/me", response_model=UserProfileRead)
def update_my_profile(
    payload: UserProfileUpdate,
    current_user: UserProfile = Depends(get_current_user),
    service: UserService = Depends(get_user_service),
) -> UserProfileRead:
    """更新当前用户资料"""
    result = service.update(current_user.id, payload)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return result
