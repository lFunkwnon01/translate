from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from app.pdf.ocr import OcrBinariesNotAvailable, is_ocr_available


def test_ocr_available_check() -> None:
    result = is_ocr_available()
    assert isinstance(result, bool)


def test_ocr_not_available_raises() -> None:
    if is_ocr_available():
        pytest.skip("tesseract is installed")
    with pytest.raises(OcrBinariesNotAvailable):
        from app.pdf.ocr import run_ocr
        run_ocr(b"%PDF-1.4\n%%EOF\n", page_number=1)


@pytest.mark.xfail(reason="OCR binaries may not be installed in CI")
def test_ocr_confidence_scoring() -> None:
    with patch("app.pdf.ocr.is_ocr_available", return_value=True):
        with patch("app.pdf.ocr.fitz") as mock_fitz:
            mock_page = MagicMock()
            mock_pix = MagicMock()
            mock_pix.tobytes.return_value = b"\x89PNG..."
            mock_page.get_pixmap.return_value = mock_pix
            mock_doc = MagicMock()
            mock_doc.__getitem__ = MagicMock(return_value=mock_page)
            mock_doc.__enter__ = MagicMock(return_value=mock_doc)
            mock_doc.__exit__ = MagicMock(return_value=False)
            mock_fitz.open.return_value = mock_doc

            with patch("app.pdf.ocr.pytesseract") as mock_tess:
                mock_tess.image_to_string.return_value = {
                    "text": "hello world",
                    "conf": [90, 85, 95],
                }
                mock_tess.Output.DICT = "dict"
                from app.pdf.ocr import run_ocr
                result = run_ocr(b"fake", page_number=1)
                assert result.confidence > 0


def test_ocr_binaries_not_available_error_code() -> None:
    exc = OcrBinariesNotAvailable()
    assert exc.code == "OCR_BINARIES_NOT_AVAILABLE"
    assert str(exc) == "OCR_BINARIES_NOT_AVAILABLE"
