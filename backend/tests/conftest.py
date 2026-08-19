from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.db.session import get_db
from app.main import create_app

VALID_PDF = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF\n"
CORRUPT_PDF = b"%PDF-1.4\nnot-a-complete-pdf\n"


@pytest.fixture()
def owner_key() -> str:
    return "test-owner"


@pytest.fixture()
def valid_pdf() -> bytes:
    return VALID_PDF


@pytest.fixture()
def corrupt_pdf() -> bytes:
    return CORRUPT_PDF


@pytest.fixture()
def settings(tmp_path: Path, owner_key: str) -> Settings:
    return Settings(
        database_url=f"sqlite:///{tmp_path / 'db.sqlite3'}",
        storage_root=str(tmp_path / "storage"),
        owner_key=owner_key,
    )


@pytest.fixture()
def test_app(settings: Settings):
    application = create_app(settings)

    def test_db():
        session = application.state.session_factory()
        try:
            yield session
        finally:
            session.close()

    application.dependency_overrides[get_db] = test_db
    return application


@pytest.fixture()
def client(test_app) -> Iterator[TestClient]:
    with TestClient(test_app) as test_client:
        yield test_client


@pytest.fixture()
def db_session(test_app) -> Iterator[Session]:
    session = test_app.state.session_factory()
    try:
        yield session
    finally:
        session.close()
