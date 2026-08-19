from collections.abc import Iterator
from dataclasses import dataclass
from hashlib import sha256
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.db.base import Base
from app.db.session import get_db
from app.main import create_app
from app.models import Document, JobOutboxMessage, TranslationJob  # noqa: F401

VALID_PDF = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF\n"
CORRUPT_PDF = b"%PDF-1.4\nnot-a-complete-pdf\n"


class FakeAIProviderError(RuntimeError):
    def __init__(self, code: str):
        super().__init__(code)
        self.code = code


@dataclass(frozen=True)
class FakeAIResult:
    artifact: bytes
    ocr_warning: str | None = None


class FakeAIProvider:
    """Deterministic provider double for contract tests; it never calls a network."""

    def __init__(self, error: str | None = None):
        self.error = error
        self.calls: list[tuple[str, str, str]] = []

    def translate(self, content: bytes, source: str, target: str) -> FakeAIResult:
        self.calls.append((sha256(content).hexdigest(), source, target))
        if self.error:
            raise FakeAIProviderError(self.error)
        digest = sha256(content + b"\0" + source.encode() + b"\0" + target.encode()).hexdigest()
        return FakeAIResult(artifact=f"%PDF-1.4\n% fake-ai:{digest}\n%%EOF\n".encode())


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
def fake_ai_provider() -> FakeAIProvider:
    return FakeAIProvider()


@pytest.fixture()
def fake_ai_provider_factory():
    return FakeAIProvider


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
    # Runtime schema changes are owned by Alembic; tests create only their isolated schema.
    Base.metadata.create_all(application.state.session_factory.kw["bind"])

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
