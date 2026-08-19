from __future__ import annotations

from pathlib import Path

from app.pdf.extraction import extract_document


def test_extract_simple_text(simple_pdf_path: Path) -> None:
    result = extract_document(str(simple_pdf_path))

    assert result["page_count"] == 1
    assert result["pages"][0]["extraction_status"] == "extracted"
    assert "Hello World" in result["pages"][0]["text"]


def test_extract_page_metadata(simple_pdf_path: Path) -> None:
    result = extract_document(str(simple_pdf_path))

    page = result["pages"][0]
    assert page["width"] > 0
    assert page["height"] > 0
    assert page["page_number"] == 1
    assert page["text_hash"]


def test_extract_empty_page(tmp_path: Path) -> None:
    from fpdf import FPDF

    pdf = FPDF()
    pdf.add_page()
    path = tmp_path / "empty.pdf"
    pdf.output(str(path))

    result = extract_document(str(path))
    assert result["page_count"] == 1
    assert result["pages"][0]["extraction_status"] == "ocr_required"


def test_extract_scanned_page(scanned_pdf_path: Path) -> None:
    result = extract_document(str(scanned_pdf_path))

    assert result["page_count"] == 1
    assert result["pages"][0]["extraction_status"] == "ocr_required"
    assert result["pages"][0]["has_text"] is False


def test_extract_multi_page(multi_page_pdf_path: Path) -> None:
    result = extract_document(str(multi_page_pdf_path))

    assert result["page_count"] == 3
    for i, page in enumerate(result["pages"], start=1):
        assert page["page_number"] == i


def test_extract_page_count_matches(tmp_path: Path) -> None:
    from fpdf import FPDF

    pdf = FPDF()
    for i in range(5):
        pdf.add_page()
        pdf.set_font("Helvetica", size=12)
        pdf.cell(text=f"Page {i + 1}")
    path = tmp_path / "five.pdf"
    pdf.output(str(path))

    result = extract_document(str(path))
    assert result["page_count"] == 5
