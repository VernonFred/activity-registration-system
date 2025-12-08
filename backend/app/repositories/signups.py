"""Repository implementation for signup models."""

from __future__ import annotations

from datetime import datetime
from typing import Iterable, Sequence

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session, selectinload

from app.models.signup import Signup, SignupFieldAnswer
from app.models.activity import Activity
from app.models.enums import CheckinStatus, SignupStatus


class SignupRepository:
    """Encapsulate signup persistence operations."""

    def __init__(self, session: Session):
        self.session = session

    def _base_query(self) -> Select:
        return select(Signup).options(
            selectinload(Signup.answers),
            selectinload(Signup.activity),
            selectinload(Signup.user),
        )

    def list(
        self,
        *,
        activity_id: int | None = None,
        user_id: int | None = None,
        statuses: Iterable[SignupStatus] | None = None,
        checkin_status: CheckinStatus | None = None,
        limit: int | None = None,
        offset: int | None = None,
    ) -> Sequence[Signup]:
        query = self._base_query()
        if activity_id is not None:
            query = query.where(Signup.activity_id == activity_id)
        if user_id is not None:
            query = query.where(Signup.user_id == user_id)
        if statuses:
            query = query.where(Signup.status.in_(list(statuses)))
        if checkin_status is not None:
            query = query.where(Signup.checkin_status == checkin_status)
        query = query.order_by(Signup.created_at.desc())
        if limit:
            query = query.limit(limit)
        if offset:
            query = query.offset(offset)
        return self.session.execute(query).scalars().all()

    def get(self, signup_id: int) -> Signup | None:
        return self.session.execute(
            self._base_query().where(Signup.id == signup_id)
        ).scalar_one_or_none()

    def get_by_user_activity(self, *, user_id: int, activity_id: int) -> Signup | None:
        query = self._base_query().where(
            Signup.user_id == user_id,
            Signup.activity_id == activity_id,
        )
        return self.session.execute(query).scalar_one_or_none()

    def count_user_approved_signups(self, *, user_id: int, exclude_signup_id: int | None = None) -> int:
        query = select(func.count()).where(
            Signup.user_id == user_id,
            Signup.status == SignupStatus.APPROVED,
        )
        if exclude_signup_id is not None:
            query = query.where(Signup.id != exclude_signup_id)
        return self.session.execute(query).scalar_one()

    def count_user_checked_in(self, *, user_id: int) -> int:
        query = select(func.count()).where(
            Signup.user_id == user_id,
            Signup.checkin_status == CheckinStatus.CHECKED_IN,
        )
        return self.session.execute(query).scalar_one()

    def count_user_approved_with_tags(self, *, user_id: int, tags: list[str]) -> int:
        if not tags:
            return 0
        query = self._base_query().where(
            Signup.user_id == user_id,
            Signup.status == SignupStatus.APPROVED,
        )
        signups = self.session.execute(query).scalars().all()
        total = 0
        for signup in signups:
            activity = signup.activity
            if activity and activity.tags:
                if any(tag in (activity.tags or []) for tag in tags):
                    total += 1
        return total

    def count(
        self,
        *,
        activity_id: int | None = None,
        user_id: int | None = None,
        statuses: Iterable[SignupStatus] | None = None,
        checkin_status: CheckinStatus | None = None,
    ) -> int:
        query = select(func.count()).select_from(Signup)
        if activity_id is not None:
            query = query.where(Signup.activity_id == activity_id)
        if user_id is not None:
            query = query.where(Signup.user_id == user_id)
        if statuses:
            query = query.where(Signup.status.in_(list(statuses)))
        if checkin_status is not None:
            query = query.where(Signup.checkin_status == checkin_status)
        return self.session.execute(query).scalar_one()

    def create(self, data: dict, answers: list[dict]) -> Signup:
        signup = Signup(**data)
        for answer in answers:
            signup.answers.append(SignupFieldAnswer(**answer))
        self.session.add(signup)
        self.session.flush()
        return signup

    def update(self, signup: Signup, data: dict) -> Signup:
        for key, value in data.items():
            setattr(signup, key, value)
        self.session.add(signup)
        self.session.flush()
        return signup

    def delete(self, signup: Signup) -> None:
        self.session.delete(signup)
        self.session.flush()

    def replace_answers(self, signup: Signup, answers: list[dict]) -> None:
        for existing in list(signup.answers):
            self.session.delete(existing)
        self.session.flush()
        for answer in answers:
            signup.answers.append(SignupFieldAnswer(**answer))
        self.session.flush()

    def activity_stats(self, activity_id: int) -> dict[str, dict]:
        status_rows = self.session.execute(
            select(Signup.status, func.count())
            .where(Signup.activity_id == activity_id)
            .group_by(Signup.status)
        ).all()
        checkin_rows = self.session.execute(
            select(Signup.checkin_status, func.count())
            .where(Signup.activity_id == activity_id)
            .group_by(Signup.checkin_status)
        ).all()
        return {
            "status": {status: count for status, count in status_rows},
            "checkin": {status: count for status, count in checkin_rows},
        }

    def overall_counts(self, *, since: datetime | None = None) -> dict[str, int]:
        query = select(func.count()).select_from(Signup)
        if since is not None:
            query = query.where(Signup.created_at >= since)
        total = self.session.execute(query).scalar_one()

        approved_query = select(func.count()).select_from(Signup).where(Signup.status == SignupStatus.APPROVED)
        if since is not None:
            approved_query = approved_query.where(Signup.created_at >= since)
        approved = self.session.execute(approved_query).scalar_one()

        checkin_query = select(func.count()).select_from(Signup).where(
            Signup.checkin_status == CheckinStatus.CHECKED_IN
        )
        if since is not None:
            checkin_query = checkin_query.where(Signup.created_at >= since)
        checked_in = self.session.execute(checkin_query).scalar_one()
        return {
            "total": total,
            "approved": approved,
            "checked_in": checked_in,
        }

    def delete_many(self, ids: list[int]) -> int:
        """Bulk delete signups by IDs."""
        if not ids:
            return 0
        signups = self.session.execute(
            select(Signup).where(Signup.id.in_(ids))
        ).scalars().all()
        deleted = 0
        for signup in signups:
            self.session.delete(signup)
            deleted += 1
        self.session.commit()
        return deleted

    def get_many(self, ids: list[int]) -> Sequence[Signup]:
        """Get multiple signups by IDs."""
        if not ids:
            return []
        return self.session.execute(
            self._base_query().where(Signup.id.in_(ids))
        ).scalars().all()
