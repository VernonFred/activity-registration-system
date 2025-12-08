"""Signup API endpoints (placeholders for implementation)."""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_checkin_service, get_current_admin, get_current_user, get_signup_service, get_db
from app.models.enums import SignupStatus, CheckinStatus
from app.models.admin import AdminUser
from app.models.enums import NotificationEvent
from app.models.user import UserProfile
from app.schemas.signup import (
    SignupCheckinRequest,
    SignupCreate,
    SignupRead,
    SignupReminderRequest,
    SignupReviewRequest,
    SignupUpdate,
    BulkReviewRequest,
    BulkReviewResult,
)
from app.schemas.companion import CompanionCreate, CompanionRead, CompanionUpdate, CompanionListResponse
from app.services.checkins import CheckinService
from app.services.signups import SignupService
from app.services.companions import CompanionService
from fastapi import Body

router = APIRouter()


def get_companion_service(session: Session = Depends(get_db)) -> CompanionService:
    return CompanionService(session)


@router.get("", response_model=List[SignupRead])
def list_signups(
    *,
    service: SignupService = Depends(get_signup_service),
    activity_id: Optional[int] = Query(None),
    user_id: Optional[int] = Query(None),
    statuses: Optional[List[SignupStatus]] = Query(None),
    checkin_status: Optional[CheckinStatus] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> List[SignupRead]:
    return list(
        service.list(
            activity_id=activity_id,
            user_id=user_id,
            statuses=statuses,
            checkin_status=checkin_status,
            limit=limit,
            offset=offset,
        )
    )


@router.get("/count")
def count_signups(
    *,
    service: SignupService = Depends(get_signup_service),
    activity_id: Optional[int] = Query(None),
    user_id: Optional[int] = Query(None),
    statuses: Optional[List[SignupStatus]] = Query(None),
    checkin_status: Optional[CheckinStatus] = Query(None),
) -> dict[str, int]:
    total = service.count(
        activity_id=activity_id,
        user_id=user_id,
        statuses=statuses,
        checkin_status=checkin_status,
    )
    return {"total": total}


@router.post("", response_model=SignupRead, status_code=status.HTTP_201_CREATED)
def create_signup(
    payload: SignupCreate,
    current_user: UserProfile = Depends(get_current_user),
    service: SignupService = Depends(get_signup_service),
) -> SignupRead:
    return service.create(payload, user_id=current_user.id)


@router.get("/{signup_id}", response_model=SignupRead)
def get_signup(
    signup_id: int,
    service: SignupService = Depends(get_signup_service),
) -> SignupRead:
    signup = service.get(signup_id)
    if not signup:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Signup not found")
    return signup


@router.patch("/{signup_id}", response_model=SignupRead)
def update_signup(
    signup_id: int,
    payload: SignupUpdate,
    service: SignupService = Depends(get_signup_service),
) -> SignupRead:
    signup = service.update(signup_id, payload)
    if not signup:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Signup not found")
    return signup


@router.post("/{signup_id}/review", response_model=SignupRead)
def review_signup(
    signup_id: int,
    payload: SignupReviewRequest,
    service: SignupService = Depends(get_signup_service),
    current_admin: AdminUser = Depends(get_current_admin),
) -> SignupRead:
    signup = service.review(signup_id, current_admin, payload)
    if not signup:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Signup not found")
    return signup


@router.post("/{signup_id}/remind", response_model=SignupRead)
def remind_signup(
    signup_id: int,
    payload: SignupReminderRequest,
    service: SignupService = Depends(get_signup_service),
    current_admin: AdminUser = Depends(get_current_admin),
) -> SignupRead:
    signup = service.send_reminder(signup_id, payload.event)
    if not signup:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Signup not found")
    return signup


@router.post("/{signup_id}/checkins", response_model=SignupRead)
def checkin_signup(
    signup_id: int,
    payload: SignupCheckinRequest,
    checkin_service: CheckinService = Depends(get_checkin_service),
    current_admin: AdminUser = Depends(get_current_admin),
) -> SignupRead:
    try:
        signup = checkin_service.checkin(signup_id, payload.token, force=payload.force)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    if not signup:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Signup not found")
    return SignupService(checkin_service.session)._to_schema(signup)


@router.delete("/{signup_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_signup(
    signup_id: int,
    service: SignupService = Depends(get_signup_service),
    current_admin: AdminUser = Depends(get_current_admin),
) -> None:
    ok = service.delete(signup_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Signup not found")


@router.post("/bulk-delete")
def bulk_delete_signups(
    ids: List[int] = Body(..., embed=True, description="要删除的报名ID列表"),
    service: SignupService = Depends(get_signup_service),
    current_admin: AdminUser = Depends(get_current_admin),
) -> dict[str, int]:
    deleted = service.bulk_delete(ids)
    return {"deleted": deleted}


@router.post("/bulk-review", response_model=BulkReviewResult)
def bulk_review_signups(
    payload: BulkReviewRequest,
    service: SignupService = Depends(get_signup_service),
    current_admin: AdminUser = Depends(get_current_admin),
) -> BulkReviewResult:
    """批量审核报名记录（通过或驳回）"""
    return service.bulk_review(current_admin, payload)


# ============ Companion endpoints ============

@router.get("/{signup_id}/companions", response_model=CompanionListResponse)
def list_companions(
    signup_id: int,
    service: CompanionService = Depends(get_companion_service),
) -> CompanionListResponse:
    """获取报名的同行人员列表"""
    companions = service.list_by_signup(signup_id)
    return CompanionListResponse(companions=companions, total=len(companions))


@router.post("/{signup_id}/companions", response_model=CompanionRead, status_code=status.HTTP_201_CREATED)
def create_companion(
    signup_id: int,
    payload: CompanionCreate,
    service: CompanionService = Depends(get_companion_service),
    current_user: UserProfile = Depends(get_current_user),
) -> CompanionRead:
    """添加同行人员"""
    try:
        return service.create(signup_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/{signup_id}/companions/{companion_id}", response_model=CompanionRead)
def update_companion(
    signup_id: int,
    companion_id: int,
    payload: CompanionUpdate,
    service: CompanionService = Depends(get_companion_service),
    current_user: UserProfile = Depends(get_current_user),
) -> CompanionRead:
    """更新同行人员信息"""
    result = service.update(companion_id, payload)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Companion not found")
    return result


@router.delete("/{signup_id}/companions/{companion_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_companion(
    signup_id: int,
    companion_id: int,
    service: CompanionService = Depends(get_companion_service),
    current_user: UserProfile = Depends(get_current_user),
) -> None:
    """删除同行人员"""
    ok = service.delete(companion_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Companion not found")
