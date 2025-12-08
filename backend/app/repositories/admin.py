"""Admin user repository."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.admin import AdminUser


class AdminUserRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_by_username(self, username: str) -> AdminUser | None:
        return self.session.execute(
            select(AdminUser).where(AdminUser.username == username)
        ).scalar_one_or_none()

    def create(self, username: str, hashed_password: str, *, is_active: bool = True) -> AdminUser:
        admin = AdminUser(username=username, hashed_password=hashed_password, is_active=is_active)
        self.session.add(admin)
        self.session.flush()
        return admin
