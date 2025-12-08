"""Authentication endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_auth_service, get_current_admin, get_current_user
from app.models.admin import AdminUser
from app.models.user import UserProfile
from app.schemas.auth import (
    AdminLoginRequest,
    AdminProfile,
    Token,
    WeChatLoginRequest,
    WeChatLoginResponse,
)
from app.schemas.user import UserProfileRead
from app.services.auth import AuthService

router = APIRouter()


@router.post("/login", response_model=Token)
def admin_login(payload: AdminLoginRequest, service: AuthService = Depends(get_auth_service)) -> Token:
    admin = service.authenticate_admin(payload.username, payload.password)
    if not admin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    service.record_login(admin)
    token = service.create_token_for_admin(admin)
    return Token(access_token=token)


@router.get("/me", response_model=AdminProfile)
def read_profile(current_admin: AdminUser = Depends(get_current_admin)) -> AdminProfile:
    return AdminProfile.model_validate(current_admin, from_attributes=True)


@router.post("/wechat-login", response_model=WeChatLoginResponse)
def wechat_login(payload: WeChatLoginRequest, service: AuthService = Depends(get_auth_service)) -> WeChatLoginResponse:
    try:
        user, token = service.login_with_wechat(
            code=payload.code,
            profile=payload.profile.model_dump() if payload.profile else None,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return WeChatLoginResponse(
        access_token=token,
        user=UserProfileRead.model_validate(user, from_attributes=True),
    )


@router.get("/user/me", response_model=UserProfileRead)
def read_user_profile(current_user: UserProfile = Depends(get_current_user)) -> UserProfileRead:
    return UserProfileRead.model_validate(current_user, from_attributes=True)
