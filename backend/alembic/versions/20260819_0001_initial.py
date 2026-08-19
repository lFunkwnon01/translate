"""create documents, translation jobs and outbox"""

import sqlalchemy as sa

from alembic import op

revision = "20260819_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "documents",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("owner_key", sa.String(128), nullable=False),
        sa.Column("original_filename", sa.String(255), nullable=False),
        sa.Column("mime_type", sa.String(100), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("content_hash", sa.String(64), nullable=False),
        sa.Column("storage_path", sa.String(512), nullable=False),
        sa.Column("status", sa.String(32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("owner_key", "content_hash", name="uq_document_owner_hash"),
    )
    op.create_index("ix_documents_owner_key", "documents", ["owner_key"])
    op.create_table(
        "translation_jobs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("document_id", sa.String(36), sa.ForeignKey("documents.id"), nullable=False),
        sa.Column("owner_key", sa.String(128), nullable=False),
        sa.Column("idempotency_key", sa.String(128), nullable=False),
        sa.Column("source_language_code", sa.String(16), nullable=False),
        sa.Column("target_language_code", sa.String(16), nullable=False),
        sa.Column("status", sa.String(40), nullable=False),
        sa.Column("progress_percent", sa.Integer(), nullable=False),
        sa.Column("current_step", sa.String(40), nullable=False),
        sa.Column("artifact_path", sa.String(512)),
        sa.Column("requested_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("started_at", sa.DateTime(timezone=True)),
        sa.Column("finished_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_translation_jobs_document_id", "translation_jobs", ["document_id"])
    op.create_index("ix_translation_jobs_owner_key", "translation_jobs", ["owner_key"])
    op.create_index("ix_translation_jobs_status", "translation_jobs", ["status"])
    op.create_table(
        "job_outbox_messages",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("job_id", sa.String(36), sa.ForeignKey("translation_jobs.id"), nullable=False),
        sa.Column("event_type", sa.String(64), nullable=False),
        sa.Column("payload", sa.Text(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("published_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_job_outbox_messages_job_id", "job_outbox_messages", ["job_id"])
    op.create_index("ix_job_outbox_messages_status", "job_outbox_messages", ["status"])


def downgrade() -> None:
    op.drop_table("job_outbox_messages")
    op.drop_table("translation_jobs")
    op.drop_table("documents")
