from __future__ import annotations

from app.pdf.reconstruction import reconstruct_pdf


def test_reconstruct_pdf_valid() -> None:
    pages = [{"width": 595, "height": 842, "text": "Hello"}]
    output = reconstruct_pdf(pages)

    assert output[:5] == b"%PDF-"
    assert b"%%EOF" in output


def test_reconstruct_pdf_page_count() -> None:
    pages = [
        {"width": 595, "height": 842, "text": "Page 1"},
        {"width": 595, "height": 842, "text": "Page 2"},
        {"width": 595, "height": 842, "text": "Page 3"},
    ]
    output = reconstruct_pdf(pages)

    import fitz
    doc = fitz.open(stream=output, filetype="pdf")
    count = doc.page_count
    doc.close()
    assert count == 3


def test_reconstruct_pdf_opens() -> None:
    pages = [{"text": "test content"}]
    output = reconstruct_pdf(pages)

    import fitz
    doc = fitz.open(stream=output, filetype="pdf")
    assert doc.page_count >= 1
    text = doc[0].get_text()
    assert "test content" in text
    doc.close()
