"""Services to handle check-in verification logic."""

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.enums import CheckinStatus, NotificationChannel, NotificationEvent, SignupStatus
from app.models.signup import Signup
from app.repositories.signups import SignupRepository
from app.services.notifications import NotificationService
from app.services.badge_rules import BadgeRuleService
from app.services.badges import BadgeService
from app.core.config import get_settings


class CheckinService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.repo = SignupRepository(session)
        self.notifications = NotificationService(session)
        self.badge_rules = BadgeRuleService(session)
        self.badges = BadgeService(session)
        self.settings = get_settings()

    def verify_token(self, signup: Signup, token: str, *, force: bool = False) -> None:
        activity = signup.activity
        if not activity or not activity.checkin_token:
            raise ValueError("checkin_token_not_available")
        if not force:
            if token != activity.checkin_token:
                raise ValueError("invalid_checkin_token")
            if activity.checkin_token_expires_at:
                expires_at = activity.checkin_token_expires_at
                if expires_at.tzinfo is None:
                    expires_at = expires_at.replace(tzinfo=timezone.utc)
                if expires_at < datetime.now(timezone.utc):
                    raise ValueError("checkin_token_expired")
        if signup.status != SignupStatus.APPROVED:
            raise ValueError("signup_not_approved")
        if signup.checkin_status == CheckinStatus.CHECKED_IN and not force:
            raise ValueError("already_checked_in")

    def checkin(self, signup_id: int, token: str, *, force: bool = False) -> Signup:
        signup = self.repo.get(signup_id)
        if not signup:
            raise ValueError("signup_not_found")
        self.verify_token(signup, token, force=force)

        signup.checkin_status = CheckinStatus.CHECKED_IN
        signup.checkin_time = datetime.now(timezone.utc)
        self.session.add(signup)

        self.notifications.enqueue(
            user_id=signup.user_id,
            activity_id=signup.activity_id,
            signup_id=signup.id,
            channel=NotificationChannel.WECHAT,
            event=NotificationEvent.CHECKIN_REMINDER,
        )

        # 规则平台评估（签到事件）
        try:
            self.badge_rules.evaluate_rules(
                event="checkin",
                user_id=signup.user_id,
                activity_id=signup.activity_id,
                signup_id=signup.id,
            )
        except Exception:
            pass

        self._auto_award_on_checkin(signup)

        self.session.commit()
        self.session.refresh(signup)
        return signup

    def _auto_award_on_checkin(self, signup: Signup) -> None:
        if not self.settings.badge_auto_rules_enabled:
            return
        badge_code = self.settings.badge_checkin_code
        if not badge_code:
            return
        try:
            self.badges.award_badge(
                user_id=signup.user_id,
                badge_code=badge_code,
                activity_id=signup.activity_id,
                notes="auto_award_checkin",
            )
        except ValueError:
            return
