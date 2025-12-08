"""Utility helpers for generating secure tokens."""

from __future__ import annotations

import secrets


def generate_token(length: int = 32) -> str:
    """Generate a URL-safe token with approximately ``length`` characters."""
    bytes_length = max(16, length * 3 // 4)
    return secrets.token_urlsafe(bytes_length)[:length]
