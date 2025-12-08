"""Pydantic schemas for signup companions."""

from typing import Optional, List

from pydantic import Field

from app.schemas.common import ORMModel, TimestampedSchema


class CompanionCreate(ORMModel):
    """Schema for creating a companion."""
    name: str = Field(..., max_length=100, description="同行人姓名")
    mobile: Optional[str] = Field(None, max_length=20, description="手机号")
    organization: Optional[str] = Field(None, max_length=200, description="学校/单位")
    title: Optional[str] = Field(None, max_length=120, description="职位/职称")
    extra: Optional[dict] = Field(None, description="扩展信息")


class CompanionUpdate(ORMModel):
    """Schema for updating a companion."""
    name: Optional[str] = Field(None, max_length=100, description="同行人姓名")
    mobile: Optional[str] = Field(None, max_length=20, description="手机号")
    organization: Optional[str] = Field(None, max_length=200, description="学校/单位")
    title: Optional[str] = Field(None, max_length=120, description="职位/职称")
    extra: Optional[dict] = Field(None, description="扩展信息")


class CompanionRead(TimestampedSchema):
    """Schema for reading a companion."""
    id: int
    signup_id: int
    name: str
    mobile: Optional[str] = None
    organization: Optional[str] = None
    title: Optional[str] = None
    extra: Optional[dict] = None


class CompanionListResponse(ORMModel):
    """Response for listing companions."""
    companions: List[CompanionRead]
    total: int

