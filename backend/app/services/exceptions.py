"""Custom exceptions for service layer."""


class ServiceError(Exception):
    """Base class for service layer errors."""


class InvalidStatusTransition(ServiceError):
    """Raised when activity status transition is not allowed."""

    def __init__(self, current_status: str, target_status: str) -> None:
        message = f"Cannot change status from {current_status} to {target_status}"
        super().__init__(message)
        self.current_status = current_status
        self.target_status = target_status
