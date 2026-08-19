from collections.abc import Iterator
from dataclasses import dataclass
from hashlib import sha256
from pathlib import Path
import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

_local_bin = str(Path.home() / ".local" / "bin")
if _local_bin not in os.environ.get("PATH", ""):
    os.environ["PATH"] = _local_bin + os.pathsep + os.environ.get("PATH", "")
_tessdata = str(Path.home() / ".local" / "share" / "tessdata")
if Path(_tessdata).is_dir():
    os.environ.setdefault("TESSDATA_PREFIX", _tessdata)

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


def _make_simple_pdf(tmp_path: Path) -> Path:
    from fpdf import FPDF

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", size=12)
    pdf.cell(text="Hello World")
    pdf.cell(text="Second line of text")
    path = tmp_path / "simple.pdf"
    pdf.output(str(path))
    return path


def _make_scanned_pdf(tmp_path: Path) -> Path:
    import fitz

    doc = fitz.open()
    page = doc.new_page(width=612, height=792)
    shape = page.new_shape()
    shape.draw_rect(fitz.Rect(50, 50, 562, 742))
    shape.finish(color=(0, 0, 0), fill=(0.9, 0.9, 0.9), width=1)
    shape.commit()
    path = tmp_path / "scanned.pdf"
    doc.save(str(path))
    doc.close()
    return path


def _make_table_pdf(tmp_path: Path) -> Path:
    from fpdf import FPDF

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", size=10)
    col_w = 60
    row_h = 10
    headers = ["Name", "Age", "City"]
    data = [
        ["Alice", "30", "NYC"],
        ["Bob", "25", "LA"],
    ]
    for h in headers:
        pdf.cell(w=col_w, h=row_h, border=1, text=h)
    pdf.ln()
    for row in data:
        for val in row:
            pdf.cell(w=col_w, h=row_h, border=1, text=val)
        pdf.ln()
    path = tmp_path / "table.pdf"
    pdf.output(str(path))
    return path


def _make_multi_page_pdf(tmp_path: Path) -> Path:
    from fpdf import FPDF

    pdf = FPDF()
    for i in range(1, 4):
        pdf.add_page()
        pdf.set_font("Helvetica", size=12)
        pdf.cell(text=f"Page {i} content")
    path = tmp_path / "multi.pdf"
    pdf.output(str(path))
    return path


def _make_invalid_pdf(tmp_path: Path) -> Path:
    path = tmp_path / "invalid.pdf"
    path.write_bytes(b"%PDF-1.4\nthis is not a valid pdf file at all\n%%EOF\n")
    return path


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


@pytest.fixture
def simple_pdf_path(tmp_path: Path) -> Path:
    return _make_simple_pdf(tmp_path)


@pytest.fixture
def scanned_pdf_path(tmp_path: Path) -> Path:
    return _make_scanned_pdf(tmp_path)


@pytest.fixture
def table_pdf_path(tmp_path: Path) -> Path:
    return _make_table_pdf(tmp_path)


@pytest.fixture
def multi_page_pdf_path(tmp_path: Path) -> Path:
    return _make_multi_page_pdf(tmp_path)


@pytest.fixture
def invalid_pdf_path(tmp_path: Path) -> Path:
    return _make_invalid_pdf(tmp_path)
