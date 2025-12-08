"""Add article_url to activities table

Revision ID: 009_add_article_url
Revises: 008_add_signup_companions
Create Date: 2025-11-30

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '009_add_article_url'
down_revision: Union[str, None] = '008_add_signup_companions'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add article_url column to activities table."""
    # 使用 batch 模式以支持 SQLite
    with op.batch_alter_table('activities', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column('article_url', sa.String(500), nullable=True)
        )


def downgrade() -> None:
    """Remove article_url column from activities table."""
    with op.batch_alter_table('activities', schema=None) as batch_op:
        batch_op.drop_column('article_url')

