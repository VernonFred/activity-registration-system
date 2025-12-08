"""Badge repository."""

from __future__ import annotations

from typing import Optional, Sequence

from sqlalchemy import Select, select
from sqlalchemy.orm import Session, selectinload

from app.models.badge import Badge, UserBadge


class BadgeRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def _badge_query(self) -> Select:
        return select(Badge)

    def list_badges(self) -> Sequence[Badge]:
        return self.session.execute(self._badge_query().order_by(Badge.created_at.desc())).scalars().all()

    def get_badge(self, badge_id: int) -> Badge | None:
        return self.session.get(Badge, badge_id)

    def get_badge_by_code(self, code: str) -> Optional[Badge]:
        return self.session.execute(select(Badge).where(Badge.code == code)).scalar_one_or_none()

    def create_badge(self, data: dict) -> Badge:
        badge = Badge(**data)
        self.session.add(badge)
        self.session.flush()
        return badge

    def create_user_badge(self, data: dict) -> UserBadge:
        user_badge = UserBadge(**data)
        self.session.add(user_badge)
        self.session.flush()
        return user_badge

    def get_user_badge(self, *, user_id: int, badge_id: int) -> UserBadge | None:
        query = select(UserBadge).where(UserBadge.user_id == user_id, UserBadge.badge_id == badge_id)
        return self.session.execute(query).scalar_one_or_none()

    def list_user_badges(self, user_id: int) -> Sequence[UserBadge]:
        query = (
            select(UserBadge)
            .options(selectinload(UserBadge.badge))
            .where(UserBadge.user_id == user_id)
            .order_by(UserBadge.awarded_at.desc())
        )
        return self.session.execute(query).scalars().all()
