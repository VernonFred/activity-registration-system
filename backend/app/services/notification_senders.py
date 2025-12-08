"""Notification sender interfaces, implementations, and factory."""

from __future__ import annotations

from dataclasses import dataclass
import logging
from typing import Protocol

from app.models.enums import NotificationChannel, NotificationEvent


@dataclass
class NotificationContext:
    channel: NotificationChannel
    event: NotificationEvent
    user_id: int | None
    activity_id: int | None
    signup_id: int | None
    payload: dict | None


class NotificationSender(Protocol):
    def send(self, context: NotificationContext) -> None:
        """Send the notification represented by ``context``."""


class MockNotificationSender:
    """Default sender that simulates success without external integrations."""

    def send(self, context: NotificationContext) -> None:  # pragma: no cover - trivial
        return None


class LoggingNotificationSender:
    """Simple sender that writes notification payload to application logs."""

    def __init__(self, logger: logging.Logger | None = None) -> None:
        self.logger = logger or logging.getLogger("notification.sender")

    def send(self, context: NotificationContext) -> None:
        self.logger.info(
            "Notification dispatched",
            extra={
                "channel": context.channel.value,
                "event": context.event.value,
                "user_id": context.user_id,
                "activity_id": context.activity_id,
                "signup_id": context.signup_id,
                "payload": context.payload,
            },
        )


def create_sender(kind: str) -> NotificationSender:
    kind = (kind or "mock").strip().lower()
    if kind == "mock":
        return MockNotificationSender()
    if kind in {"log", "logging"}:
        return LoggingNotificationSender()
    raise ValueError(f"unsupported_notification_sender:{kind}")
