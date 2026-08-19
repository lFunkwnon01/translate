from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class DocumentPage(Base):
    __tablename__ = "document_pages"
    __table_args__ = (UniqueConstraint("document_id", "page_number", name="uq_document_page_number"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    document_id: Mapped[str] = mapped_column(ForeignKey("documents.id"), nullable=False, index=True)
    owner_key: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    page_number: Mapped[int] = mapped_column(Integer, nullable=False)
    width: Mapped[float] = mapped_column(nullable=False)
    height: Mapped[float] = mapped_column(nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False, default="")
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    ocr_used: Mapped[bool] = mapped_column(nullable=False, default=False)
    ocr_confidence: Mapped[float | None] = mapped_column()
    warnings: Mapped[str] = mapped_column(Text, nullable=False, default="[]")

    document = relationship("Document", back_populates="pages")
    blocks = relationship("DocumentBlock", back_populates="page", cascade="all, delete-orphan")


class DocumentBlock(Base):
    __tablename__ = "document_blocks"
    __table_args__ = (UniqueConstraint("page_id", "block_index", name="uq_document_block_index"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    document_id: Mapped[str] = mapped_column(ForeignKey("documents.id"), nullable=False, index=True)
    page_id: Mapped[str] = mapped_column(ForeignKey("document_pages.id"), nullable=False, index=True)
    owner_key: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    page_number: Mapped[int] = mapped_column(Integer, nullable=False)
    block_index: Mapped[int] = mapped_column(Integer, nullable=False)
    x0: Mapped[float] = mapped_column(nullable=False)
    y0: Mapped[float] = mapped_column(nullable=False)
    x1: Mapped[float] = mapped_column(nullable=False)
    y1: Mapped[float] = mapped_column(nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    ocr_used: Mapped[bool] = mapped_column(nullable=False, default=False)

    page = relationship("DocumentPage", back_populates="blocks")


class JobSegment(Base):
    __tablename__ = "job_segments"
    __table_args__ = (UniqueConstraint("job_id", "segment_index", name="uq_job_segment_index"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    job_id: Mapped[str] = mapped_column(ForeignKey("translation_jobs.id"), nullable=False, index=True)
    document_id: Mapped[str] = mapped_column(ForeignKey("documents.id"), nullable=False, index=True)
    owner_key: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    segment_index: Mapped[int] = mapped_column(Integer, nullable=False)
    page_number: Mapped[int] = mapped_column(Integer, nullable=False)
    block_ids: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    text: Mapped[str] = mapped_column(Text, nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[str] = mapped_column(String(24), nullable=False, default="pending")

    job = relationship("TranslationJob", back_populates="segments")


class Artifact(Base):
    __tablename__ = "artifacts"
    __table_args__ = (UniqueConstraint("job_id", "kind", name="uq_artifact_job_kind"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    job_id: Mapped[str] = mapped_column(ForeignKey("translation_jobs.id"), nullable=False, index=True)
    owner_key: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    kind: Mapped[str] = mapped_column(String(32), nullable=False, default="translated_pdf")
    path: Mapped[str] = mapped_column(String(512), nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    page_count: Mapped[int] = mapped_column(Integer, nullable=False)
    validation_status: Mapped[str] = mapped_column(String(24), nullable=False, default="validated")
    warnings: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    job = relationship("TranslationJob", back_populates="artifacts")
    reviews = relationship("Review", back_populates="artifact", cascade="all, delete-orphan")


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    job_id: Mapped[str] = mapped_column(ForeignKey("translation_jobs.id"), nullable=False, index=True)
    artifact_id: Mapped[str] = mapped_column(ForeignKey("artifacts.id"), nullable=False, index=True)
    owner_key: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(24), nullable=False, default="pending")
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    artifact = relationship("Artifact", back_populates="reviews")
