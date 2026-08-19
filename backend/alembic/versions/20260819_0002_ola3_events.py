"""add cancellation checkpoints and durable job events"""

import sqlalchemy as sa
from alembic import op

revision = "20260819_0002"
down_revision = "20260819_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("translation_jobs", sa.Column("cancellation_requested", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("translation_jobs", sa.Column("checkpoint", sa.String(40), nullable=False, server_default="queued"))
    op.create_table(
        "job_events",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("job_id", sa.String(36), sa.ForeignKey("translation_jobs.id"), nullable=False),
        sa.Column("sequence", sa.Integer(), nullable=False),
        sa.Column("event_type", sa.String(64), nullable=False),
        sa.Column("status", sa.String(40), nullable=False),
        sa.Column("progress_percent", sa.Integer(), nullable=False),
        sa.Column("current_step", sa.String(40), nullable=False),
        sa.Column("payload", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("job_id", "sequence", name="uq_job_event_sequence"),
    )
    op.create_index("ix_job_events_job_id", "job_events", ["job_id"])


def downgrade() -> None:
    op.drop_table("job_events")
    op.drop_column("translation_jobs", "checkpoint")
    op.drop_column("translation_jobs", "cancellation_requested")
