"""Domain services for user profile management."""

from __future__ import annotations

from typing import Optional

from sqlalchemy.orm import Session

from app.models.user import UserProfile
from app.schemas.user import UserProfileRead, UserProfileUpdate


class UserService:
    """Business logic around user profile management."""

    def __init__(self, session: Session):
        self.session = session

    def get(self, user_id: int) -> Optional[UserProfile]:
        """Get user by ID."""
        return self.session.get(UserProfile, user_id)

    def get_by_openid(self, openid: str) -> Optional[UserProfile]:
        """Get user by openid."""
        return self.session.query(UserProfile).filter(UserProfile.openid == openid).first()

    def update(self, user_id: int, payload: UserProfileUpdate) -> Optional[UserProfileRead]:
        """Update user profile."""
        user = self.get(user_id)
        if not user:
            return None

        data = payload.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(user, key, value)

        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        
        return self._to_schema(user)

    def _to_schema(self, user: UserProfile) -> UserProfileRead:
        """Convert model to schema."""
        return UserProfileRead(
            id=user.id,
            openid=user.openid,
            name=user.name,
            mobile=user.mobile,
            email=user.email,
            organization=user.organization,
            title=user.title,
            avatar_url=user.avatar_url,
            is_active=user.is_active,
            tags=user.tags,
            extra=user.extra,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )

