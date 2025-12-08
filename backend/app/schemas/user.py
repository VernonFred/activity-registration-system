from datetime import datetime
from typing import Optional, List

from pydantic import Field

from app.schemas.common import ORMModel, TimestampedSchema


class UserProfileRead(TimestampedSchema):
    id: int
    openid: Optional[str] = None
    name: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    organization: Optional[str] = None
    title: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    tags: Optional[list[str]] = None
    extra: Optional[dict] = None


class UserProfileUpdate(ORMModel):
    """Schema for updating user profile."""
    name: Optional[str] = Field(None, max_length=100, description="姓名")
    mobile: Optional[str] = Field(None, max_length=20, description="手机号")
    email: Optional[str] = Field(None, max_length=120, description="邮箱")
    organization: Optional[str] = Field(None, max_length=200, description="学校/单位")
    title: Optional[str] = Field(None, max_length=120, description="职位/职称")
    avatar_url: Optional[str] = Field(None, max_length=255, description="头像URL")
    tags: Optional[List[str]] = Field(None, description="用户标签")
    extra: Optional[dict] = Field(None, description="扩展信息")
