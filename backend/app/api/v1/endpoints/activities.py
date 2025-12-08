"""Activity API endpoints (placeholders for implementation)."""

import io
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse

from app.api.deps import (
    activity_status_filters,
    get_activity_service,
    get_current_admin,
    get_feedback_service,
    get_signup_service,
    get_export_service,
)
from app.models.admin import AdminUser
from app.models.enums import ActivityStatus, CheckinStatus
from app.schemas.activity import (
    ActivityCreate,
    ActivityDetail,
    ActivityStats,
    ActivitySummary,
    ActivityUpdate,
)
from app.schemas.signup import SignupRead
from app.services.activities import ActivityService
from app.services.exceptions import InvalidStatusTransition
from app.services.feedbacks import ActivityFeedbackService
from app.services.signups import SignupService
from app.services.exports import ExportService
from app.schemas.signup import RecentSignupUser

router = APIRouter()


@router.get("", response_model=List[ActivitySummary])
def list_activities(
    *,
    service: ActivityService = Depends(get_activity_service),
    statuses: Optional[List[ActivityStatus]] = Depends(activity_status_filters),
    keyword: Optional[str] = Query(None, description="Search in title"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> List[ActivitySummary]:
    return list(
        service.list(
            statuses=statuses,
            keyword=keyword,
            limit=limit,
            offset=offset,
        )
    )


@router.get("/count")
def count_activities(
    *,
    service: ActivityService = Depends(get_activity_service),
    statuses: Optional[List[ActivityStatus]] = Depends(activity_status_filters),
    keyword: Optional[str] = Query(None, description="Search in title"),
) -> dict[str, int]:
    total = service.count(statuses=statuses, keyword=keyword)
    return {"total": total}


@router.post("", response_model=ActivityDetail, status_code=status.HTTP_201_CREATED)
def create_activity(
    payload: ActivityCreate,
    service: ActivityService = Depends(get_activity_service),
) -> ActivityDetail:
    return service.create(payload)


@router.get("/{activity_id}", response_model=ActivityDetail)
def get_activity(
    activity_id: int,
    service: ActivityService = Depends(get_activity_service),
) -> ActivityDetail:
    activity = service.get(activity_id)
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    return activity


@router.get("/{activity_id}/checkins", response_model=List[SignupRead])
def list_activity_checkins(
    activity_id: int,
    checkin_status: Optional[CheckinStatus] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    activity_service: ActivityService = Depends(get_activity_service),
    signup_service: SignupService = Depends(get_signup_service),
    current_admin: AdminUser = Depends(get_current_admin),
) -> List[SignupRead]:
    activity = activity_service.get(activity_id)
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    return list(
        signup_service.list(
            activity_id=activity_id,
            checkin_status=checkin_status,
            limit=limit,
            offset=offset,
        )
    )


@router.get("/{activity_id}/stats", response_model=ActivityStats)
def activity_stats(
    activity_id: int,
    activity_service: ActivityService = Depends(get_activity_service),
    signup_service: SignupService = Depends(get_signup_service),
    feedback_service: ActivityFeedbackService = Depends(get_feedback_service),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ActivityStats:
    activity = activity_service.get(activity_id)
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    stats = signup_service.activity_stats(activity_id)
    ratings = feedback_service.aggregate(activity_id)
    return ActivityStats(**stats, average_rating=ratings["average_rating"], total_feedbacks=ratings["total_feedbacks"])


@router.get("/{activity_id}/exports/signups")
def export_activity_signups(
    activity_id: int,
    format: str = Query("csv", pattern="^(csv|xlsx)$"),
    ids: Optional[List[int]] = Query(None, description="可选，按报名ID筛选"),
    export_service: ExportService = Depends(get_export_service),
    current_admin: AdminUser = Depends(get_current_admin),
) -> StreamingResponse:
    result = export_service.activity_signups_export(activity_id, actor_admin_id=current_admin.id, fmt=format, ids=ids or None)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    filename, content = result
    return StreamingResponse(
        io.BytesIO(content),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" if filename.endswith(".xlsx") else "text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{activity_id}/exports/comments")
def export_activity_comments(
    activity_id: int,
    format: str = Query("csv", pattern="^(csv|xlsx)$"),
    export_service: ExportService = Depends(get_export_service),
    current_admin: AdminUser = Depends(get_current_admin),
) -> StreamingResponse:
    result = export_service.activity_comments_export(activity_id, actor_admin_id=current_admin.id, fmt=format)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    filename, content = result
    return StreamingResponse(
        io.BytesIO(content),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" if filename.endswith(".xlsx") else "text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{activity_id}/exports/shares")
def export_activity_shares(
    activity_id: int,
    format: str = Query("csv", pattern="^(csv|xlsx)$"),
    export_service: ExportService = Depends(get_export_service),
    current_admin: AdminUser = Depends(get_current_admin),
) -> StreamingResponse:
    result = export_service.activity_shares_export(activity_id, actor_admin_id=current_admin.id, fmt=format)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    filename, content = result
    return StreamingResponse(
        io.BytesIO(content),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" if filename.endswith(".xlsx") else "text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.patch("/{activity_id}", response_model=ActivityDetail)
def update_activity(
    activity_id: int,
    payload: ActivityUpdate,
    service: ActivityService = Depends(get_activity_service),
) -> ActivityDetail:
    try:
        activity = service.update(activity_id, payload)
    except InvalidStatusTransition as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    return activity


@router.post("/{activity_id}/checkin-token", response_model=ActivityDetail)
def generate_checkin_token(
    activity_id: int,
    expires_minutes: int = Query(60, ge=5, le=1440, description="Token有效期（分钟）"),
    service: ActivityService = Depends(get_activity_service),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ActivityDetail:
    activity = service.generate_checkin_token(
        activity_id,
        expires_minutes,
        actor_admin_id=current_admin.id,
    )
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    return activity


@router.delete("/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(
    activity_id: int,
    service: ActivityService = Depends(get_activity_service),
    current_admin: AdminUser = Depends(get_current_admin),
) -> None:
    if not service.delete(activity_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")


@router.get("/{activity_id}/signups/recent", response_model=List[RecentSignupUser])
def recent_activity_signups(
    activity_id: int,
    since_hours: int = Query(24, ge=1, le=168),
    limit: int = Query(3, ge=1, le=10),
    signup_service: SignupService = Depends(get_signup_service),
    activity_service: ActivityService = Depends(get_activity_service),
    current_admin: AdminUser = Depends(get_current_admin),
) -> List[RecentSignupUser]:
    act = activity_service.get(activity_id)
    if not act:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    return signup_service.recent_signups(activity_id, since_hours=since_hours, limit=limit)
