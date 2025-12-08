"""Activity form field configuration models."""

from __future__ import annotations

from typing import TYPE_CHECKING, List

from sqlalchemy import Boolean, Column, Enum, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, relationship

from app.db.base import Base
from app.models.enums import FieldType, enum_values
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:  # pragma: no cover
    from app.models.activity import Activity
    from app.models.signup import SignupFieldAnswer


class ActivityFormField(TimestampMixin, Base):
    __tablename__ = "activity_form_fields"

    id: Mapped[int] = Column(Integer, primary_key=True, autoincrement=True)
    activity_id: Mapped[int] = Column(
        Integer, ForeignKey("activities.id", ondelete="CASCADE"), nullable=False, index=True
    )
    preset_key: Mapped[str | None] = Column(String(100), nullable=True)
    name: Mapped[str] = Column(String(100), nullable=False)
    label: Mapped[str] = Column(String(150), nullable=False)
    field_type: Mapped[FieldType] = Column(Enum(FieldType, name="activity_field_type"), nullable=False)
    field_type: Mapped[FieldType] = Column(
        Enum(FieldType, name="activity_field_type", values_callable=enum_values), nullable=False
    )
    placeholder: Mapped[str | None] = Column(String(200), nullable=True)
    helper_text: Mapped[str | None] = Column(Text, nullable=True)
    required: Mapped[bool] = Column(Boolean, nullable=False, default=False)
    display_order: Mapped[int] = Column(Integer, nullable=False, default=0)
    config: Mapped[dict | None] = Column(JSON, nullable=True)
    visible: Mapped[bool] = Column(Boolean, nullable=False, default=True)

    activity: Mapped["Activity"] = relationship("Activity", back_populates="form_fields")
    options: Mapped[List["ActivityFormFieldOption"]] = relationship(
        "ActivityFormFieldOption",
        back_populates="field",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="ActivityFormFieldOption.display_order",
    )
    answers: Mapped[List["SignupFieldAnswer"]] = relationship(
        "SignupFieldAnswer",
        back_populates="field",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    __table_args__ = (
        {
            "mysql_charset": "utf8mb4",
            "mysql_collate": "utf8mb4_unicode_ci",
        },
    )

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"ActivityFormField(id={self.id!r}, label={self.label!r}, type={self.field_type!r})"


class ActivityFormFieldOption(TimestampMixin, Base):
    __tablename__ = "activity_form_field_options"

    id: Mapped[int] = Column(Integer, primary_key=True, autoincrement=True)
    field_id: Mapped[int] = Column(
        Integer, ForeignKey("activity_form_fields.id", ondelete="CASCADE"), nullable=False, index=True
    )
    label: Mapped[str] = Column(String(150), nullable=False)
    value: Mapped[str] = Column(String(150), nullable=False)
    display_order: Mapped[int] = Column(Integer, nullable=False, default=0)
    is_default: Mapped[bool] = Column(Boolean, nullable=False, default=False)
    extra: Mapped[dict | None] = Column(JSON, nullable=True)

    field: Mapped["ActivityFormField"] = relationship("ActivityFormField", back_populates="options")

    __table_args__ = (
        {
            "mysql_charset": "utf8mb4",
            "mysql_collate": "utf8mb4_unicode_ci",
        },
    )

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"ActivityFormFieldOption(id={self.id!r}, label={self.label!r})"
