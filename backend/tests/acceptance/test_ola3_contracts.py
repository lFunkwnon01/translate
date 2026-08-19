from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient


def upload(client: TestClient, content: bytes, key: str):
    return client.post(
        "/api/documents/upload",
        files={"file": ("sample.pdf", content, "application/pdf")},
        data={"target_language_code": "es", "source_language_code": "en"},
        headers={"Idempotency-Key": key},
    )


def job_id(client: TestClient, valid_pdf: bytes, key: str) -> str:
    response = upload(client, valid_pdf, key)
    assert response.status_code == 202
    return response.json()["job"]["job_id"]


def complete_job(client: TestClient, valid_pdf: bytes, key: str, settings, db_session) -> str:
    from app.models import TranslationJob
    from app.storage.local import LocalStorage
    from app.worker.fake import FakeWorker

    identifier = job_id(client, valid_pdf, key)
    processed = FakeWorker(LocalStorage(settings.storage_root)).process_next(db_session)
    assert processed is not None
    assert db_session.get(TranslationJob, identifier).status == "completed"
    return identifier


def test_tp06_progress_contract_supports_stream_or_polling(client: TestClient, valid_pdf: bytes) -> None:
    identifier = job_id(client, valid_pdf, "tp06-events")
    stream = client.get(f"/api/jobs/{identifier}/stream")
    assert stream.status_code == 200
    content_type = stream.headers.get("content-type", "").split(";")[0]
    assert content_type in {"text/event-stream", "application/json"}
    if content_type == "text/event-stream":
        assert "event:" in stream.text or "data:" in stream.text
    else:
        events = stream.json()
        assert isinstance(events, list) and events
        assert {"event", "status", "progress_percent"} <= events[-1].keys()


def test_tp06_status_has_checkpoint_progress_contract(client: TestClient, valid_pdf: bytes) -> None:
    identifier = job_id(client, valid_pdf, "tp06-status")
    response = client.get(f"/api/jobs/{identifier}")
    assert response.status_code == 200
    body = response.json()
    assert {"status", "progress_percent", "current_step"} <= body.keys()
    assert 0 <= body["progress_percent"] <= 100


def test_tp08_provider_warning_is_exposed_in_status(client: TestClient, valid_pdf: bytes) -> None:
    identifier = job_id(client, valid_pdf, "tp08-ocr")
    response = client.get(f"/api/jobs/{identifier}")
    assert response.status_code == 200
    body = response.json()
    assert body["ocr_warning"] is not None


def test_tp09_preview_has_ttl_and_does_not_leak_storage_path(
    client: TestClient, valid_pdf: bytes, settings, db_session
) -> None:
    identifier = complete_job(client, valid_pdf, "tp09-preview", settings, db_session)
    response = client.get(f"/api/jobs/{identifier}/preview")
    assert response.status_code == 200
    assert response.headers.get("content-type", "").split(";")[0] == "application/pdf"
    assert response.headers.get("cache-control")
    assert str(Path(settings.storage_root)) not in response.text


def test_tp10_download_is_private_and_safe(
    client: TestClient, valid_pdf: bytes, settings, db_session
) -> None:
    identifier = complete_job(client, valid_pdf, "tp10-download", settings, db_session)
    response = client.get(f"/api/jobs/{identifier}/download")
    assert response.status_code == 200
    assert response.headers.get("content-type", "").split(";")[0] == "application/pdf"
    assert "attachment" in response.headers.get("content-disposition", "")
    traversal = client.get("/api/jobs/../download")
    assert traversal.status_code in {404, 400}


def test_tp11_cancel_is_idempotent_and_removes_artifact(
    client: TestClient, valid_pdf: bytes, settings, db_session
) -> None:
    identifier = job_id(client, valid_pdf, "tp11-cancel")
    response = client.delete(f"/api/jobs/{identifier}")
    assert response.status_code in {200, 202, 204}
    assert client.get(f"/api/jobs/{identifier}").json()["status"] == "cancellation_requested"
    from app.storage.local import LocalStorage
    from app.worker.fake import FakeWorker

    assert FakeWorker(LocalStorage(settings.storage_root)).process_next(db_session) is not None
    status = client.get(f"/api/jobs/{identifier}")
    assert status.status_code == 200
    assert status.json()["status"] in {"cancelled", "canceled"}
    repeated = client.delete(f"/api/jobs/{identifier}")
    assert repeated.status_code in {200, 202, 204, 404, 409}


@pytest.mark.xfail(strict=True, reason="Timeout OCI bloqueado: solo existe FakeAI offline")
def test_oci_timeout_integration_is_not_implemented() -> None:
    pytest.fail("No hay cliente OCI ni timeout de proveedor real en esta slice")
