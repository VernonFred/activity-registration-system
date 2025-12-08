"""Service layer for managing badge automation rules."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional, Sequence

from sqlalchemy.orm import Session

from app.models.badge_rule import BadgeRule
from app.models.enums import AuditAction, AuditEntity, BadgeRuleType
from app.models.signup import Signup
from app.repositories.badge_rules import BadgeRuleRepository
from app.repositories.signups import SignupRepository
from app.repositories.badges import BadgeRepository
from app.services.badges import BadgeService
from app.services.audit import AuditLogService
from app.schemas.badge_rule import (
    BadgeRuleCreate,
    BadgeRuleRead,
    BadgeRuleUpdate,
    BadgeRulePreviewRequest,
    BadgeRulePreviewResult,
)


class BadgeRuleService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.rules = BadgeRuleRepository(session)
        self.signups = SignupRepository(session)
        self.badges = BadgeService(session)
        self.badge_repo = BadgeRepository(session)
        self.audit = AuditLogService(session)

    def list_rules(self, *, include_inactive: bool = True) -> Sequence[BadgeRuleRead]:
        rules = self.rules.list(is_active=None if include_inactive else True)
        return [BadgeRuleRead.model_validate(rule, from_attributes=True) for rule in rules]

    def create_rule(self, payload: BadgeRuleCreate) -> BadgeRuleRead:
        data = payload.model_dump()
        rule = self.rules.create(data)
        self.session.commit()
        self.audit.record(
            action=AuditAction.BADGE_RULE_CHANGED,
            entity_type=AuditEntity.BADGE_RULE,
            entity_id=rule.id,
            actor_admin_id=None,
            context={"operation": "create", "rule_type": rule.rule_type.value},
        )
        return BadgeRuleRead.model_validate(rule, from_attributes=True)

    def update_rule(self, rule_id: int, payload: BadgeRuleUpdate) -> Optional[BadgeRuleRead]:
        rule = self.rules.get(rule_id)
        if not rule:
            return None
        data = payload.model_dump(exclude_unset=True)
        self.rules.update(rule, data)
        self.session.commit()
        self.audit.record(
            action=AuditAction.BADGE_RULE_CHANGED,
            entity_type=AuditEntity.BADGE_RULE,
            entity_id=rule.id,
            actor_admin_id=None,
            context={"operation": "update"},
        )
        return BadgeRuleRead.model_validate(rule, from_attributes=True)

    def delete_rule(self, rule_id: int) -> bool:
        rule = self.rules.get(rule_id)
        if not rule:
            return False
        self.rules.delete(rule)
        self.session.commit()
        self.audit.record(
            action=AuditAction.BADGE_RULE_CHANGED,
            entity_type=AuditEntity.BADGE_RULE,
            entity_id=rule_id,
            actor_admin_id=None,
            context={"operation": "delete"},
        )
        return True

    def preview(self, rule_id: int, request: BadgeRulePreviewRequest) -> Optional[BadgeRulePreviewResult]:
        rule = self.rules.get(rule_id)
        if not rule:
            return None
        eligible, reason = self._evaluate_rule(
            rule,
            user_id=request.user_id,
            activity_id=request.activity_id,
            signup_id=None,
        )
        return BadgeRulePreviewResult(rule_id=rule.id, eligible=eligible, reason=reason)

    def evaluate_rules(self, *, event: str, user_id: int, activity_id: Optional[int], signup_id: Optional[int] = None) -> None:
        active_rules = self.rules.active_rules()
        for rule in active_rules:
            eligible, _ = self._evaluate_rule(rule, user_id=user_id, activity_id=activity_id, signup_id=signup_id)
            if eligible:
                try:
                    self.badges.award_badge_by_id(
                        user_id=user_id,
                        badge_id=rule.badge_id,
                        activity_id=activity_id,
                        notes=f"auto_rule:{rule.id}",
                    )
                    self.audit.record(
                        action=AuditAction.BADGE_RULE_TRIGGERED,
                        entity_type=AuditEntity.BADGE_RULE,
                        entity_id=rule.id,
                        actor_admin_id=None,
                        actor_user_id=user_id,
                        context={"badge_id": rule.badge_id, "event": event},
                    )
                except ValueError:
                    continue

    def _evaluate_rule(
        self,
        rule: BadgeRule,
        *,
        user_id: int,
        activity_id: Optional[int],
        signup_id: Optional[int] = None,
    ) -> tuple[bool, Optional[str]]:
        if not rule.is_active:
            return False, "rule_inactive"

        if rule.rule_type == BadgeRuleType.FIRST_APPROVED:
            existing = self.signups.count_user_approved_signups(user_id=user_id, exclude_signup_id=signup_id)
            if existing > 0:
                return False, "already_has_approval"
            return True, None

        if rule.rule_type == BadgeRuleType.TOTAL_APPROVED:
            total = self.signups.count_user_approved_signups(user_id=user_id, exclude_signup_id=None)
            threshold = rule.threshold or 0
            if total >= threshold:
                return True, None
            return False, f"requires_{threshold}" if threshold else "threshold_not_set"

        if rule.rule_type == BadgeRuleType.TOTAL_CHECKED_IN:
            total = self.signups.count_user_checked_in(user_id=user_id)
            threshold = rule.threshold or 0
            if total >= threshold:
                return True, None
            return False, f"requires_{threshold}" if threshold else "threshold_not_set"

        if rule.rule_type == BadgeRuleType.ACTIVITY_TAG_ATTENDANCE:
            if not activity_id:
                return False, "activity_required"
            if not rule.activity_tag_scope:
                return False, "tag_scope_missing"
            total = self.signups.count_user_approved_with_tags(user_id=user_id, tags=rule.activity_tag_scope)
            threshold = rule.threshold or 0
            if total >= threshold:
                return True, None
            return False, f"requires_{threshold}" if threshold else "threshold_not_set"

        return False, "unsupported_rule_type"
