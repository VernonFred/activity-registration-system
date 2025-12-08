"""Add admin users and signup review fields

Revision ID: 0002_admin_users_and_signup_review
Revises: 0001_initial_placeholder
Create Date: 2024-10-07 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision = "0002_admin_users_and_signup_review"
down_revision = "0001_initial_placeholder"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)

    if not inspector.has_table("admin_users"):
        op.create_table(
            "admin_users",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("username", sa.String(length=50), nullable=False, unique=True),
            sa.Column("hashed_password", sa.String(length=255), nullable=False),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
            sa.Column("last_login", sa.DateTime(timezone=True), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.text("CURRENT_TIMESTAMP"),
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.text("CURRENT_TIMESTAMP"),
                server_onupdate=sa.text("CURRENT_TIMESTAMP"),
            ),
            mysql_charset="utf8mb4",
            mysql_collate="utf8mb4_unicode_ci",
        )

    signup_columns = {col["name"] for col in inspector.get_columns("signups")}
    # 使用 batch 模式以兼容 SQLite
    with op.batch_alter_table("signups", recreate="auto") as batch_op:
        if "reviewed_by_admin_id" not in signup_columns:
            batch_op.add_column(
                sa.Column(
                    "reviewed_by_admin_id",
                    sa.Integer(),
                    nullable=True,
                ),
            )
        if "reviewed_at" not in signup_columns:
            batch_op.add_column(
                sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
            )


def downgrade() -> None:
    with op.batch_alter_table("signups", recreate="auto") as batch_op:
        batch_op.drop_column("reviewed_at")
        batch_op.drop_column("reviewed_by_admin_id")
    op.drop_table("admin_users")
