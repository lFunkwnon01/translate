from __future__ import annotations

from pathlib import Path

from app.pdf.tables import extract_tables


def test_extract_tables_from_document(table_pdf_path: Path) -> None:
    tables = extract_tables(str(table_pdf_path), page_number=1)

    assert isinstance(tables, list)
    for t in tables:
        assert "x0" in t
        assert "y0" in t
        assert "x1" in t
        assert "y1" in t
        assert "rows" in t
        assert len(t["rows"]) > 0


def test_no_tables_returns_empty(simple_pdf_path: Path) -> None:
    tables = extract_tables(str(simple_pdf_path), page_number=1)

    assert isinstance(tables, list)
