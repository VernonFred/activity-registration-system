"""Pydantic schemas for activity form field configuration."""

from typing import List, Optional

from pydantic import Field

from app.models.enums import FieldType
from app.schemas.common import ORMModel, TimestampedSchema


class ActivityFormFieldOptionBase(ORMModel):
    label: str
    value: str
    display_order: int = 0
    is_default: bool = False
    extra: Optional[dict] = None


class ActivityFormFieldOptionCreate(ActivityFormFieldOptionBase):
    pass


class ActivityFormFieldOptionRead(ActivityFormFieldOptionBase, TimestampedSchema):
    id: int


class ActivityFormFieldBase(ORMModel):
    name: str
    label: str
    field_type: FieldType
    placeholder: Optional[str] = None
    helper_text: Optional[str] = None
    required: bool = False
    display_order: int = 0
    config: Optional[dict] = None
    visible: bool = True


class ActivityFormFieldCreate(ActivityFormFieldBase):
    preset_key: Optional[str] = None
    options: List[ActivityFormFieldOptionCreate] = Field(default_factory=list)


class ActivityFormFieldRead(ActivityFormFieldBase, TimestampedSchema):
    id: int
    preset_key: Optional[str] = None
    options: List[ActivityFormFieldOptionRead] = Field(default_factory=list)
