"""Schemas related to authentication."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.schemas.common import ORMModel
from app.schemas.user import UserProfileRead


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    sub: str
    role: str
    exp: int


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class AdminProfile(ORMModel):
    id: int
    username: str
    is_active: bool
    last_login: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class WeChatLoginProfile(BaseModel):
    name: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    organization: Optional[str] = None
    title: Optional[str] = None
    avatar_url: Optional[str] = None


class WeChatLoginRequest(BaseModel):
    code: str
    profile: Optional[WeChatLoginProfile] = None


class WeChatLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileRead
