from fastapi.testclient import TestClient

from app.main import app
from app.models import JobOutboxMessage, TranslationJob
from app.storage.local import LocalStorage
from app.worker.fake import FakeWorker

PDF = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF\n"


def test_upload_is_idempotent_and_fake_worker_writes_artifact() -> None:
    client = TestClient(app)
    payload = {"target_language_code": "es", "source_language_code": "en"}
    headers = {"Idempotency-Key": "upload-test-001"}
    first = client.post(
        "/api/documents/upload",
        files={"file": ("sample.pdf", PDF, "application/pdf")},
        data=payload,
        headers=headers,
    )
    second = client.post(
        "/api/documents/upload",
        files={"file": ("sample.pdf", PDF, "application/pdf")},
        data=payload,
        headers=headers,
    )

    assert first.status_code == second.status_code == 202
    assert first.json()["job"]["job_id"] == second.json()["job"]["job_id"]

    session = app.state.session_factory()
    try:
        assert session.query(JobOutboxMessage).count() >= 1
        job = session.get(TranslationJob, first.json()["job"]["job_id"])
        assert job is not None
        FakeWorker(LocalStorage(app.state.settings.storage_root)).process_next(session)
        session.refresh(job)
        assert job.status == "completed"
        assert job.artifact_path is not None
    finally:
        session.close()
