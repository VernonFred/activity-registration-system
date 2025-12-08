"""Reporting endpoints for administrative dashboards."""

from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_admin, get_report_service
from app.schemas.report import ReportOverview, ReportActivity
from app.services.reports import ReportService

router = APIRouter()


@router.get("/overview", response_model=ReportOverview)
def get_report_overview(
    days: int | None = Query(None, ge=1, le=365, description="统计时间范围（天）"),
    service: ReportService = Depends(get_report_service),
    current_admin=Depends(get_current_admin),
) -> ReportOverview:
    data = service.overview(days=days)
    return ReportOverview(**data)


@router.get("/activity/{activity_id}", response_model=ReportActivity)
def get_activity_report(
    activity_id: int,
    days: int | None = Query(None, ge=1, le=365, description="统计时间范围（天）"),
    service: ReportService = Depends(get_report_service),
    current_admin=Depends(get_current_admin),
) -> ReportActivity:
    data = service.activity_report(activity_id, days=days)
    return ReportActivity(**data)
