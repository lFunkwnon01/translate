from __future__ import annotations

import hashlib
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import fitz  # type: ignore[import-untyped]
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.jobs.events import record_event
from app.models import DocumentBlock, DocumentPage, JobOutboxMessage, TranslationJob
from app.pdf.extraction import extract_document, extract_page_blocks, extract_page_text
from app.pdf.ocr import is_ocr_available
from app.pdf.reconstruction import reconstruct_pdf
from app.pdf.segmentation import create_segments
from app.providers.ai import AIProvider, AIProviderError, FakeAIProvider
from app.storage.local import LocalStorage
from app.translation.context import ContextManager
from app.translation.rag import LocalRAG

FAKE_ARTIFACT = FakeAIProvider().translate(b"", "auto", "")


class FakeWorker:
    """Deterministic local worker; it never calls OCI or another external provider."""

    def __init__(self, storage: LocalStorage, worker_id: str = "fake-worker", provider: AIProvider | None = None):
        self.storage = storage
        self.worker_id = worker_id
        self.provider = provider or FakeAIProvider()

    @staticmethod
    def _cancelled(job: TranslationJob, db: Session) -> bool:
        db.refresh(job)
        if not job.cancellation_requested:
            return False
        job.status = "cancelled"
        job.current_step = "cancelled"
        job.checkpoint = "cancelled"
        job.finished_at = datetime.now(UTC)
        record_event(db, job, "job.cancelled")
        db.commit()
        return True

    def process_next(self, db: Session) -> TranslationJob | None:
        message = db.scalar(
            select(JobOutboxMessage)
            .where(JobOutboxMessage.status == "pending")
            .order_by(JobOutboxMessage.created_at)
            .limit(1)
        )
        if not message:
            return None
        job = db.get(TranslationJob, message.job_id)
        if not job:
            message.status = "failed"
            db.commit()
            return None
        message.status = "published"
        message.attempts += 1

        if self._cancelled(job, db):
            return job

        job.status = "extracting"
        job.current_step = "extracting"
        job.progress_percent = 15
        job.checkpoint = "extracting"
        record_event(db, job, "job.progress")
        db.commit()

        doc_result: dict[str, Any] = {"pages": [], "page_count": 0}
        all_blocks: list[dict[str, Any]] = []
        if job.document:
            doc_result = extract_document(job.document.storage_path)
            fitz_doc = fitz.open(job.document.storage_path)
            for page_info in doc_result["pages"]:
                page_num = page_info["page_number"]
                page_record = DocumentPage(
                    document_id=job.document.id,
                    owner_key=job.owner_key,
                    page_number=page_num,
                    width=page_info["width"],
                    height=page_info["height"],
                    text=page_info["text"],
                    content_hash=page_info["text_hash"],
                    ocr_used=False,
                    warnings="[]",
                )
                db.add(page_record)
                db.flush()

                blocks = extract_page_blocks(fitz_doc, page_num)
                for block in blocks:
                    block_record = DocumentBlock(
                        document_id=job.document.id,
                        page_id=page_record.id,
                        owner_key=job.owner_key,
                        page_number=page_num,
                        block_index=block["block_index"],
                        x0=block["x0"],
                        y0=block["y0"],
                        x1=block["x1"],
                        y1=block["y1"],
                        text=block["text"],
                        content_hash=block["content_hash"],
                        ocr_used=False,
                    )
                    db.add(block_record)
                    all_blocks.append(
                        {
                            "id": block_record.id,
                            "page_number": page_num,
                            "x0": block["x0"],
                            "y0": block["y0"],
                            "x1": block["x1"],
                            "y1": block["y1"],
                            "text": block["text"],
                            "is_table": False,
                        }
                    )
            fitz_doc.close()

        db.commit()

        if self._cancelled(job, db):
            return job

        job.status = "ocr_processing"
        job.current_step = "ocr_processing"
        job.progress_percent = 20
        job.checkpoint = "ocr_processing"
        record_event(db, job, "job.progress")
        db.commit()

        if is_ocr_available() and job.document:
            from app.pdf.ocr import ocr_page

            fitz_doc = fitz.open(job.document.storage_path)
            for page_info in doc_result["pages"]:
                if not page_info["has_text"]:
                    ocr_result = ocr_page(job.document.storage_path, page_info["page_number"])
                    if ocr_result.get("ocr_used"):
                        text = extract_page_text(fitz_doc, page_info["page_number"])
                        stmt = select(DocumentPage).where(
                            DocumentPage.document_id == job.document.id,
                            DocumentPage.page_number == page_info["page_number"],
                        )
                        found_page: DocumentPage | None = db.execute(stmt).scalar_one_or_none()
                        if found_page is not None:
                            found_page.text = text
                            found_page.ocr_used = True
                            ocr_conf_val = ocr_result.get("ocr_confidence")
                            if isinstance(ocr_conf_val, (int, float)):
                                found_page.ocr_confidence = float(ocr_conf_val)
                            else:
                                found_page.ocr_confidence = 0.0
                            found_page.content_hash = hashlib.sha256(text.encode()).hexdigest()
            fitz_doc.close()
            db.commit()

        if self._cancelled(job, db):
            return job

        job.status = "translating"
        job.current_step = "translating"
        job.progress_percent = 50
        job.checkpoint = "translating"
        record_event(db, job, "job.progress")
        db.commit()

        try:
            segments = create_segments(
                job.id,
                all_blocks,
                owner_key=job.owner_key,
                document_id=job.document.id if job.document else "",
            )
            context_manager = ContextManager()
            rag = LocalRAG()
            source_segments = [str(segment["text"]) for segment in segments]
            translated_segments = []
            for index, segment in enumerate(segments):
                source_text = str(segment["text"])
                context = context_manager.build(index, source_segments, rag.search(source_text))
                translated_text = self.provider.translate_segment(
                    source_text,
                    context,
                    job.source_language_code,
                    job.target_language_code,
                )
                context_manager.remember(source_text, translated_text)
                rag.add(translated_text)
                translated_segments.append({**segment, "text": translated_text})
        except (AIProviderError, OSError) as exc:
            job.status = "failed"
            job.current_step = "failed"
            job.checkpoint = "failed"
            job.finished_at = datetime.now(UTC)
            record_event(db, job, "job.failed", payload={"code": "AI_PROVIDER_ERROR", "message": str(exc)})
            db.commit()
            return job

        if self._cancelled(job, db):
            return job

        job.status = "rebuilding"
        job.current_step = "rebuilding"
        job.progress_percent = 80
        job.checkpoint = "rebuilding"
        record_event(db, job, "job.progress")
        db.commit()

        output_path = ""
        if job.document:
            output_path = str(Path(job.document.storage_path).parent / "reconstructed.pdf")
            reconstruct_pdf(job.document.storage_path, translated_segments, output_path)

        if self._cancelled(job, db):
            return job

        job.status = "validating"
        job.current_step = "validating"
        job.progress_percent = 90
        job.checkpoint = "validating"
        record_event(db, job, "job.progress")
        db.commit()

        from app.validation.pdf_validator import validate_pdf

        if output_path and Path(output_path).exists():
            validation = validate_pdf(output_path)
            if not validation["valid"]:
                job.status = "failed"
                job.current_step = "failed"
                job.checkpoint = "failed"
                job.finished_at = datetime.now(UTC)
                record_event(
                    db,
                    job,
                    "job.failed",
                    payload={"code": "PDF_VALIDATION_FAILED", "errors": validation["errors"]},
                )
                db.commit()
                return job

        artifact_bytes = (
            self.provider.translate(
                Path(job.document.storage_path).read_bytes() if job.document else b"",
                job.source_language_code,
                job.target_language_code,
            )
            if isinstance(self.provider, FakeAIProvider)
            else Path(output_path).read_bytes() if output_path else b""
        )
        artifact = self.storage.save_artifact(job.owner_key, job.id, artifact_bytes)
        job.artifact_path = artifact
        job.status = "completed"
        job.current_step = "completed"
        job.progress_percent = 100
        job.checkpoint = "completed"
        now = datetime.now(UTC)
        job.started_at = job.started_at or now
        job.finished_at = now
        record_event(db, job, "job.completed")
        db.commit()
        return job
