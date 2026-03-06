"""Pydantic schemas for frontend registration form data."""

from typing import Any, Dict, List, Optional

from pydantic import Field

from app.schemas.common import ORMModel


class RegistrationStepPayload(ORMModel):
    """Dynamic signup step payload."""

    step_key: str = Field(..., min_length=1, max_length=100, description="步骤键")
    step_title: str = Field(default="", max_length=120, description="步骤标题")
    values: Dict[str, Any] = Field(default_factory=dict, description="当前步骤的键值表单数据")


class RegistrationFormData(ORMModel):
    """前端报名表单完整数据结构。"""

    activity_id: int = Field(..., gt=0, description="活动ID")
    steps: List[RegistrationStepPayload] = Field(default_factory=list, description="动态步骤数据")

    # backward compatibility for legacy clients
    personal: Optional[Dict[str, Any]] = Field(None, description="旧版个人信息")
    payment: Optional[Dict[str, Any]] = Field(None, description="旧版缴费信息")
    accommodation: Optional[Dict[str, Any]] = Field(None, description="旧版住宿信息")
    transport: Optional[Dict[str, Any]] = Field(None, description="旧版交通信息")


class RegistrationResponse(ORMModel):
    """报名成功响应。"""

    success: bool = Field(True, description="是否成功")
    signup_id: int = Field(..., description="报名ID")
    message: str = Field(default="报名成功", description="提示信息")
