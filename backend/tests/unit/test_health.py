from datetime import datetime

from fastapi.testclient import TestClient

from app.main import app


def test_health_returns_expected_payload_on_legacy_route() -> None:
    response = TestClient(app).get("/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["service"] == "doctranslate-api"
    assert payload["version"] == "0.1.0"
    assert payload["checks"] == {
        "database": "not_checked",
        "storage": "not_checked",
        "queue": "not_checked",
        "ai_provider": "not_configured",
    }
    datetime.fromisoformat(payload["timestamp"])


def test_health_is_available_under_versioned_api() -> None:
    response = TestClient(app).get("/api/v1/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
