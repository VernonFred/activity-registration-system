"""Domain services for signup companions."""

from __future__ import annotations

from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.companion import SignupCompanion
from app.models.signup import Signup
from app.schemas.companion import CompanionCreate, CompanionRead, CompanionUpdate


class CompanionService:
    """Business logic for managing signup companions."""

    def __init__(self, session: Session):
        self.session = session

    def list_by_signup(self, signup_id: int) -> List[CompanionRead]:
        """List all companions for a signup."""
        companions = self.session.query(SignupCompanion).filter(
            SignupCompanion.signup_id == signup_id
        ).order_by(SignupCompanion.created_at.asc()).all()
        return [self._to_schema(c) for c in companions]

    def get(self, companion_id: int) -> Optional[CompanionRead]:
        """Get a companion by ID."""
        companion = self.session.get(SignupCompanion, companion_id)
        if not companion:
            return None
        return self._to_schema(companion)

    def create(self, signup_id: int, payload: CompanionCreate) -> CompanionRead:
        """Create a new companion for a signup."""
        # Verify signup exists
        signup = self.session.get(Signup, signup_id)
        if not signup:
            raise ValueError("Signup not found")

        companion = SignupCompanion(
            signup_id=signup_id,
            name=payload.name,
            mobile=payload.mobile,
            organization=payload.organization,
            title=payload.title,
            extra=payload.extra,
        )
        self.session.add(companion)
        self.session.commit()
        self.session.refresh(companion)
        return self._to_schema(companion)

    def update(self, companion_id: int, payload: CompanionUpdate) -> Optional[CompanionRead]:
        """Update a companion."""
        companion = self.session.get(SignupCompanion, companion_id)
        if not companion:
            return None

        data = payload.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(companion, key, value)

        self.session.add(companion)
        self.session.commit()
        self.session.refresh(companion)
        return self._to_schema(companion)

    def delete(self, companion_id: int) -> bool:
        """Delete a companion."""
        companion = self.session.get(SignupCompanion, companion_id)
        if not companion:
            return False
        self.session.delete(companion)
        self.session.commit()
        return True

    def count_by_signup(self, signup_id: int) -> int:
        """Count companions for a signup."""
        return self.session.query(SignupCompanion).filter(
            SignupCompanion.signup_id == signup_id
        ).count()

    def _to_schema(self, companion: SignupCompanion) -> CompanionRead:
        """Convert model to schema."""
        return CompanionRead(
            id=companion.id,
            signup_id=companion.signup_id,
            name=companion.name,
            mobile=companion.mobile,
            organization=companion.organization,
            title=companion.title,
            extra=companion.extra,
            created_at=companion.created_at,
            updated_at=companion.updated_at,
        )

