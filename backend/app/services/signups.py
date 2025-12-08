"""Domain services for signup workflow."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional, Sequence

from sqlalchemy.orm import Session

from app.models.admin import AdminUser
from app.models.enums import (
    AuditAction,
    AuditEntity,
    CheckinStatus,
    NotificationChannel,
    NotificationEvent,
    SignupStatus,
    BadgeRuleType,
)
from app.models.signup import Signup
from app.repositories.signups import SignupRepository
from app.services.notifications import NotificationService
from app.services.audit import AuditLogService
from app.services.badges import BadgeService
from app.services.badge_rules import BadgeRuleService
from app.core.config import get_settings
from app.schemas.signup import (
    SignupAnswer,
    SignupCreate,
    SignupRead,
    SignupReviewRequest,
    SignupUpdate,
    RecentSignupUser,
    BulkReviewRequest,
    BulkReviewResult,
)


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
        return [self._to_schema(s) for s in signups]

    def get(self, signup_id: int) -> Optional[SignupRead]:
        signup = self.repo.get(signup_id)
        if not signup:
            return None
        return self._to_schema(signup)

    def create(self, payload: SignupCreate, user_id: int) -> SignupRead:
        answers_payload = [
            {
                "field_id": answer.field_id,
                "value_text": answer.value_text,
                "value_json": answer.value_json,
            }
            for answer in payload.answers
        ]
        signup_data = {
            "activity_id": payload.activity_id,
            "user_id": user_id,
            "status": SignupStatus.PENDING,
            "checkin_status": CheckinStatus.NOT_CHECKED_IN,
            "extra": payload.extra,
        }
        signup = self.repo.create(signup_data, answers_payload)
        self.notifications.enqueue(
            user_id=user_id,
            activity_id=payload.activity_id,
            signup_id=signup.id,
            channel=NotificationChannel.WECHAT,
            event=NotificationEvent.SIGNUP_SUBMITTED,
        )
        self.session.commit()
        self.session.refresh(signup)
        return self._to_schema(signup)

    def update(self, signup_id: int, payload: SignupUpdate) -> Optional[SignupRead]:
        signup = self.repo.get(signup_id)
        if not signup:
            return None

        data = payload.model_dump(
            exclude_unset=True,
            exclude={"answers"},
        )
        self.repo.update(signup, data)
        if payload.answers is not None:
            answers_payload = [
                {
                    "field_id": answer.field_id,
                    "value_text": answer.value_text,
                    "value_json": answer.value_json,
                }
                for answer in payload.answers
            ]
            self.repo.replace_answers(signup, answers_payload)
        self.session.commit()
        self.session.refresh(signup)
        return self._to_schema(signup)

    def delete(self, signup_id: int) -> bool:
        signup = self.repo.get(signup_id)
        if not signup:
            return False
        self.repo.delete(signup)
        self.session.commit()
        return True

    def bulk_delete(self, ids: list[int]) -> int:
        return self.repo.delete_many(ids)

    def review(
        self,
        signup_id: int,
        admin: AdminUser,
        payload: SignupReviewRequest,
    ) -> Optional[SignupRead]:
        signup = self.repo.get(signup_id)
        if not signup:
            return None
        if signup.status not in {SignupStatus.PENDING, SignupStatus.WAITLISTED}:
            return self._to_schema(signup)

        now = datetime.now(timezone.utc)
        action = payload.action.lower()
        if action == "approve":
            signup.status = SignupStatus.APPROVED
            signup.approval_remark = payload.message
            signup.rejection_reason = None
            signup.approved_at = now
            event = NotificationEvent.SIGNUP_APPROVED
        else:
            signup.status = SignupStatus.REJECTED
            signup.rejection_reason = payload.message
            signup.approval_remark = None
            signup.approved_at = None
            event = NotificationEvent.SIGNUP_REJECTED

        signup.reviewed_by_admin_id = admin.id
        signup.reviewed_at = now

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
            context={
                "status": signup.status.value,
                "activity_id": signup.activity_id,
                "user_id": signup.user_id,
            },
        )

        if signup.status == SignupStatus.APPROVED:
            self._auto_award_on_approval(signup)

        self.session.commit()
        self.session.refresh(signup)
        return self._to_schema(signup)

    def _auto_award_on_approval(self, signup: Signup) -> None:
        if not self.settings.badge_auto_rules_enabled:
            return
        # 1) 规则平台评估（可选、多种策略）
        try:
            self.badge_rules.evaluate_rules(
                event="signup_approved",
                user_id=signup.user_id,
                activity_id=signup.activity_id,
                signup_id=signup.id,
            )
        except Exception:
            # 规则评估异常不影响兜底逻辑
            pass

        # 2) 向后兼容的兜底：基于环境变量的首次/多次参会自动授勋
        first_badge = getattr(self.settings, "badge_first_attendance_code", None)
        if first_badge:
            existing = self.repo.count_user_approved_signups(
                user_id=signup.user_id,
                exclude_signup_id=signup.id,
            )
            if existing == 0:
                try:
                    self.badges.award_badge(
                        user_id=signup.user_id,
                        badge_code=first_badge,
                        activity_id=signup.activity_id,
                        notes="auto_award_first_attendance",
                    )
                except ValueError:
                    pass

        repeat_badge = getattr(self.settings, "badge_repeat_attendance_code", None)
        threshold = getattr(self.settings, "badge_repeat_attendance_threshold", 0)
        if repeat_badge and threshold and threshold > 1:
            total = self.repo.count_user_approved_signups(
                user_id=signup.user_id,
                exclude_signup_id=None,
            )
            if total >= threshold:
                try:
                    self.badges.award_badge(
                        user_id=signup.user_id,
                        badge_code=repeat_badge,
                        activity_id=signup.activity_id,
                        notes=f"auto_award_repeat_attendance_{total}",
                    )
                except ValueError:
                    pass

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
        return self._to_schema(signup)

    def bulk_review(
        self,
        admin: AdminUser,
        payload: BulkReviewRequest,
    ) -> BulkReviewResult:
        """Bulk review multiple signups at once."""
        signups = self.repo.get_many(payload.signup_ids)
        signup_map = {s.id: s for s in signups}
        
        now = datetime.now(timezone.utc)
        action = payload.action.lower()
        
        success = 0
        failed = 0
        skipped = 0
        details = []
        
        for signup_id in payload.signup_ids:
            signup = signup_map.get(signup_id)
            if not signup:
                failed += 1
                details.append({"id": signup_id, "status": "not_found"})
                continue
            
            if signup.status not in {SignupStatus.PENDING, SignupStatus.WAITLISTED}:
                skipped += 1
                details.append({
                    "id": signup_id,
                    "status": "skipped",
                    "reason": f"current_status_{signup.status.value}"
                })
                continue
            
            try:
                if action == "approve":
                    signup.status = SignupStatus.APPROVED
                    signup.approval_remark = payload.remark
                    signup.rejection_reason = None
                    signup.approved_at = now
                    event = NotificationEvent.SIGNUP_APPROVED
                else:
                    signup.status = SignupStatus.REJECTED
                    signup.rejection_reason = payload.remark
                    signup.approval_remark = None
                    signup.approved_at = None
                    event = NotificationEvent.SIGNUP_REJECTED
                
                signup.reviewed_by_admin_id = admin.id
                signup.reviewed_at = now
                
                self.notifications.enqueue(
                    user_id=signup.user_id,
                    activity_id=signup.activity_id,
                    signup_id=signup.id,
                    channel=NotificationChannel.WECHAT,
                    event=event,
                )
                
                if signup.status == SignupStatus.APPROVED:
                    self._auto_award_on_approval(signup)
                
                success += 1
                details.append({"id": signup_id, "status": "success", "new_status": signup.status.value})
            except Exception as e:
                failed += 1
                details.append({"id": signup_id, "status": "error", "reason": str(e)})
        
        # Record audit log for bulk operation
        self.audit.record(
            action=AuditAction.SIGNUP_REVIEWED,
            entity_type=AuditEntity.SIGNUP,
            entity_id=0,  # bulk operation
            actor_admin_id=admin.id,
            context={
                "bulk": True,
                "action": action,
                "total": len(payload.signup_ids),
                "success": success,
                "failed": failed,
                "skipped": skipped,
            },
        )
        
        self.session.commit()
        
        return BulkReviewResult(
            success=success,
            failed=failed,
            skipped=skipped,
            details=details,
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
        return self._to_schema(signup)

    def activity_stats(self, activity_id: int) -> dict:
        counts = self.repo.activity_stats(activity_id)
        status_counts = {status: 0 for status in SignupStatus}
        for status, count in counts["status"].items():
            status_counts[status] = count
        checkin_counts = {status: 0 for status in CheckinStatus}
        for status, count in counts["checkin"].items():
            checkin_counts[status] = count
        total = sum(status_counts.values())
        return {
            "activity_id": activity_id,
            "total_signups": total,
            "status_counts": {status.value: count for status, count in status_counts.items()},
            "checkin_counts": {status.value: count for status, count in checkin_counts.items()},
        }

    def count(
        self,
        *,
        activity_id: Optional[int] = None,
        user_id: Optional[int] = None,
        statuses: Optional[Sequence[SignupStatus]] = None,
        checkin_status: Optional[CheckinStatus] = None,
    ) -> int:
        return self.repo.count(
            activity_id=activity_id,
            user_id=user_id,
            statuses=statuses,
            checkin_status=checkin_status,
        )

    def recent_signups(self, activity_id: int, *, since_hours: int = 24, limit: int = 3) -> list[RecentSignupUser]:
        all_signups = self.repo.list(activity_id=activity_id, limit=200)
        now_ts = datetime.now(timezone.utc).timestamp()
        def _ts(dt):
            if not dt:
                return 0
            if dt.tzinfo is None:
                return dt.replace(tzinfo=timezone.utc).timestamp()
            return dt.timestamp()
        within = [s for s in all_signups if (now_ts - _ts(s.created_at)) <= since_hours * 3600]
        pool = within if within else all_signups
        result: list[RecentSignupUser] = []
        for s in pool[:limit]:
            user = s.user
            result.append(
                RecentSignupUser(
                    user_id=s.user_id,
                    name=user.name if user else None,
                    avatar_url=user.avatar_url if user else None,
                    created_at=s.created_at,
                )
            )
        return result

    def _to_schema(self, signup: Signup) -> SignupRead:
        return SignupRead(
            id=signup.id,
            activity_id=signup.activity_id,
            user_id=signup.user_id,
            status=signup.status,
            checkin_status=signup.checkin_status,
            approval_remark=signup.approval_remark,
            rejection_reason=signup.rejection_reason,
            approved_at=signup.approved_at,
            cancelled_at=signup.cancelled_at,
            checkin_time=signup.checkin_time,
            form_snapshot=signup.form_snapshot,
            extra=signup.extra,
            reviewed_by_admin_id=signup.reviewed_by_admin_id,
            reviewed_at=signup.reviewed_at,
            answers=[
                SignupAnswer(
                    field_id=answer.field_id,
                    value_text=answer.value_text,
                    value_json=answer.value_json,
                )
                for answer in signup.answers
            ],
            created_at=signup.created_at,
            updated_at=signup.updated_at,
        )
