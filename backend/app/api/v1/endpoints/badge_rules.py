"""Badge rule management endpoints."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_badge_rule_service, get_current_admin
from app.schemas.badge_rule import (
    BadgeRuleCreate,
    BadgeRuleRead,
    BadgeRuleUpdate,
    BadgeRulePreviewRequest,
    BadgeRulePreviewResult,
)
from app.services.badge_rules import BadgeRuleService

router = APIRouter()


@router.get("", response_model=List[BadgeRuleRead])
def list_badge_rules(
    service: BadgeRuleService = Depends(get_badge_rule_service),
    current_admin=Depends(get_current_admin),
) -> List[BadgeRuleRead]:
    return list(service.list_rules(include_inactive=True))


@router.post("", response_model=BadgeRuleRead, status_code=status.HTTP_201_CREATED)
def create_badge_rule(
    payload: BadgeRuleCreate,
    service: BadgeRuleService = Depends(get_badge_rule_service),
    current_admin=Depends(get_current_admin),
) -> BadgeRuleRead:
    return service.create_rule(payload)


@router.patch("/{rule_id}", response_model=BadgeRuleRead)
def update_badge_rule(
    rule_id: int,
    payload: BadgeRuleUpdate,
    service: BadgeRuleService = Depends(get_badge_rule_service),
    current_admin=Depends(get_current_admin),
) -> BadgeRuleRead:
    rule = service.update_rule(rule_id, payload)
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="badge_rule_not_found")
    return rule


@router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_badge_rule(
    rule_id: int,
    service: BadgeRuleService = Depends(get_badge_rule_service),
    current_admin=Depends(get_current_admin),
) -> None:
    if not service.delete_rule(rule_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="badge_rule_not_found")


@router.post("/{rule_id}/preview", response_model=BadgeRulePreviewResult)
def preview_badge_rule(
    rule_id: int,
    payload: BadgeRulePreviewRequest,
    service: BadgeRuleService = Depends(get_badge_rule_service),
    current_admin=Depends(get_current_admin),
) -> BadgeRulePreviewResult:
    result = service.preview(rule_id, payload)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="badge_rule_not_found")
    return result
