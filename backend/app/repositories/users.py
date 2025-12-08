"""Repository for user profiles."""

from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import UserProfile


class UserRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get(self, user_id: int) -> Optional[UserProfile]:
        return self.session.get(UserProfile, user_id)

    def get_by_openid(self, openid: str) -> Optional[UserProfile]:
        return self.session.execute(
            select(UserProfile).where(UserProfile.openid == openid)
        ).scalar_one_or_none()

    def create(self, data: dict) -> UserProfile:
        user = UserProfile(**data)
        self.session.add(user)
        self.session.flush()
        return user

    def update(self, user: UserProfile, data: dict) -> UserProfile:
        for key, value in data.items():
            setattr(user, key, value)
        self.session.add(user)
        self.session.flush()
        return user
