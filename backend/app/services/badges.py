"""Services for managing badges."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.models.activity import Activity
from app.models.badge import Badge, UserBadge
from app.models.user import UserProfile
from app.repositories.badges import BadgeRepository


class BadgeService:
    def __init__(self, session: Session) -> None:
        self.repo = BadgeRepository(session)
        self.session = session

    def list_badges(self) -> list[Badge]:
        return list(self.repo.list_badges())

    def create_badge(self, code: str, name: str, **kwargs) -> Badge:
        if self.repo.get_badge_by_code(code):
            raise ValueError("badge_code_exists")
        badge = self.repo.create_badge({"code": code, "name": name, **kwargs})
        self.session.commit()
        return badge

    def award_badge(
        self,
        *,
        user_id: int,
        badge_code: str,
        activity_id: Optional[int] = None,
        notes: Optional[str] = None,
    ) -> UserBadge:
        badge = self.repo.get_badge_by_code(badge_code)
        if not badge:
            raise ValueError("badge_not_found")
        if not badge.is_active:
            raise ValueError("badge_inactive")

        user = self.session.get(UserProfile, user_id)
        if not user:
            raise ValueError("user_not_found")
        if not user.is_active:
            raise ValueError("user_inactive")

        if activity_id is not None:
            activity = self.session.get(Activity, activity_id)
            if not activity:
                raise ValueError("activity_not_found")

        if self.repo.get_user_badge(user_id=user_id, badge_id=badge.id):
            raise ValueError("badge_already_awarded")

        awarded = self.repo.create_user_badge(
            {
                "user_id": user_id,
                "badge_id": badge.id,
                "activity_id": activity_id,
                "notes": notes,
                "awarded_at": datetime.now(timezone.utc),
            }
        )
        self.session.commit()
        self.session.refresh(awarded)
        return awarded

    def list_user_badges(self, user_id: int) -> list[UserBadge]:
        return list(self.repo.list_user_badges(user_id))

    def award_badge_by_id(
        self,
        *,
        user_id: int,
        badge_id: int,
        activity_id: Optional[int] = None,
        notes: Optional[str] = None,
    ) -> UserBadge:
        badge = self.repo.get_badge(badge_id)
        if not badge:
            raise ValueError("badge_not_found")
        return self.award_badge(
            user_id=user_id,
            badge_code=badge.code,
            activity_id=activity_id,
            notes=notes,
        )
