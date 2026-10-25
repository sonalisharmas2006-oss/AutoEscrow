"""Persist issued sessions for revocation and admission control."""
from alembic import op
import sqlalchemy as sa

revision = "0012_demo_sessions"
down_revision = "0011_demo_session_scope"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "demo_sessions",
        sa.Column("id", sa.String(120), primary_key=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked", sa.Boolean(), nullable=False),
        sa.Column("mutations", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade():
    op.drop_table("demo_sessions")
