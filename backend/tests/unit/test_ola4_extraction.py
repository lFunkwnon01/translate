from __future__ import annotations

from pathlib import Path

import pytest

from app.pdf.extraction import ExtractionStatus, extract_text


def test_extract_simple_text(simple_pdf_path: Path) -> None:
    result = extract_text(simple_pdf_path.read_bytes())

    assert len(result.pages) == 1
    assert result.pages[0].extraction_status == ExtractionStatus.OK
    assert "Hello World" in result.pages[0].text


def test_extract_page_metadata(simple_pdf_path: Path) -> None:
    result = extract_text(simple_pdf_path.read_bytes())

    page = result.pages[0]
    assert page.width > 0
    assert page.height > 0
    assert page.rotation == 0
    assert page.page_number == 1
    assert page.content_hash


def test_extract_blocks(simple_pdf_path: Path) -> None:
    result = extract_text(simple_pdf_path.read_bytes())

    blocks = result.blocks.get(1, [])
    assert len(blocks) > 0
    for b in blocks:
        assert b.x0 <= b.x1
        assert b.y0 <= b.y1
        assert isinstance(b.text, str)


def test_extract_empty_page(tmp_path: Path) -> None:
    from fpdf import FPDF

    pdf = FPDF()
    pdf.add_page()
    path = tmp_path / "empty.pdf"
    pdf.output(str(path))

    result = extract_text(path.read_bytes())
    assert len(result.pages) == 1
    assert result.pages[0].extraction_status == ExtractionStatus.OCR_REQUIRED


def test_extract_scanned_page(scanned_pdf_path: Path) -> None:
    result = extract_text(scanned_pdf_path.read_bytes())

    assert len(result.pages) == 1
    assert result.pages[0].extraction_status == ExtractionStatus.OK


def test_extract_multi_page(multi_page_pdf_path: Path) -> None:
    result = extract_text(multi_page_pdf_path.read_bytes())

    assert len(result.pages) == 3
    for i, page in enumerate(result.pages, start=1):
        assert page.page_number == i
        assert f"Page {i}" in page.text


def test_extract_page_count_matches(tmp_path: Path) -> None:
    from fpdf import FPDF

    pdf = FPDF()
    for i in range(5):
        pdf.add_page()
        pdf.set_font("Helvetica", size=12)
        pdf.cell(text=f"Page {i + 1}")
    path = tmp_path / "five.pdf"
    pdf.output(str(path))

    result = extract_text(path.read_bytes())
    assert len(result.pages) == 5
