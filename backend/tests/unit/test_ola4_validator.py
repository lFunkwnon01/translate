from __future__ import annotations

from pathlib import Path

from app.validation.pdf_validator import validate_pdf


def test_validate_valid_pdf(simple_pdf_path: Path) -> None:
    result = validate_pdf(simple_pdf_path.read_bytes())

    assert result.valid is True
    assert result.page_count >= 1
    assert result.errors == []


def test_validate_invalid_pdf(invalid_pdf_path: Path) -> None:
    result = validate_pdf(invalid_pdf_path.read_bytes())

    assert result.valid is False
    assert len(result.errors) > 0


def test_validate_missing_file() -> None:
    result = validate_pdf(b"")

    assert result.valid is False
    assert "EMPTY_FILE" in result.errors


def test_validate_non_pdf_bytes() -> None:
    result = validate_pdf(b"not a pdf at all")

    assert result.valid is False
    assert "MISSING_PDF_HEADER" in result.errors
