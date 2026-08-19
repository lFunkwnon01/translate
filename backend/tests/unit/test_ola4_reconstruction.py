from __future__ import annotations

import tempfile
from pathlib import Path

import fitz

from app.pdf.reconstruction import reconstruct_pdf


def test_reconstruct_pdf_valid(simple_pdf_path: Path) -> None:
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
        output_path = f.name

    segments = [{"page_number": 1, "text": "Translated hello"}]
    result = reconstruct_pdf(str(simple_pdf_path), segments, output_path)

    raw = Path(result).read_bytes()
    assert raw[:5] == b"%PDF-"
    assert b"%%EOF" in raw

    Path(output_path).unlink(missing_ok=True)


def test_reconstruct_pdf_page_count(multi_page_pdf_path: Path) -> None:
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
        output_path = f.name

    segments = [
        {"page_number": 1, "text": "Page 1 translated"},
        {"page_number": 2, "text": "Page 2 translated"},
        {"page_number": 3, "text": "Page 3 translated"},
    ]
    reconstruct_pdf(str(multi_page_pdf_path), segments, output_path)

    doc = fitz.open(output_path)
    count = doc.page_count
    doc.close()
    assert count == 3

    Path(output_path).unlink(missing_ok=True)


def test_reconstruct_pdf_opens(simple_pdf_path: Path) -> None:
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
        output_path = f.name

    segments = [{"page_number": 1, "text": "test content"}]
    reconstruct_pdf(str(simple_pdf_path), segments, output_path)

    doc = fitz.open(output_path)
    assert doc.page_count >= 1
    text = doc[0].get_text()
    assert "test content" in text
    doc.close()

    Path(output_path).unlink(missing_ok=True)
