import hashlib
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.models import JobOutboxMessage, TranslationJob
from app.storage.local import LocalStorage
from app.worker.fake import FakeWorker


def upload(
    client: TestClient,
    content: bytes,
    *,
    key: str,
    filename: str = "sample.pdf",
    mime: str = "application/pdf",
    target: str = "es",
    source: str = "en",
):
    return client.post(
        "/api/documents/upload",
        files={"file": (filename, content, mime)},
        data={"target_language_code": target, "source_language_code": source},
        headers={"Idempotency-Key": key},
    )


def test_job_status_endpoint_returns_queued_job(client: TestClient, valid_pdf: bytes) -> None:
    response = upload(client, valid_pdf, key="status-request")
    job_id = response.json()["job"]["job_id"]

    status_response = client.get(f"/api/jobs/{job_id}")

    assert status_response.status_code == 200
    body = status_response.json()
    assert body["job_id"] == job_id
    assert body["status"] == "queued"
    assert body["progress_percent"] == 0
    assert body["current_step"] == "queued"
    assert body["links"] == {
        "stream": f"/api/jobs/{job_id}/stream",
        "preview": None,
        "download": None,
    }


def test_job_status_returns_stable_404_error(client: TestClient) -> None:
    response = client.get("/api/jobs/missing-job")

    assert response.status_code == 404
    assert response.json()["detail"]["error"] == {
        "code": "NOT_FOUND",
        "message": "Trabajo no encontrado.",
    }


@pytest.mark.parametrize("target", ["xx", "", "EN"])
def test_upload_rejects_unsupported_target_language(
    client: TestClient, valid_pdf: bytes, target: str
) -> None:
    response = upload(client, valid_pdf, key=f"bad-target-{target or 'empty'}", target=target)

    assert response.status_code == 422
    assert response.json()["detail"]["error"]["code"] == "UNSUPPORTED_LANGUAGE"


def test_upload_rejects_unsupported_source_language(client: TestClient, valid_pdf: bytes) -> None:
    response = upload(client, valid_pdf, key="bad-source", source="xx")

    assert response.status_code == 422
    assert response.json()["detail"]["error"]["code"] == "UNSUPPORTED_LANGUAGE"


@pytest.mark.parametrize("key", ["", "x" * 129])
def test_upload_rejects_invalid_idempotency_key(
    client: TestClient, valid_pdf: bytes, key: str
) -> None:
    response = upload(client, valid_pdf, key=key)

    assert response.status_code == 400
    assert response.json()["detail"]["error"]["code"] == "IDEMPOTENCY_KEY_REQUIRED"


def test_upload_rejects_pdf_without_eof(client: TestClient) -> None:
    response = upload(client, b"%PDF-1.7\ncontent without trailer", key="missing-eof")

    assert response.status_code == 422
    assert response.json()["detail"]["error"]["code"] == "INVALID_PDF"


def test_upload_rejects_non_pdf_bytes_even_with_pdf_metadata(client: TestClient) -> None:
    response = upload(client, b"plain text", key="not-a-pdf")

    assert response.status_code == 422
    assert response.json()["detail"]["error"]["code"] == "INVALID_PDF"


def test_worker_with_no_pending_messages_is_noop(client: TestClient, settings, db_session) -> None:
    worker = FakeWorker(LocalStorage(settings.storage_root))

    assert worker.process_next(db_session) is None


def test_worker_marks_orphaned_outbox_message_failed(client: TestClient, settings, db_session) -> None:
    message = JobOutboxMessage(job_id="missing-job", payload='{"job_id":"missing-job"}')
    db_session.add(message)
    db_session.commit()

    assert FakeWorker(LocalStorage(settings.storage_root)).process_next(db_session) is None
    assert db_session.get(JobOutboxMessage, message.id).status == "failed"


def test_worker_artifact_is_private_and_has_expected_hash(
    client: TestClient, valid_pdf: bytes, settings, db_session, owner_key: str
) -> None:
    response = upload(client, valid_pdf, key="artifact-contract")
    job_id = response.json()["job"]["job_id"]
    job = db_session.get(TranslationJob, job_id)
    assert job is not None

    processed = FakeWorker(LocalStorage(settings.storage_root)).process_next(db_session)

    assert processed is not None
    assert processed.status == "completed"
    assert processed.progress_percent == 100
    assert processed.current_step == "completed"
    assert processed.started_at is not None
    assert processed.finished_at is not None
    assert processed.artifact_path is not None
    artifact = Path(processed.artifact_path)
    assert artifact.stat().st_mode & 0o777 == 0o600
    assert artifact.parent.parent.name == hashlib.sha256(owner_key.encode()).hexdigest()
    assert db_session.scalar(
        select(JobOutboxMessage).where(JobOutboxMessage.job_id == job_id)
    ).status == "published"


def test_tp06_job_progress_stream_is_not_implemented(client: TestClient, valid_pdf: bytes) -> None:
    job_id = upload(client, valid_pdf, key="stream-contract").json()["job"]["job_id"]
    assert client.get(f"/api/jobs/{job_id}/stream").status_code == 200


@pytest.mark.blocked
@pytest.mark.xfail(strict=True, reason="TP-08 bloqueado: OCR/provider no está implementado")
def test_tp08_ocr_warning_is_not_implemented(client: TestClient, valid_pdf: bytes) -> None:
    job_id = upload(client, valid_pdf, key="ocr-contract").json()["job"]["job_id"]
    assert client.get(f"/api/jobs/{job_id}").json()["ocr_warning"] is not None


def test_tp09_preview_is_not_implemented(client: TestClient, valid_pdf: bytes, db_session) -> None:
    job_id = upload(client, valid_pdf, key="preview-contract").json()["job"]["job_id"]
    FakeWorker(LocalStorage(client.app.state.settings.storage_root)).process_next(db_session)
    assert client.get(f"/api/jobs/{job_id}/preview").status_code == 200


def test_tp10_download_is_not_implemented(client: TestClient, valid_pdf: bytes, db_session) -> None:
    job_id = upload(client, valid_pdf, key="download-contract").json()["job"]["job_id"]
    FakeWorker(LocalStorage(client.app.state.settings.storage_root)).process_next(db_session)
    assert client.get(f"/api/jobs/{job_id}/download").status_code == 200


def test_tp11_cancel_or_delete_is_not_implemented(client: TestClient, valid_pdf: bytes) -> None:
    job_id = upload(client, valid_pdf, key="delete-contract").json()["job"]["job_id"]
    assert client.delete(f"/api/jobs/{job_id}").status_code == 204


@pytest.mark.blocked
@pytest.mark.xfail(strict=True, reason="FakeAI/timeout bloqueados: no existe integración de proveedor")
def test_fake_ai_timeout_is_not_implemented() -> None:
    pytest.fail("No hay FakeAI ni timeout configurable en el backend actual")
