"""Security utilities for authentication and password hashing."""

from datetime import datetime, timedelta, timezone
import json
import base64
import hashlib
import hmac
from typing import Any, Optional

from passlib.context import CryptContext

from app.core.config import get_settings

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

settings = get_settings()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip("=")


def _b64decode(data: str) -> bytes:
    padding = '=' * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def create_access_token(data: dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta
        if expires_delta is not None
        else timedelta(minutes=settings.access_token_expire_minutes)
    )
    to_encode["exp"] = int(expire.timestamp())
    payload = json.dumps(to_encode, separators=(",", ":"), sort_keys=True).encode()
    signature = hmac.new(settings.secret_key.encode(), payload, hashlib.sha256).digest()
    return f"{_b64encode(payload)}.{_b64encode(signature)}"


class InvalidTokenError(Exception):
    """Raised when token decoding fails."""


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        payload_part, signature_part = token.split(".")
    except ValueError as exc:
        raise InvalidTokenError("Malformed token") from exc

    payload_bytes = _b64decode(payload_part)
    signature = _b64decode(signature_part)
    expected_signature = hmac.new(settings.secret_key.encode(), payload_bytes, hashlib.sha256).digest()
    if not hmac.compare_digest(signature, expected_signature):
        raise InvalidTokenError("Invalid signature")

    try:
        payload = json.loads(payload_bytes)
    except json.JSONDecodeError as exc:
        raise InvalidTokenError("Invalid payload") from exc
    exp = payload.get("exp")
    if exp is None or int(exp) < int(datetime.now(timezone.utc).timestamp()):
        raise InvalidTokenError("Token expired")
    return payload


def safe_decode_token(token: str) -> dict[str, Any]:
    return decode_access_token(token)
