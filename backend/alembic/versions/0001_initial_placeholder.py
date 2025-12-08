"""Initial schema placeholder

Revision ID: 0001_initial_placeholder
Revises: 
Create Date: 2024-03-11 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0001_initial_placeholder"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    activity_status_enum = sa.Enum(
        "draft", "scheduled", "published", "closed", "archived", name="activity_status"
    )
    field_type_enum = sa.Enum(
        "text",
        "textarea",
        "number",
        "select",
        "multi_select",
        "date",
        "time",
        "datetime",
        "radio",
        "switch",
        name="activity_field_type",
    )
    signup_status_enum = sa.Enum(
        "pending", "approved", "rejected", "cancelled", "waitlisted", name="signup_status"
    )
    checkin_status_enum = sa.Enum(
        "not_checked_in", "checked_in", "no_show", name="checkin_status"
    )

    bind = op.get_bind()
    activity_status_enum.create(bind, checkfirst=True)
    field_type_enum.create(bind, checkfirst=True)
    signup_status_enum.create(bind, checkfirst=True)
    checkin_status_enum.create(bind, checkfirst=True)

    op.create_table(
        "user_profiles",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("openid", sa.String(length=64), nullable=True),
        sa.Column("unionid", sa.String(length=64), nullable=True),
        sa.Column("name", sa.String(length=100), nullable=True),
        sa.Column("mobile", sa.String(length=20), nullable=True),
        sa.Column("email", sa.String(length=120), nullable=True),
        sa.Column("title", sa.String(length=120), nullable=True),
        sa.Column("organization", sa.String(length=200), nullable=True),
        sa.Column("avatar_url", sa.String(length=255), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("tags", sa.JSON(), nullable=True),
        sa.Column("extra", sa.JSON(), nullable=True),
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
        sa.UniqueConstraint("openid", name="uq_user_profiles_openid"),
        sa.UniqueConstraint("unionid", name="uq_user_profiles_unionid"),
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )
    op.create_index("ix_user_profiles_mobile", "user_profiles", ["mobile"], unique=False)

    op.create_table(
        "activities",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("code", sa.String(length=50), nullable=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("subtitle", sa.String(length=255), nullable=True),
        sa.Column("category", sa.String(length=100), nullable=True),
        sa.Column("tags", sa.JSON(), nullable=True),
        sa.Column("cover_image_url", sa.String(length=255), nullable=True),
        sa.Column("banner_image_url", sa.String(length=255), nullable=True),
        sa.Column("city", sa.String(length=100), nullable=True),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("location_detail", sa.String(length=255), nullable=True),
        sa.Column("contact_name", sa.String(length=100), nullable=True),
        sa.Column("contact_phone", sa.String(length=30), nullable=True),
        sa.Column("contact_email", sa.String(length=120), nullable=True),
        sa.Column("status", activity_status_enum, nullable=False, server_default="draft"),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("agenda", sa.Text(), nullable=True),
        sa.Column("materials", sa.JSON(), nullable=True),
        sa.Column("start_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("end_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("signup_start_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("signup_end_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("checkin_start_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("checkin_end_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("max_participants", sa.Integer(), nullable=True),
        sa.Column("approval_required", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("require_payment", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("allow_feedback", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("allow_waitlist", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("group_qr_image_url", sa.String(length=255), nullable=True),
        sa.Column("publish_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("archive_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("extra", sa.JSON(), nullable=True),
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
        sa.UniqueConstraint("code", name="uq_activities_code"),
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )
    op.create_index("ix_activities_status", "activities", ["status"], unique=False)
    op.create_index("ix_activities_start_time", "activities", ["start_time"], unique=False)

    op.create_table(
        "activity_form_fields",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "activity_id",
            sa.Integer(),
            sa.ForeignKey("activities.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("preset_key", sa.String(length=100), nullable=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("label", sa.String(length=150), nullable=False),
        sa.Column("field_type", field_type_enum, nullable=False),
        sa.Column("placeholder", sa.String(length=200), nullable=True),
        sa.Column("helper_text", sa.Text(), nullable=True),
        sa.Column("required", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("config", sa.JSON(), nullable=True),
        sa.Column("visible", sa.Boolean(), nullable=False, server_default=sa.text("1")),
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
        sa.UniqueConstraint(
            "activity_id", "name", name="uq_activity_form_fields_activity_name"
        ),
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )
    op.create_index(
        "ix_activity_form_fields_activity_id",
        "activity_form_fields",
        ["activity_id"],
        unique=False,
    )

    op.create_table(
        "activity_form_field_options",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "field_id",
            sa.Integer(),
            sa.ForeignKey("activity_form_fields.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("label", sa.String(length=150), nullable=False),
        sa.Column("value", sa.String(length=150), nullable=False),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("is_default", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("extra", sa.JSON(), nullable=True),
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
    op.create_index(
        "ix_activity_form_field_options_field_id",
        "activity_form_field_options",
        ["field_id"],
        unique=False,
    )

    op.create_table(
        "signups",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "activity_id",
            sa.Integer(),
            sa.ForeignKey("activities.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("user_profiles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("status", signup_status_enum, nullable=False, server_default="pending"),
        sa.Column("checkin_status", checkin_status_enum, nullable=False, server_default="not_checked_in"),
        sa.Column("approval_remark", sa.String(length=255), nullable=True),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("checkin_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("form_snapshot", sa.JSON(), nullable=True),
        sa.Column("extra", sa.JSON(), nullable=True),
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
        sa.UniqueConstraint("activity_id", "user_id", name="uq_signups_activity_user"),
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )
    op.create_index("ix_signups_activity_id", "signups", ["activity_id"], unique=False)
    op.create_index("ix_signups_user_id", "signups", ["user_id"], unique=False)

    op.create_table(
        "signup_field_answers",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "signup_id",
            sa.Integer(),
            sa.ForeignKey("signups.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "field_id",
            sa.Integer(),
            sa.ForeignKey("activity_form_fields.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("value_text", sa.Text(), nullable=True),
        sa.Column("value_json", sa.JSON(), nullable=True),
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
        sa.UniqueConstraint("signup_id", "field_id", name="uq_signup_field_answers_unique"),
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )
    op.create_index(
        "ix_signup_field_answers_signup_id",
        "signup_field_answers",
        ["signup_id"],
        unique=False,
    )
    op.create_index(
        "ix_signup_field_answers_field_id",
        "signup_field_answers",
        ["field_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_signup_field_answers_field_id", table_name="signup_field_answers")
    op.drop_index("ix_signup_field_answers_signup_id", table_name="signup_field_answers")
    op.drop_table("signup_field_answers")

    op.drop_index("ix_signups_user_id", table_name="signups")
    op.drop_index("ix_signups_activity_id", table_name="signups")
    op.drop_table("signups")

    op.drop_index(
        "ix_activity_form_field_options_field_id", table_name="activity_form_field_options"
    )
    op.drop_table("activity_form_field_options")

    op.drop_index("ix_activity_form_fields_activity_id", table_name="activity_form_fields")
    op.drop_table("activity_form_fields")

    op.drop_index("ix_activities_start_time", table_name="activities")
    op.drop_index("ix_activities_status", table_name="activities")
    op.drop_table("activities")

    op.drop_index("ix_user_profiles_mobile", table_name="user_profiles")
    op.drop_table("user_profiles")

    checkin_status_enum = sa.Enum(name="checkin_status")
    signup_status_enum = sa.Enum(name="signup_status")
    field_type_enum = sa.Enum(name="activity_field_type")
    activity_status_enum = sa.Enum(name="activity_status")

    bind = op.get_bind()
    checkin_status_enum.drop(bind, checkfirst=True)
    signup_status_enum.drop(bind, checkfirst=True)
    field_type_enum.drop(bind, checkfirst=True)
    activity_status_enum.drop(bind, checkfirst=True)
