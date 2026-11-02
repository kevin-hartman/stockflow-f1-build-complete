"""add stock records location sku index

Revision ID: 20261102200143
Revises: 20261102085400
Create Date: 2026-11-02 14:01:44.228901
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '20261102200143'
down_revision: Union[str, None] = '20261102085400'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


INDEX = "ix_stock_records_location_sku"


def upgrade() -> None:
    op.create_index(INDEX, "stock_records", ["location", "sku"])


def downgrade() -> None:
    op.drop_index(INDEX, table_name="stock_records")
