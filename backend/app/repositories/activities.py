"""Repository implementation for activity models."""

from __future__ import annotations

from typing import Iterable, Sequence

from sqlalchemy import Select, select
from sqlalchemy.orm import Session, selectinload

from app.models.activity import Activity
from app.models.enums import ActivityStatus
from app.models.form_field import ActivityFormField


class ActivityRepository:
    """Encapsulate activity persistence operations."""

    def __init__(self, session: Session):
        self.session = session

    def _base_query(self) -> Select:
        return select(Activity).options(
            selectinload(Activity.form_fields).selectinload(ActivityFormField.options),
            selectinload(Activity.signups),
        )

    def list(
        self,
        *,
        statuses: Iterable[ActivityStatus] | None = None,
        keyword: str | None = None,
        limit: int | None = None,
        offset: int | None = None,
    ) -> Sequence[Activity]:
        query = self._base_query()
        if statuses:
            query = query.where(Activity.status.in_(statuses))
        if keyword:
            like_pattern = f"%{keyword}%"
            query = query.where(Activity.title.ilike(like_pattern))
        query = query.order_by(
            Activity.start_time.is_(None),
            Activity.start_time.desc(),
            Activity.id.desc(),
        )
        if limit:
            query = query.limit(limit)
        if offset:
            query = query.offset(offset)
        return self.session.execute(query).scalars().all()

    def get(self, activity_id: int) -> Activity | None:
        return self.session.get(Activity, activity_id)

    def create(self, data: dict) -> Activity:
        activity = Activity(**data)
        self.session.add(activity)
        self.session.flush()
        return activity

    def update(self, activity: Activity, data: dict) -> Activity:
        for key, value in data.items():
            setattr(activity, key, value)
        self.session.add(activity)
        self.session.flush()
        return activity

    def delete(self, activity: Activity) -> None:
        self.session.delete(activity)
        self.session.flush()

    def count(
        self,
        *,
        statuses: Iterable[ActivityStatus] | None = None,
        keyword: str | None = None,
    ) -> int:
        from sqlalchemy import func, select
        query = select(func.count()).select_from(Activity)
        if statuses:
            query = query.where(Activity.status.in_(statuses))
        if keyword:
            like_pattern = f"%{keyword}%"
            query = query.where(Activity.title.ilike(like_pattern))
        return self.session.execute(query).scalar_one()
