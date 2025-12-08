"""Repository for activity feedback."""

from __future__ import annotations

from typing import Optional, Sequence

from datetime import datetime
from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session, selectinload

from app.models.activity_feedback import ActivityFeedback


class ActivityFeedbackRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def _base_query(self) -> Select:
        return select(ActivityFeedback).options(
            selectinload(ActivityFeedback.user),
            selectinload(ActivityFeedback.activity),
        )

    def get(self, feedback_id: int) -> ActivityFeedback | None:
        return self.session.get(ActivityFeedback, feedback_id)

    def get_by_user_activity(self, *, user_id: int, activity_id: int) -> ActivityFeedback | None:
        query = self._base_query().where(
            ActivityFeedback.user_id == user_id, ActivityFeedback.activity_id == activity_id
        )
        return self.session.execute(query).scalar_one_or_none()

    def list_for_activity(
        self,
        *,
        activity_id: int,
        is_public: Optional[bool] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
    ) -> Sequence[ActivityFeedback]:
        query = self._base_query().where(ActivityFeedback.activity_id == activity_id)
        if is_public is not None:
            query = query.where(ActivityFeedback.is_public == is_public)
        query = query.order_by(ActivityFeedback.created_at.desc())
        if limit:
            query = query.limit(limit)
        if offset:
            query = query.offset(offset)
        return self.session.execute(query).scalars().all()

    def list_for_user(self, *, user_id: int) -> Sequence[ActivityFeedback]:
        query = self._base_query().where(ActivityFeedback.user_id == user_id).order_by(
            ActivityFeedback.created_at.desc()
        )
        return self.session.execute(query).scalars().all()

    def create_or_update(self, payload: dict) -> ActivityFeedback:
        feedback = self.get_by_user_activity(user_id=payload["user_id"], activity_id=payload["activity_id"])
        if feedback:
            for key, value in payload.items():
                setattr(feedback, key, value)
        else:
            feedback = ActivityFeedback(**payload)
            self.session.add(feedback)
        self.session.flush()
        return feedback

    def delete(self, feedback: ActivityFeedback) -> None:
        self.session.delete(feedback)
        self.session.flush()

    def aggregate_for_activity(self, activity_id: int) -> dict[str, float | int | None]:
        avg_rating = self.session.execute(
            select(func.avg(ActivityFeedback.rating), func.count(ActivityFeedback.id)).where(
                ActivityFeedback.activity_id == activity_id
            )
        ).one()
        return {
            "average_rating": float(avg_rating[0]) if avg_rating[0] is not None else None,
            "total_feedbacks": int(avg_rating[1]),
        }

    def aggregate_overall(self, *, since: datetime | None = None) -> dict[str, float | int | None]:
        query = select(func.avg(ActivityFeedback.rating), func.count(ActivityFeedback.id))
        if since is not None:
            query = query.where(ActivityFeedback.created_at >= since)
        row = self.session.execute(query).one()
        return {
            "average_rating": float(row[0]) if row[0] is not None else None,
            "total_feedbacks": int(row[1]),
        }

    def get_by_user_activity(self, *, activity_id: int, user_id: int) -> ActivityFeedback | None:
        query = select(ActivityFeedback).where(
            ActivityFeedback.activity_id == activity_id, ActivityFeedback.user_id == user_id
        )
        return self.session.execute(query).scalar_one_or_none()
