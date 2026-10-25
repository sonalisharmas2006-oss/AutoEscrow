"""Add public demo session ownership to jobs.

Revision ID: 0011_demo_session_scope
Revises: 0010_harden_ledger_idempotency
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0011_demo_session_scope"
down_revision: str | None = "0010_harden_ledger_idempotency"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("jobs") as batch:
        batch.add_column(sa.Column("demo_session_id", sa.String(length=120), nullable=True))
        batch.create_index("ix_jobs_demo_session_id", ["demo_session_id"], unique=False)


def downgrade() -> None:
    with op.batch_alter_table("jobs") as batch:
        batch.drop_index("ix_jobs_demo_session_id")
        batch.drop_column("demo_session_id")
