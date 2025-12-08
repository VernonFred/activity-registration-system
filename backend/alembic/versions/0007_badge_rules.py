"""Create badge_rules table

Revision ID: 0007_badge_rules
Revises: 0006_activity_engagements
Create Date: 2024-12-27 00:00:03
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "0007_badge_rules"
down_revision = "0006_activity_engagements"
branch_labels: tuple[str, ...] | None = None
depends_on: tuple[str, ...] | None = None


def upgrade() -> None:
    op.create_table(
        "badge_rules",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("rule_type", sa.String(length=50), nullable=False),
        sa.Column("badge_id", sa.Integer(), sa.ForeignKey("badges.id", ondelete="CASCADE"), nullable=False),
        sa.Column("threshold", sa.Integer(), nullable=True),
        sa.Column("activity_scope", sa.JSON(), nullable=True),
        sa.Column("activity_tag_scope", sa.JSON(), nullable=True),
        sa.Column("time_window_days", sa.Integer(), nullable=True),
        sa.Column("allow_repeat", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("notes", sa.String(length=255), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("config", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP"), server_onupdate=sa.text("CURRENT_TIMESTAMP")),
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )


def downgrade() -> None:
    op.drop_table("badge_rules")
