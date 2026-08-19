from __future__ import annotations

from pathlib import Path

from app.validation.pdf_validator import validate_pdf


def test_validate_valid_pdf(simple_pdf_path: Path) -> None:
    result = validate_pdf(str(simple_pdf_path))

    assert result["valid"] is True
    assert result["page_count"] >= 1
    assert result["errors"] == []


def test_validate_invalid_pdf(invalid_pdf_path: Path) -> None:
    result = validate_pdf(str(invalid_pdf_path))

    assert result["valid"] is False
    assert len(result["errors"]) > 0


def test_validate_missing_file() -> None:
    result = validate_pdf("/nonexistent/file.pdf")

    assert result["valid"] is False
    assert len(result["errors"]) > 0
