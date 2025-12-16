"""Pydantic schemas for WeChat related APIs."""

from pydantic import Field

from app.schemas.common import ORMModel


class PhoneDecryptRequest(ORMModel):
    """微信手机号解密请求"""
    code: str = Field(..., min_length=1, description="微信返回的code")


class PhoneDecryptResponse(ORMModel):
    """微信手机号解密响应"""
    success: bool = Field(..., description="是否成功")
    phone_number: str = Field(None, description="解密后的手机号")
    error_message: str = Field(None, description="错误信息")
