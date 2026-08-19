from __future__ import annotations

import shutil


class OCRBINARIES_NOT_AVAILABLE(RuntimeError):
    """Raised when tesseract or ocrmypdf binaries are not found."""


_TESSERACT_PATH: str | None = shutil.which("tesseract")
_OCRMYPDF_PATH: str | None = shutil.which("ocrmypdf")


def is_ocr_available() -> bool:
    return _TESSERACT_PATH is not None and _OCRMYPDF_PATH is not None


def ocr_page(storage_path: str, page_number: int) -> dict[str, object]:
    if not is_ocr_available():
        msg = (
            "OCRBINARIES_NOT_AVAILABLE: tesseract or ocrmypdf not found on PATH. "
            "Install them to enable OCR."
        )
        raise OCRBINARIES_NOT_AVAILABLE(msg)

    import ocrmypdf  # type: ignore[import-not-found]

    result = ocrmypdf.ocr(
        storage_path,
        storage_path,
        pages=page_number,
        force_ocr=True,
        progress_bar=False,
        keep_temporary_files=False,
    )
    return {
        "page_number": page_number,
        "ocr_used": True,
        "ocr_confidence": 1.0 if result == 0 else 0.0,
        "extraction_status": "ocr_completed",
    }
