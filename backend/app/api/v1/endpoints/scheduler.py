"""Management endpoints for the lightweight scheduler."""

from typing import List

from fastapi import APIRouter, Depends, status

from app.api.deps import get_current_admin, get_scheduler_service
from app.services.scheduler import SchedulerService

router = APIRouter()


@router.get("/tasks")
def list_tasks(
    service: SchedulerService = Depends(get_scheduler_service),
    current_admin = Depends(get_current_admin),
) -> List[dict]:
    return service.list_tasks()


@router.post("/run", status_code=status.HTTP_200_OK)
def run_due_tasks(
    service: SchedulerService = Depends(get_scheduler_service),
    current_admin = Depends(get_current_admin),
) -> dict:
    results = service.run_due()
    return {"ran": results, "count": len(results)}

