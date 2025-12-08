from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "event-signup"
    environment: str = "development"
    api_prefix: str = "/api"
    database_url: str
    secret_key: str
    access_token_expire_minutes: int = 60
    wechat_appid: str | None = None
    wechat_secret: str | None = None
    wechat_api_base: str = "https://api.weixin.qq.com"
    wechat_mock_enabled: bool = True
    wechat_timeout: float = 5.0
    notification_mock_enabled: bool = True
    notification_sender_wechat: str = "mock"
    notification_sender_email: str = "mock"
    notification_sender_sms: str = "mock"
    badge_auto_rules_enabled: bool = True
    badge_first_attendance_code: str | None = "first_attendance"
    badge_checkin_code: str | None = "checkin_complete"
    badge_repeat_attendance_code: str | None = "repeat_attendance"
    badge_repeat_attendance_threshold: int = 3

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache
def get_settings() -> Settings:
    return Settings()
