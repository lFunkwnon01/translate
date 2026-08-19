from datetime import datetime

from fastapi.testclient import TestClient


def test_health_returns_ok(client: TestClient) -> None:
    response = client.get("/health")

    assert response.status_code == 200

    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["service"] == "doctranslate-api"
    assert payload["version"] == "0.1.0"
    assert response.headers["content-type"].startswith("application/json")
    assert set(payload) == {"status", "service", "version", "checks", "timestamp"}
    assert payload["checks"] == {"api": "ok"}
    assert datetime.fromisoformat(payload["timestamp"])


def test_health_is_available_under_versioned_api(client: TestClient) -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
