import hashlib
from pathlib import Path

from fastapi.testclient import TestClient
from sqlalchemy import select

from app.models import JobEvent, TranslationJob
from app.providers.ai import AIProviderError, FakeAIProvider
from app.storage.local import LocalStorage
from app.worker.fake import FakeWorker


def upload(client: TestClient, content: bytes, *, key: str) -> object:
    return client.post(
        "/api/documents/upload",
        files={"file": ("sample.pdf", content, "application/pdf")},
        data={"target_language_code": "es", "source_language_code": "en"},
        headers={"Idempotency-Key": key},
    )


def test_fake_provider_is_deterministic_and_can_fail() -> None:
    provider = FakeAIProvider()
    assert provider.translate(b"input", "en", "es") == provider.translate(b"input", "en", "es")
    try:
        FakeAIProvider(fail=True).translate(b"input", "en", "es")
    except AIProviderError as error:
        assert str(error) == "fake provider error"
    else:
        raise AssertionError("expected fake provider failure")


def test_worker_persists_progress_events_and_artifact_endpoints(
    client, db_session, settings, valid_pdf: bytes
) -> None:
    job_id = upload(client, valid_pdf, key="ola3-events").json()["job"]["job_id"]
    assert FakeWorker(LocalStorage(settings.storage_root)).process_next(db_session) is not None

    events = client.get(f"/api/jobs/{job_id}/events")
    assert events.status_code == 200
    assert [event["status"] for event in events.json()["events"]] == [
        "queued",
        "extracting",
        "ocr_processing",
        "translating",
        "rebuilding",
        "validating",
        "completed",
    ]
    assert client.get(f"/api/jobs/{job_id}/stream").headers["content-type"].startswith(
        "text/event-stream"
    )
    assert client.get(f"/api/jobs/{job_id}/preview?page=1").status_code == 200
    download = client.get(f"/api/jobs/{job_id}/download")
    assert download.status_code == 200
    assert download.content.startswith(b"%PDF-")


def test_cancel_is_cooperative_and_owner_scoped(client, db_session, settings, valid_pdf: bytes) -> None:
    job_id = upload(client, valid_pdf, key="ola3-cancel").json()["job"]["job_id"]
    assert client.delete(f"/api/jobs/{job_id}").status_code == 204
    worker = FakeWorker(LocalStorage(settings.storage_root))
    assert worker.process_next(db_session).status == "cancelled"
    job = db_session.get(TranslationJob, job_id)
    assert job is not None and job.status == "cancelled"
    event_types = db_session.scalars(select(JobEvent.event_type).where(JobEvent.job_id == job_id)).all()
    assert "job.cancellation_requested" in event_types
    assert "job.cancelled" in event_types


def test_artifact_path_traversal_is_rejected(settings) -> None:
    storage = LocalStorage(settings.storage_root)
    owner = hashlib.sha256(settings.owner_key.encode()).hexdigest()
    try:
        storage.artifact_path(settings.owner_key, "job", str(Path(storage.root) / owner / "other" / "translated.pdf"))
    except ValueError:
        pass
    else:
        raise AssertionError("expected sandbox rejection")
