from __future__ import annotations

from pathlib import Path

from app.pdf.tables import extract_tables


def test_extract_tables_from_document(table_pdf_path: Path) -> None:
    tables = extract_tables(table_pdf_path.read_bytes())

    assert len(tables) > 0
    for t in tables:
        assert t.x0 < t.x1
        assert t.y0 < t.y1
        assert t.rows > 0
        assert t.cols > 0
        assert t.page_number == 1


def test_no_tables_returns_empty(simple_pdf_path: Path) -> None:
    tables = extract_tables(simple_pdf_path.read_bytes())

    assert isinstance(tables, list)
