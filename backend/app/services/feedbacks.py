"""Services handling activity feedback lifecycle."""

from __future__ import annotations

from typing import Optional, Sequence

from sqlalchemy.orm import Session

from app.models.enums import CheckinStatus, SignupStatus
from app.models.signup import Signup
from app.repositories.feedbacks import ActivityFeedbackRepository
from app.repositories.signups import SignupRepository
from app.schemas.feedback import ActivityFeedbackRead, ActivityFeedbackSubmit


class ActivityFeedbackService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.repo = ActivityFeedbackRepository(session)
        self.signups = SignupRepository(session)

    def _validate_signup(self, *, user_id: int, activity_id: int) -> Signup:
        signup = self.signups.get_by_user_activity(user_id=user_id, activity_id=activity_id)
        if not signup:
            raise ValueError("signup_not_found")
        if signup.status != SignupStatus.APPROVED:
            raise ValueError("signup_not_approved")
        if signup.checkin_status != CheckinStatus.CHECKED_IN:
            raise ValueError("signup_not_checked_in")
        return signup

    def submit_feedback(self, *, user_id: int, activity_id: int, payload: ActivityFeedbackSubmit) -> ActivityFeedbackRead:
        if not 1 <= payload.rating <= 5:
            raise ValueError("invalid_rating")
        self._validate_signup(user_id=user_id, activity_id=activity_id)
        feedback = self.repo.create_or_update(
            {
                "user_id": user_id,
                "activity_id": activity_id,
                "rating": payload.rating,
                "comment": payload.comment,
                "is_public": payload.is_public,
            }
        )
        self.session.commit()
        self.session.refresh(feedback)
        return ActivityFeedbackRead.model_validate(feedback, from_attributes=True)

    def list_activity_feedbacks(
        self,
        *,
        activity_id: int,
        is_public: Optional[bool],
        limit: Optional[int],
        offset: Optional[int],
    ) -> Sequence[ActivityFeedbackRead]:
        feedbacks = self.repo.list_for_activity(
            activity_id=activity_id,
            is_public=is_public,
            limit=limit,
            offset=offset,
        )
        return [ActivityFeedbackRead.model_validate(fb, from_attributes=True) for fb in feedbacks]

    def get_my_feedback(self, *, user_id: int, activity_id: int) -> ActivityFeedbackRead | None:
        feedback = self.repo.get_by_user_activity(user_id=user_id, activity_id=activity_id)
        if not feedback:
            return None
        return ActivityFeedbackRead.model_validate(feedback, from_attributes=True)

    def delete_feedback(self, *, user_id: int, activity_id: int) -> bool:
        feedback = self.repo.get_by_user_activity(user_id=user_id, activity_id=activity_id)
        if not feedback:
            return False
        self.repo.delete(feedback)
        self.session.commit()
        return True

    def aggregate(self, activity_id: int) -> dict[str, float | int | None]:
        return self.repo.aggregate_for_activity(activity_id)
