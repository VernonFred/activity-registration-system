"""Enumerations shared among models."""

from enum import Enum


class StrEnum(str, Enum):
    """Base class to ensure enum values behave like strings."""

    def __str__(self) -> str:  # pragma: no cover - trivial
        return str(self.value)


class ActivityStatus(StrEnum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    CLOSED = "closed"
    ARCHIVED = "archived"


class FieldType(StrEnum):
    TEXT = "text"
    TEXTAREA = "textarea"
    NUMBER = "number"
    SELECT = "select"
    MULTI_SELECT = "multi_select"
    DATE = "date"
    TIME = "time"
    DATETIME = "datetime"
    RADIO = "radio"
    SWITCH = "switch"


class SignupStatus(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    WAITLISTED = "waitlisted"


class CheckinStatus(StrEnum):
    NOT_CHECKED_IN = "not_checked_in"
    CHECKED_IN = "checked_in"
    NO_SHOW = "no_show"


class NotificationChannel(StrEnum):
    WECHAT = "wechat"
    SMS = "sms"
    EMAIL = "email"


class NotificationStatus(StrEnum):
    PENDING = "pending"
    SENDING = "sending"
    SENT = "sent"
    FAILED = "failed"
    READ = "read"


class NotificationEvent(StrEnum):
    SIGNUP_SUBMITTED = "signup_submitted"
    SIGNUP_APPROVED = "signup_approved"
    SIGNUP_REJECTED = "signup_rejected"
    SIGNUP_REMINDER = "signup_reminder"
    CHECKIN_REMINDER = "checkin_reminder"


class AuditAction(StrEnum):
    ACTIVITY_CREATED = "activity_created"
    ACTIVITY_UPDATED = "activity_updated"
    CHECKIN_TOKEN_GENERATED = "checkin_token_generated"
    SIGNUP_REVIEWED = "signup_reviewed"
    NOTIFICATION_SENT = "notification_sent"
    BADGE_AWARDED = "badge_awarded"
    EXPORT_SIGNUPS = "export_signups"
    BADGE_RULE_CHANGED = "badge_rule_changed"
    BADGE_RULE_TRIGGERED = "badge_rule_triggered"
    TASK_RUN = "task_run"


class AuditEntity(StrEnum):
    ACTIVITY = "activity"
    SIGNUP = "signup"
    NOTIFICATION = "notification"
    BADGE = "badge"
    BADGE_RULE = "badge_rule"
    TASK = "task"


class BadgeRuleType(StrEnum):
    FIRST_APPROVED = "first_approved"
    TOTAL_APPROVED = "total_approved"
    TOTAL_CHECKED_IN = "total_checked_in"
    ACTIVITY_TAG_ATTENDANCE = "activity_tag_attendance"


def enum_values(enum_cls):
    """Return the list of string values for a StrEnum class."""
    return [item.value for item in enum_cls]
