"""Repository for badge automation rules."""

from __future__ import annotations

from typing import Optional, Sequence

from sqlalchemy import Select, select
from sqlalchemy.orm import Session, selectinload

from app.models.badge_rule import BadgeRule
from app.models.enums import BadgeRuleType


class BadgeRuleRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def _base_query(self) -> Select:
        return select(BadgeRule).options(selectinload(BadgeRule.badge))

    def list(self, *, is_active: Optional[bool] = None) -> Sequence[BadgeRule]:
        query = self._base_query().order_by(BadgeRule.created_at.desc())
        if is_active is not None:
            query = query.where(BadgeRule.is_active == is_active)
        return self.session.execute(query).scalars().all()

    def active_rules(self) -> Sequence[BadgeRule]:
        return self.list(is_active=True)

    def get(self, rule_id: int) -> BadgeRule | None:
        return self.session.execute(self._base_query().where(BadgeRule.id == rule_id)).scalar_one_or_none()

    def create(self, data: dict) -> BadgeRule:
        rule = BadgeRule(**data)
        self.session.add(rule)
        self.session.flush()
        return rule

    def update(self, rule: BadgeRule, data: dict) -> BadgeRule:
        for key, value in data.items():
            setattr(rule, key, value)
        self.session.add(rule)
        self.session.flush()
        return rule

    def delete(self, rule: BadgeRule) -> None:
        self.session.delete(rule)
        self.session.flush()

    def rules_by_type(self, rule_type: BadgeRuleType) -> Sequence[BadgeRule]:
        query = self._base_query().where(BadgeRule.rule_type == rule_type, BadgeRule.is_active.is_(True))
        return self.session.execute(query).scalars().all()
