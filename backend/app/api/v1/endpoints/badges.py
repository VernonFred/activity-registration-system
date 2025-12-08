"""Badge management endpoints."""

from typing import List

from fastapi import APIRouter, Body, Depends, HTTPException, status

from app.api.deps import get_badge_service, get_current_admin, get_current_user
from app.models.user import UserProfile
from app.schemas.badge import BadgeAwardRequest, BadgeCreate, BadgeRead, UserBadgeRead
from app.services.badges import BadgeService

router = APIRouter()


@router.get("", response_model=List[BadgeRead])
def list_badges(
    service: BadgeService = Depends(get_badge_service),
    current_admin=Depends(get_current_admin),
) -> List[BadgeRead]:
    badges = service.list_badges()
    return [BadgeRead.model_validate(badge, from_attributes=True) for badge in badges]


@router.post("", response_model=BadgeRead, status_code=status.HTTP_201_CREATED)
def create_badge(
    payload: BadgeCreate,
    service: BadgeService = Depends(get_badge_service),
    current_admin=Depends(get_current_admin),
) -> BadgeRead:
    try:
        badge = service.create_badge(**payload.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return BadgeRead.model_validate(badge, from_attributes=True)


@router.post("/{code}/award", response_model=UserBadgeRead)
def award_badge(
    code: str,
    request: BadgeAwardRequest,
    service: BadgeService = Depends(get_badge_service),
    current_admin=Depends(get_current_admin),
) -> UserBadgeRead:
    try:
        awarded = service.award_badge(
            user_id=request.user_id,
            badge_code=code,
            activity_id=request.activity_id,
            notes=request.notes,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return UserBadgeRead.model_validate(awarded, from_attributes=True)


@router.get("/me", response_model=List[UserBadgeRead])
def list_my_badges(
    service: BadgeService = Depends(get_badge_service),
    current_user: UserProfile = Depends(get_current_user),
) -> List[UserBadgeRead]:
    badges = service.list_user_badges(current_user.id)
    return [UserBadgeRead.model_validate(item, from_attributes=True) for item in badges]
