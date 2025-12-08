"""Common dependencies used across API endpoints."""

from typing import Annotated, List, Optional

from fastapi import Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import InvalidTokenError, safe_decode_token
from app.db.session import get_db
from app.models.admin import AdminUser
from app.models.enums import ActivityStatus
from app.models.user import UserProfile
from app.services.activities import ActivityService
from app.services.badges import BadgeService
from app.services.auth import AuthService
from app.services.notifications import NotificationService
from app.services.checkins import CheckinService
from app.services.feedbacks import ActivityFeedbackService
from app.services.signups import SignupService
from app.services.audit import AuditLogService
from app.services.exports import ExportService
from app.services.reports import ReportService
from app.services.engagements import ActivityEngagementService
from app.services.badge_rules import BadgeRuleService
from app.services.scheduler import SchedulerService

SessionDep = Annotated[Session, Depends(get_db)]
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def get_activity_service(session: SessionDep) -> ActivityService:
    return ActivityService(session)


def get_signup_service(session: SessionDep) -> SignupService:
    return SignupService(session)


def get_auth_service(session: SessionDep) -> AuthService:
    return AuthService(session)


def get_notification_service(session: SessionDep) -> NotificationService:
    return NotificationService(session)


def get_badge_service(session: SessionDep) -> BadgeService:
    return BadgeService(session)


def get_checkin_service(session: SessionDep) -> CheckinService:
    return CheckinService(session)


def get_feedback_service(session: SessionDep) -> ActivityFeedbackService:
    return ActivityFeedbackService(session)


def get_audit_log_service(session: SessionDep) -> AuditLogService:
    return AuditLogService(session)


def get_export_service(session: SessionDep) -> ExportService:
    return ExportService(session)


def get_report_service(session: SessionDep) -> ReportService:
    return ReportService(session)


def get_engagement_service(session: SessionDep) -> ActivityEngagementService:
    return ActivityEngagementService(session)


def get_badge_rule_service(session: SessionDep) -> BadgeRuleService:
    return BadgeRuleService(session)


def get_scheduler_service(session: SessionDep) -> SchedulerService:
    service = SchedulerService(session)
    service.register_defaults()
    return service


def get_current_admin(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: SessionDep,
) -> AdminUser:
    try:
        payload = safe_decode_token(token)
    except InvalidTokenError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    if payload.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    admin_id = payload.get("sub")
    if admin_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    auth_service = AuthService(session)
    admin = auth_service.get_admin_by_id(int(admin_id))
    if not admin or not admin.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive admin")
    return admin


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: SessionDep,
) -> UserProfile:
    try:
        payload = safe_decode_token(token)
    except InvalidTokenError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    if payload.get("role") not in {"user", "admin"}:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    auth_service = AuthService(session)
    user = auth_service.get_user_by_id(int(user_id))
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive user")
    return user


def get_optional_user(
    token: Annotated[str | None, Depends(oauth2_scheme_optional)],
    session: SessionDep,
) -> UserProfile | None:
    if not token:
        return None
    try:
        payload = safe_decode_token(token)
    except InvalidTokenError:
        return None
    if payload.get("role") not in {"user", "admin"}:
        return None
    user_id = payload.get("sub")
    if user_id is None:
        return None
    auth_service = AuthService(session)
    user = auth_service.get_user_by_id(int(user_id))
    if not user or not user.is_active:
        return None
    return user


def get_optional_admin(
    token: Annotated[str | None, Depends(oauth2_scheme_optional)],
    session: SessionDep,
) -> AdminUser | None:
    if not token:
        return None
    try:
        payload = safe_decode_token(token)
    except InvalidTokenError:
        return None
    if payload.get("role") != "admin":
        return None
    admin_id = payload.get("sub")
    if admin_id is None:
        return None
    auth_service = AuthService(session)
    admin = auth_service.get_admin_by_id(int(admin_id))
    if not admin or not admin.is_active:
        return None
    return admin


def activity_status_filters(
    statuses: Annotated[
        Optional[List[ActivityStatus]],
        Query(description="Filter activities by status"),
    ] = None,
) -> Optional[List[ActivityStatus]]:
    return statuses
