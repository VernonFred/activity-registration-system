"""Sprint 2 enhancements: notifications, badges, check-in token

Revision ID: 0003_sprint2_enhancements
Revises: 0002_admin_users_and_signup_review
Create Date: 2025-10-07 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0003_sprint2_enhancements"
down_revision = "0002_admin_users_and_signup_review"
branch_labels = None
depends_on = None


notification_channel_enum = sa.Enum(
    "wechat",
    "sms",
    "email",
    name="notification_channel",
)
notification_status_enum = sa.Enum(
    "pending",
    "sending",
    "sent",
    "failed",
    name="notification_status",
)
notification_event_enum = sa.Enum(
    "signup_submitted",
    "signup_approved",
    "signup_rejected",
    "signup_reminder",
    "checkin_reminder",
    name="notification_event",
)


def upgrade() -> None:
    op.add_column("activities", sa.Column("checkin_token", sa.String(length=64), nullable=True))
    op.add_column(
        "activities",
        sa.Column("checkin_token_expires_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_activities_checkin_token", "activities", ["checkin_token"], unique=True)

    op.create_table(
        "badges",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("code", sa.String(length=50), nullable=False, unique=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.Column("icon_url", sa.String(length=255), nullable=True),
        sa.Column("criteria", sa.JSON(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
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

    op.create_table(
        "user_badges",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("badge_id", sa.Integer(), sa.ForeignKey("badges.id", ondelete="CASCADE"), nullable=False),
        sa.Column("activity_id", sa.Integer(), sa.ForeignKey("activities.id", ondelete="SET NULL"), nullable=True),
        sa.Column(
            "awarded_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column("notes", sa.String(length=255), nullable=True),
        sa.UniqueConstraint("user_id", "badge_id", name="uq_user_badges_user_badge"),
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )

    notification_channel_enum.create(op.get_bind(), checkfirst=True)
    notification_status_enum.create(op.get_bind(), checkfirst=True)
    notification_event_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "notification_logs",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user_profiles.id", ondelete="SET NULL"), nullable=True),
        sa.Column("signup_id", sa.Integer(), sa.ForeignKey("signups.id", ondelete="SET NULL"), nullable=True),
        sa.Column("activity_id", sa.Integer(), sa.ForeignKey("activities.id", ondelete="SET NULL"), nullable=True),
        sa.Column("channel", notification_channel_enum, nullable=False),
        sa.Column("event", notification_event_enum, nullable=False),
        sa.Column(
            "status",
            notification_status_enum,
            nullable=False,
            server_default=sa.text("'pending'"),
        ),
        sa.Column("payload", sa.JSON(), nullable=True),
        sa.Column("error_message", sa.String(length=255), nullable=True),
        sa.Column("scheduled_send_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("retry_count", sa.Integer(), nullable=False, server_default=sa.text("0")),
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


def downgrade() -> None:
    op.drop_table("notification_logs")

    notification_event_enum.drop(op.get_bind(), checkfirst=True)
    notification_status_enum.drop(op.get_bind(), checkfirst=True)
    notification_channel_enum.drop(op.get_bind(), checkfirst=True)

    op.drop_table("user_badges")
    op.drop_table("badges")

    op.drop_index("ix_activities_checkin_token", table_name="activities")
    op.drop_column("activities", "checkin_token_expires_at")
    op.drop_column("activities", "checkin_token")
