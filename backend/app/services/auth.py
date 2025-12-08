"""Services for admin authentication."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

import httpx
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.admin import AdminUser
from app.models.user import UserProfile
from app.repositories.admin import AdminUserRepository
from app.repositories.users import UserRepository


class AuthService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.repo = AdminUserRepository(session)
        self.user_repo = UserRepository(session)
        self.settings = get_settings()

    def authenticate_admin(self, username: str, password: str) -> AdminUser | None:
        admin = self.repo.get_by_username(username)
        if not admin or not admin.is_active:
            return None
        if not verify_password(password, admin.hashed_password):
            return None
        return admin

    def create_token_for_admin(self, admin: AdminUser) -> str:
        expires = timedelta(minutes=self.settings.access_token_expire_minutes)
        return create_access_token({"sub": str(admin.id), "role": "admin"}, expires_delta=expires)

    def get_admin_by_id(self, admin_id: int) -> AdminUser | None:
        return self.session.get(AdminUser, admin_id)

    def record_login(self, admin: AdminUser) -> None:
        admin.last_login = datetime.now(timezone.utc)
        self.session.add(admin)
        self.session.commit()

    def ensure_default_admin(self, username: str, password: str) -> AdminUser:
        admin = self.repo.get_by_username(username)
        if admin:
            return admin
        hashed_password = get_password_hash(password)
        admin = self.repo.create(username=username, hashed_password=hashed_password)
        self.session.commit()
        return admin

    def _resolve_openid(self, code: str) -> dict[str, Any]:
        if (
            self.settings.wechat_mock_enabled
            or not self.settings.wechat_appid
            or not self.settings.wechat_secret
        ):
            return {"openid": f"mock-{code}"}

        params = {
            "appid": self.settings.wechat_appid,
            "secret": self.settings.wechat_secret,
            "js_code": code,
            "grant_type": "authorization_code",
        }
        url = f"{self.settings.wechat_api_base.rstrip('/')}/sns/jscode2session"
        try:
            response = httpx.get(url, params=params, timeout=self.settings.wechat_timeout)
            response.raise_for_status()
        except httpx.HTTPError as exc:  # pragma: no cover - network failure
            raise ValueError("wechat_request_failed") from exc

        try:
            data = response.json()
        except ValueError as exc:  # pragma: no cover - unexpected payload
            raise ValueError("wechat_invalid_response") from exc

        if data.get("errcode"):
            raise ValueError(f"wechat_error:{data.get('errmsg')}")
        if "openid" not in data:
            raise ValueError("wechat_response_missing_openid")
        return data

    def login_with_wechat(self, code: str, profile: dict[str, str] | None = None) -> tuple[UserProfile, str]:
        try:
            session_data = self._resolve_openid(code)
        except ValueError as exc:
            raise ValueError(str(exc)) from exc

        openid = session_data.get("openid")
        user = self.user_repo.get_by_openid(openid)
        data: dict[str, str] = {}
        if profile:
            for key in ("name", "mobile", "email", "organization", "title", "avatar_url"):
                value = profile.get(key)
                if value:
                    data[key] = value
        unionid = session_data.get("unionid")
        session_key = session_data.get("session_key")
        if unionid:
            data["unionid"] = unionid
        if session_key:
            extra = data.setdefault("extra", {})
            extra["session_key"] = session_key
        if not user:
            user = self.user_repo.create({"openid": openid, **data})
        elif data:
            self.user_repo.update(user, data)
        self.session.commit()
        expires = timedelta(minutes=self.settings.access_token_expire_minutes)
        token = create_access_token({"sub": str(user.id), "role": "user"}, expires_delta=expires)
        return user, token

    def get_user_by_id(self, user_id: int) -> UserProfile | None:
        return self.user_repo.get(user_id)
