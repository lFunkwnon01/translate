"""create document pages, blocks, segments, artifacts and reviews"""

import sqlalchemy as sa
from alembic import op

revision = "20260819_0003"
down_revision = "20260819_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "document_pages",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("document_id", sa.String(36), sa.ForeignKey("documents.id"), nullable=False),
        sa.Column("owner_key", sa.String(128), nullable=False),
        sa.Column("page_number", sa.Integer(), nullable=False),
        sa.Column("width", sa.Float(), nullable=False),
        sa.Column("height", sa.Float(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("content_hash", sa.String(64), nullable=False),
        sa.Column("ocr_used", sa.Boolean(), nullable=False),
        sa.Column("ocr_confidence", sa.Float(), nullable=True),
        sa.Column("warnings", sa.Text(), nullable=False),
        sa.UniqueConstraint("document_id", "page_number", name="uq_document_page_number"),
    )
    op.create_index("ix_document_pages_document_id", "document_pages", ["document_id"])
    op.create_index("ix_document_pages_owner_key", "document_pages", ["owner_key"])

    op.create_table(
        "document_blocks",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("document_id", sa.String(36), sa.ForeignKey("documents.id"), nullable=False),
        sa.Column("page_id", sa.String(36), sa.ForeignKey("document_pages.id"), nullable=False),
        sa.Column("owner_key", sa.String(128), nullable=False),
        sa.Column("page_number", sa.Integer(), nullable=False),
        sa.Column("block_index", sa.Integer(), nullable=False),
        sa.Column("x0", sa.Float(), nullable=False),
        sa.Column("y0", sa.Float(), nullable=False),
        sa.Column("x1", sa.Float(), nullable=False),
        sa.Column("y1", sa.Float(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("content_hash", sa.String(64), nullable=False),
        sa.Column("ocr_used", sa.Boolean(), nullable=False),
        sa.UniqueConstraint("page_id", "block_index", name="uq_document_block_index"),
    )
    op.create_index("ix_document_blocks_document_id", "document_blocks", ["document_id"])
    op.create_index("ix_document_blocks_page_id", "document_blocks", ["page_id"])
    op.create_index("ix_document_blocks_owner_key", "document_blocks", ["owner_key"])

    op.create_table(
        "job_segments",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("job_id", sa.String(36), sa.ForeignKey("translation_jobs.id"), nullable=False),
        sa.Column("document_id", sa.String(36), sa.ForeignKey("documents.id"), nullable=False),
        sa.Column("owner_key", sa.String(128), nullable=False),
        sa.Column("segment_index", sa.Integer(), nullable=False),
        sa.Column("page_number", sa.Integer(), nullable=False),
        sa.Column("block_ids", sa.Text(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("content_hash", sa.String(64), nullable=False),
        sa.Column("status", sa.String(24), nullable=False),
        sa.UniqueConstraint("job_id", "segment_index", name="uq_job_segment_index"),
    )
    op.create_index("ix_job_segments_job_id", "job_segments", ["job_id"])
    op.create_index("ix_job_segments_document_id", "job_segments", ["document_id"])
    op.create_index("ix_job_segments_owner_key", "job_segments", ["owner_key"])

    op.create_table(
        "artifacts",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("job_id", sa.String(36), sa.ForeignKey("translation_jobs.id"), nullable=False),
        sa.Column("owner_key", sa.String(128), nullable=False),
        sa.Column("kind", sa.String(32), nullable=False),
        sa.Column("path", sa.String(512), nullable=False),
        sa.Column("content_hash", sa.String(64), nullable=False),
        sa.Column("page_count", sa.Integer(), nullable=False),
        sa.Column("validation_status", sa.String(24), nullable=False),
        sa.Column("warnings", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("job_id", "kind", name="uq_artifact_job_kind"),
    )
    op.create_index("ix_artifacts_job_id", "artifacts", ["job_id"])

    op.create_table(
        "reviews",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("job_id", sa.String(36), sa.ForeignKey("translation_jobs.id"), nullable=False),
        sa.Column("artifact_id", sa.String(36), sa.ForeignKey("artifacts.id"), nullable=False),
        sa.Column("owner_key", sa.String(128), nullable=False),
        sa.Column("status", sa.String(24), nullable=False),
        sa.Column("notes", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_reviews_job_id", "reviews", ["job_id"])
    op.create_index("ix_reviews_artifact_id", "reviews", ["artifact_id"])
    op.create_index("ix_reviews_owner_key", "reviews", ["owner_key"])


def downgrade() -> None:
    op.drop_table("reviews")
    op.drop_table("artifacts")
    op.drop_table("job_segments")
    op.drop_table("document_blocks")
    op.drop_table("document_pages")
