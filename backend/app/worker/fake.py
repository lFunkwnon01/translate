from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import JobOutboxMessage, TranslationJob
from app.storage.local import LocalStorage

FAKE_ARTIFACT = b"%PDF-1.4\n% Fake translated artifact\n1 0 obj\n<<>>\nendobj\n%%EOF\n"


class FakeWorker:
    """Deterministic local worker; it never calls OCI or another external provider."""

    def __init__(self, storage: LocalStorage, worker_id: str = "fake-worker"):
        self.storage = storage
        self.worker_id = worker_id

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
        db.commit()

        job.status = "translating"
        job.current_step = "translating"
        job.progress_percent = 75
        artifact = self.storage.save_artifact(job.owner_key, job.id, FAKE_ARTIFACT)
        job.artifact_path = artifact
        job.status = "completed"
        job.current_step = "completed"
        job.progress_percent = 100
        now = datetime.now(UTC)
        job.started_at = job.started_at or now
        job.finished_at = now
        db.commit()
        return job
