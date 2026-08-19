from datetime import UTC, datetime
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.jobs.events import record_event
from app.models import JobOutboxMessage, TranslationJob
from app.providers.ai import AIProvider, AIProviderError, FakeAIProvider
from app.storage.local import LocalStorage

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
        job.status = "extracting"
        job.current_step = "extracting"
        job.progress_percent = 25
        job.checkpoint = "extracting"
        record_event(db, job, "job.progress")
        db.commit()

        if self._cancelled(job, db):
            return job
        job.status = "translating"
        job.current_step = "translating"
        job.progress_percent = 75
        job.checkpoint = "translating"
        record_event(db, job, "job.progress")
        db.commit()
        if self._cancelled(job, db):
            return job
        try:
            source = Path(job.document.storage_path).read_bytes() if job.document else b""
            artifact_bytes = self.provider.translate(
                source, job.source_language_code, job.target_language_code
            )
        except (AIProviderError, OSError) as exc:
            job.status = "failed"
            job.current_step = "failed"
            job.checkpoint = "failed"
            job.finished_at = datetime.now(UTC)
            record_event(db, job, "job.failed", payload={"code": "AI_PROVIDER_ERROR", "message": str(exc)})
            db.commit()
            return job
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
