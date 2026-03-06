"""Domain services for signup workflow."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional, Sequence

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.admin import AdminUser
from app.models.enums import AuditAction, AuditEntity, CheckinStatus, NotificationChannel, NotificationEvent, SignupStatus
from app.models.signup import Signup
from app.repositories.signups import SignupRepository
from app.schemas.signup import BulkReviewRequest, BulkReviewResult, RecentSignupUser, SignupCreate, SignupRead, SignupReviewRequest, SignupUpdate
from app.services.audit import AuditLogService
from app.services.badge_rules import BadgeRuleService
from app.services.badges import BadgeService
from app.services.notifications import NotificationService
from app.services.signup_badge_helpers import auto_award_on_approval
from app.services.signup_review_helpers import apply_review_decision, perform_bulk_review
from app.services.signup_schema_helpers import build_activity_stats, build_recent_signups, build_signup_schema


class SignupService:
    """Business logic around signup lifecycle."""

    def __init__(self, session: Session):
        self.repo = SignupRepository(session)
        self.session = session
        self.notifications = NotificationService(session)
        self.audit = AuditLogService(session)
        self.badges = BadgeService(session)
        self.badge_rules = BadgeRuleService(session)
        self.settings = get_settings()

    def list(
        self,
        *,
        activity_id: Optional[int] = None,
        user_id: Optional[int] = None,
        statuses: Optional[Sequence[SignupStatus]] = None,
        checkin_status: Optional[CheckinStatus] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
    ) -> Sequence[SignupRead]:
        signups = self.repo.list(
            activity_id=activity_id,
            user_id=user_id,
            statuses=statuses,
            checkin_status=checkin_status,
            limit=limit,
            offset=offset,
        )
        return [build_signup_schema(signup) for signup in signups]

    def get(self, signup_id: int) -> Optional[SignupRead]:
        signup = self.repo.get(signup_id)
        return build_signup_schema(signup) if signup else None

    def create(self, payload: SignupCreate, user_id: int) -> SignupRead:
        answers_payload = [
            {"field_id": answer.field_id, "value_text": answer.value_text, "value_json": answer.value_json}
            for answer in payload.answers
        ]
        signup = self.repo.create(
            {
                "activity_id": payload.activity_id,
                "user_id": user_id,
                "status": SignupStatus.PENDING,
                "checkin_status": CheckinStatus.NOT_CHECKED_IN,
                "extra": payload.extra,
            },
            answers_payload,
        )
        self.notifications.enqueue(
            user_id=user_id,
            activity_id=payload.activity_id,
            signup_id=signup.id,
            channel=NotificationChannel.WECHAT,
            event=NotificationEvent.SIGNUP_SUBMITTED,
        )
        self.session.commit()
        self.session.refresh(signup)
        return build_signup_schema(signup)

    def update(self, signup_id: int, payload: SignupUpdate) -> Optional[SignupRead]:
        signup = self.repo.get(signup_id)
        if not signup:
            return None

        data = payload.model_dump(exclude_unset=True, exclude={"answers"})
        self.repo.update(signup, data)
        if payload.answers is not None:
            self.repo.replace_answers(
                signup,
                [
                    {"field_id": answer.field_id, "value_text": answer.value_text, "value_json": answer.value_json}
                    for answer in payload.answers
                ],
            )
        self.session.commit()
        self.session.refresh(signup)
        return build_signup_schema(signup)

    def delete(self, signup_id: int) -> bool:
        signup = self.repo.get(signup_id)
        if not signup:
            return False
        self.repo.delete(signup)
        self.session.commit()
        return True

    def bulk_delete(self, ids: list[int]) -> int:
        return self.repo.delete_many(ids)

    def review(self, signup_id: int, admin: AdminUser, payload: SignupReviewRequest) -> Optional[SignupRead]:
        signup = self.repo.get(signup_id)
        if not signup:
            return None
        if signup.status not in {SignupStatus.PENDING, SignupStatus.WAITLISTED}:
            return build_signup_schema(signup)

        event = apply_review_decision(signup, action=payload.action.lower(), message=payload.message, admin_id=admin.id)
        self.notifications.enqueue(
            user_id=signup.user_id,
            activity_id=signup.activity_id,
            signup_id=signup.id,
            channel=NotificationChannel.WECHAT,
            event=event,
        )
        self.audit.record(
            action=AuditAction.SIGNUP_REVIEWED,
            entity_type=AuditEntity.SIGNUP,
            entity_id=signup.id,
            actor_admin_id=admin.id,
            context={"status": signup.status.value, "activity_id": signup.activity_id, "user_id": signup.user_id},
        )
        if signup.status == SignupStatus.APPROVED:
            self._auto_award_on_approval(signup)

        self.session.commit()
        self.session.refresh(signup)
        return build_signup_schema(signup)

    def _auto_award_on_approval(self, signup: Signup) -> None:
        auto_award_on_approval(
            repo=self.repo,
            badge_rules=self.badge_rules,
            badges=self.badges,
            settings=self.settings,
            signup=signup,
        )

    def send_reminder(self, signup_id: int, event: NotificationEvent) -> Optional[SignupRead]:
        signup = self.repo.get(signup_id)
        if not signup:
            return None
        self.notifications.enqueue(
            user_id=signup.user_id,
            activity_id=signup.activity_id,
            signup_id=signup.id,
            channel=NotificationChannel.WECHAT,
            event=event,
        )
        self.session.commit()
        self.session.refresh(signup)
        return build_signup_schema(signup)

    def bulk_review(self, admin: AdminUser, payload: BulkReviewRequest) -> BulkReviewResult:
        return perform_bulk_review(
            repo=self.repo,
            notifications=self.notifications,
            audit=self.audit,
            auto_award=self._auto_award_on_approval,
            session=self.session,
            admin=admin,
            payload=payload,
        )

    def checkin(self, signup_id: int, token: str, *, force: bool = False) -> Optional[SignupRead]:
        signup = self.repo.get(signup_id)
        if not signup:
            return None
        activity = signup.activity
        if not activity or not activity.checkin_token:
            raise ValueError("checkin_token_not_available")
        if not force:
            if token != activity.checkin_token:
                raise ValueError("invalid_checkin_token")
            if activity.checkin_token_expires_at and activity.checkin_token_expires_at < datetime.now(timezone.utc):
                raise ValueError("checkin_token_expired")
        if signup.status != SignupStatus.APPROVED:
            raise ValueError("signup_not_approved")
        if signup.checkin_status == CheckinStatus.CHECKED_IN and not force:
            raise ValueError("already_checked_in")
        signup.checkin_status = CheckinStatus.CHECKED_IN
        signup.checkin_time = datetime.now(timezone.utc)
        self.session.add(signup)
        self.session.commit()
        self.session.refresh(signup)
        return build_signup_schema(signup)

    def activity_stats(self, activity_id: int) -> dict:
        return build_activity_stats(activity_id, self.repo.activity_stats(activity_id))

    def count(
        self,
        *,
        activity_id: Optional[int] = None,
        user_id: Optional[int] = None,
        statuses: Optional[Sequence[SignupStatus]] = None,
        checkin_status: Optional[CheckinStatus] = None,
    ) -> int:
        return self.repo.count(activity_id=activity_id, user_id=user_id, statuses=statuses, checkin_status=checkin_status)

    def recent_signups(self, activity_id: int, *, since_hours: int = 24, limit: int = 3) -> list[RecentSignupUser]:
        return build_recent_signups(self.repo, activity_id, since_hours=since_hours, limit=limit)
