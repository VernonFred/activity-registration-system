import pytest

from app.core.security import safe_decode_token
from app.services.auth import AuthService


def test_authenticate_admin_success(session):
    service = AuthService(session)
    admin = service.ensure_default_admin("admin", "Admin@123")

    assert service.authenticate_admin("admin", "Admin@123") == admin
    assert service.authenticate_admin("admin", "wrong") is None

    token = service.create_token_for_admin(admin)
    payload = safe_decode_token(token)
    assert payload["sub"] == str(admin.id)
    assert payload["role"] == "admin"


def test_wechat_login_mock_mode(session):
    service = AuthService(session)
    user, token = service.login_with_wechat("code-123")

    assert user.openid == "mock-code-123"
    assert token


def test_wechat_login_real_success(session, monkeypatch):
    service = AuthService(session)
    service.settings.wechat_mock_enabled = False
    service.settings.wechat_appid = "appid"
    service.settings.wechat_secret = "secret"

    class DummyResponse:
        def __init__(self, payload):
            self._payload = payload

        def raise_for_status(self):
            return None

        def json(self):
            return self._payload

    monkeypatch.setattr(
        "app.services.auth.httpx.get",
        lambda url, params, timeout: DummyResponse({"openid": "real-openid","session_key": "session-value"}),
    )

    user, token = service.login_with_wechat("valid-code", {"name": "张三"})

    assert user.openid == "real-openid"
    assert user.name == "张三"
    assert user.extra["session_key"] == "session-value"
    assert token


def test_wechat_login_real_error(session, monkeypatch):
    service = AuthService(session)
    service.settings.wechat_mock_enabled = False
    service.settings.wechat_appid = "appid"
    service.settings.wechat_secret = "secret"

    class ErrorResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return {"errcode": 40029, "errmsg": "invalid code"}

    monkeypatch.setattr(
        "app.services.auth.httpx.get",
        lambda url, params, timeout: ErrorResponse(),
    )

    with pytest.raises(ValueError, match="wechat_error"):
        service.login_with_wechat("bad-code")
