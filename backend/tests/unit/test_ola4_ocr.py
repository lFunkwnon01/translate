from __future__ import annotations

import pytest

from app.pdf.ocr import OCRBINARIES_NOT_AVAILABLE, is_ocr_available, ocr_page


def test_ocr_available_check() -> None:
    result = is_ocr_available()
    assert isinstance(result, bool)


def test_ocr_not_available_raises() -> None:
    if is_ocr_available():
        pytest.skip("tesseract is installed")
    with pytest.raises(OCRBINARIES_NOT_AVAILABLE):
        ocr_page("/nonexistent.pdf", page_number=1)


def test_ocr_error_message() -> None:
    exc = OCRBINARIES_NOT_AVAILABLE("test message")
    assert str(exc) == "test message"
    assert isinstance(exc, RuntimeError)
