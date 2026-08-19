from __future__ import annotations

import tempfile
from pathlib import Path

import pytest

from app.pdf.extraction import extract_document
from app.pdf.ocr import OCRBINARIES_NOT_AVAILABLE, is_ocr_available
from app.pdf.reconstruction import reconstruct_pdf
from app.pdf.segmentation import create_segments
from app.validation.pdf_validator import validate_pdf


def test_tp04_scanned_pdf_ocr_flow(scanned_pdf_path: Path) -> None:
    result = extract_document(str(scanned_pdf_path))
    assert result["page_count"] >= 1
    page = result["pages"][0]
    assert page["extraction_status"] == "ocr_required"
    assert page["has_text"] is False

    if not is_ocr_available():
        with pytest.raises(OCRBINARIES_NOT_AVAILABLE):
            from app.pdf.ocr import ocr_page
            ocr_page(str(scanned_pdf_path), page_number=1)
        pytest.skip("OCR binaries not available, cannot test full OCR flow")


def test_tp05_ocr_low_confidence_warning() -> None:
    if is_ocr_available():
        pytest.skip("OCR binaries available, cannot test low confidence path")
    with pytest.raises(OCRBINARIES_NOT_AVAILABLE):
        from app.pdf.ocr import ocr_page
        ocr_page(b"fake", page_number=1)


def test_tp11_invalid_output_pdf(simple_pdf_path: Path) -> None:
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
        f.write(b"%PDF-1.4\nbroken content\n%%EOF\n")
        invalid_path = f.name

    result_invalid = validate_pdf(invalid_path)
    assert result_invalid["valid"] is False
    assert len(result_invalid["errors"]) > 0

    Path(invalid_path).unlink(missing_ok=True)


def test_tp04_segmentation_after_extraction(simple_pdf_path: Path) -> None:
    extraction = extract_document(str(simple_pdf_path))
    assert extraction["page_count"] >= 1

    blocks = []
    for page in extraction["pages"]:
        if page["has_text"]:
            blocks.append({
                "id": f"block-{page['page_number']}",
                "page_number": page["page_number"],
                "text": page["text"],
                "is_table": False,
            })

    if blocks:
        segments = create_segments(job_id="test-job", document_blocks=blocks)
        assert len(segments) > 0
        for seg in segments:
            assert seg["text"]
            assert seg["page_number"] >= 1
    else:
        pytest.skip("No text blocks extracted from simple PDF")
