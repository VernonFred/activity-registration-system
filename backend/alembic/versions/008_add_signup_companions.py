"""Add signup companions table

Revision ID: 008_add_signup_companions
Revises: 007_add_badge_rules
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '008_add_signup_companions'
down_revision = '0007_badge_rules'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'signup_companions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('signup_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('mobile', sa.String(20), nullable=True),
        sa.Column('organization', sa.String(200), nullable=True),
        sa.Column('title', sa.String(120), nullable=True),
        sa.Column('extra', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), onupdate=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['signup_id'], ['signups.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci'
    )
    op.create_index(op.f('ix_signup_companions_signup_id'), 'signup_companions', ['signup_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_signup_companions_signup_id'), table_name='signup_companions')
    op.drop_table('signup_companions')

