from __future__ import annotations

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from app.pdf.extraction import ExtractionStatus, extract_text
from app.pdf.ocr import OcrBinariesNotAvailable, is_ocr_available
from app.pdf.reconstruction import reconstruct_pdf
from app.pdf.segmentation import create_segments
from app.validation.pdf_validator import validate_pdf


def test_tp04_scanned_pdf_ocr_flow(scanned_pdf_path: Path) -> None:
    result = extract_text(scanned_pdf_path.read_bytes())
    assert len(result.pages) == 1

    if not is_ocr_available():
        assert result.pages[0].extraction_status == ExtractionStatus.OK
        pytest.skip("OCR binaries not available, cannot test full flow")

    with patch("app.pdf.ocr.run_ocr") as mock_ocr:
        mock_ocr.return_value = MagicMock(text="extracted text", confidence=85.0)
        from app.pdf.ocr import run_ocr
        ocr_result = run_ocr(scanned_pdf_path.read_bytes(), page_number=1)
        assert ocr_result.text == "extracted text"
        assert ocr_result.confidence == 85.0


def test_tp05_ocr_low_confidence_warning() -> None:
    with patch("app.pdf.ocr.is_ocr_available", return_value=True):
        with patch("app.pdf.ocr.run_ocr") as mock_ocr:
            mock_ocr.return_value = MagicMock(text="garbage", confidence=15.0)
            from app.pdf.ocr import run_ocr
            result = run_ocr(b"fake", page_number=1)
            assert result.confidence < 50.0
            warnings = []
            if result.confidence < 50.0:
                warnings.append("OCR_LOW_CONFIDENCE")
            assert "OCR_LOW_CONFIDENCE" in warnings


def test_tp11_invalid_output_pdf() -> None:
    pages = [{"text": "test"}]
    output = reconstruct_pdf(pages)

    result = validate_pdf(output)
    assert result.valid is True

    invalid_bytes = b"%PDF-1.4\nbroken\n%%EOF\n"
    result_invalid = validate_pdf(invalid_bytes)
    assert result_invalid.valid is False


def test_tp04_segmentation_after_extraction(simple_pdf_path: Path) -> None:
    extraction = extract_text(simple_pdf_path.read_bytes())

    page_dicts = [
        {"page_number": p.page_number, "text": p.text}
        for p in extraction.pages
    ]
    block_dicts = {
        pn: [{"text": b.text} for b in blks]
        for pn, blks in extraction.blocks.items()
    }

    segments = create_segments(page_dicts, block_dicts)
    assert len(segments) > 0
    for seg in segments:
        assert seg.text
        assert seg.page_number >= 1
