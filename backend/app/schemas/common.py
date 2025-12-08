"""Common Pydantic schema components."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    """Base schema class configured for ORM mode."""

    model_config = ConfigDict(from_attributes=True)


class TimestampedSchema(ORMModel):
    created_at: datetime
    updated_at: datetime
