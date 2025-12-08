"""Common model mixins used across SQLAlchemy models."""

from sqlalchemy import Column, DateTime, func


class TimestampMixin:
    """Provide created_at and updated_at columns."""

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
