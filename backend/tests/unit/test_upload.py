import hashlib
import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.models import Document, JobOutboxMessage, TranslationJob
from app.storage.local import LocalStorage
from app.worker.fake import FAKE_ARTIFACT, FakeWorker


def upload(
    client: TestClient,
    content: bytes,
    *,
    key: str = "upload-test-001",
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


def test_upload_returns_202_and_persists_owner_document_and_outbox(
    client: TestClient, db_session, valid_pdf: bytes, owner_key: str, settings
) -> None:
    response = upload(client, valid_pdf)

    assert response.status_code == 202
    body = response.json()
    assert body["document"]["mime_type"] == "application/pdf"
    assert body["document"]["size_bytes"] == len(valid_pdf)

    document = db_session.get(Document, body["document"]["document_id"])
    job = db_session.get(TranslationJob, body["job"]["job_id"])
    assert document is not None and document.owner_key == owner_key
    assert job is not None and job.owner_key == owner_key
    assert Path(document.storage_path).read_bytes() == valid_pdf
    assert db_session.scalar(select(JobOutboxMessage).where(JobOutboxMessage.job_id == job.id))


def test_upload_repeating_same_key_and_payload_returns_same_response(
    client: TestClient, valid_pdf: bytes
) -> None:
    first = upload(client, valid_pdf, key="same-request")
    second = upload(client, valid_pdf, key="same-request")

    assert first.status_code == second.status_code == 202
    assert first.json() == second.json()


@pytest.mark.xfail(
    strict=True,
    reason="backend currently replays any payload for an existing Idempotency-Key",
)
def test_upload_reusing_key_with_different_payload_is_conflict(
    client: TestClient, valid_pdf: bytes
) -> None:
    assert upload(client, valid_pdf, key="payload-conflict", target="es").status_code == 202
    response = upload(client, valid_pdf, key="payload-conflict", target="de")

    assert response.status_code == 409
    assert response.json()["detail"]["error"]["code"] == "IDEMPOTENCY_KEY_CONFLICT"


@pytest.mark.parametrize(
    ("filename", "mime", "expected_status", "expected_code"),
    [
        ("sample.txt", "application/pdf", 415, "UNSUPPORTED_FILE"),
        ("sample.pdf", "text/plain", 415, "UNSUPPORTED_FILE"),
    ],
)
def test_upload_rejects_non_pdf_filename_or_mime(
    client: TestClient,
    valid_pdf: bytes,
    filename: str,
    mime: str,
    expected_status: int,
    expected_code: str,
) -> None:
    response = upload(client, valid_pdf, filename=filename, mime=mime)

    assert response.status_code == expected_status
    assert response.json()["detail"]["error"]["code"] == expected_code


def test_upload_rejects_invalid_pdf_signature(client: TestClient, corrupt_pdf: bytes) -> None:
    response = upload(client, corrupt_pdf)

    assert response.status_code == 422
    assert response.json()["detail"]["error"]["code"] == "INVALID_PDF"


def test_upload_rejects_file_over_configured_limit(client: TestClient, valid_pdf: bytes, settings) -> None:
    oversized = b"%PDF-1.4\n" + b"x" * settings.max_file_size_bytes + b"\n%%EOF\n"

    response = upload(client, oversized)

    assert response.status_code == 413
    error = response.json()["detail"]["error"]
    assert error["code"] == "PLAN_LIMIT_EXCEEDED"
    assert error["details"]["limit_value"] == settings.max_file_size_bytes


def test_upload_requires_idempotency_key(client: TestClient, valid_pdf: bytes) -> None:
    response = client.post(
        "/api/documents/upload",
        files={"file": ("sample.pdf", valid_pdf, "application/pdf")},
        data={"target_language_code": "es", "source_language_code": "en"},
    )

    assert response.status_code == 400
    assert response.json()["detail"]["error"]["code"] == "IDEMPOTENCY_KEY_REQUIRED"


def test_owner_key_isolation_and_fake_worker_outbox_artifact(
    client: TestClient, db_session, valid_pdf: bytes, owner_key: str, settings
) -> None:
    response = upload(client, valid_pdf, key="worker-request")
    job_id = response.json()["job"]["job_id"]
    message = db_session.scalar(select(JobOutboxMessage).where(JobOutboxMessage.job_id == job_id))
    assert message is not None
    assert json.loads(message.payload) == {"job_id": job_id}
    assert message.status == "pending"

    job = db_session.get(TranslationJob, job_id)
    assert job is not None
    processed = FakeWorker(LocalStorage(settings.storage_root)).process_next(db_session)

    assert processed is not None and processed.id == job_id
    assert processed.status == "completed"
    assert processed.artifact_path is not None
    artifact = Path(processed.artifact_path)
    assert artifact.read_bytes() == FAKE_ARTIFACT
    assert artifact.parent.parent.name == hashlib.sha256(owner_key.encode()).hexdigest()
    assert db_session.get(JobOutboxMessage, message.id).status == "published"


def test_test_storage_isolated_per_test(client: TestClient, valid_pdf: bytes, settings) -> None:
    response = upload(client, valid_pdf, key="isolated-request")

    assert response.status_code == 202
    assert list(Path(settings.storage_root).rglob("original.pdf"))
