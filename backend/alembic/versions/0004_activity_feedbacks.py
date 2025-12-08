"""Add activity feedback table

Revision ID: 0004_activity_feedbacks
Revises: 0003_sprint2_enhancements
Create Date: 2024-12-27 00:00:00
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "0004_activity_feedbacks"
down_revision = "0003_sprint2_enhancements"
branch_labels: tuple[str, ...] | None = None
depends_on: tuple[str, ...] | None = None


def upgrade() -> None:
    op.create_table(
        "activity_feedbacks",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("activity_id", sa.Integer(), sa.ForeignKey("activities.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("is_public", sa.Boolean(), nullable=False, server_default=sa.text("1")),
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
        sa.UniqueConstraint("activity_id", "user_id", name="uq_activity_feedback_user"),
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )
    op.create_index("ix_activity_feedbacks_activity_id", "activity_feedbacks", ["activity_id"])
    op.create_index("ix_activity_feedbacks_user_id", "activity_feedbacks", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_activity_feedbacks_user_id", table_name="activity_feedbacks")
    op.drop_index("ix_activity_feedbacks_activity_id", table_name="activity_feedbacks")
    op.drop_table("activity_feedbacks")
