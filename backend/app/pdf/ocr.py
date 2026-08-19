from __future__ import annotations

import os
import shutil
from pathlib import Path


class OCRBINARIES_NOT_AVAILABLE(RuntimeError):
    """Raised when tesseract or ocrmypdf binaries are not found."""


def _find_tesseract() -> str | None:
    path = shutil.which("tesseract")
    if path:
        return path
    local_bin = Path.home() / ".local" / "bin" / "tesseract"
    if local_bin.is_file():
        return str(local_bin)
    return None


_TESSERACT_PATH: str | None = _find_tesseract()
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

    env = os.environ.copy()
    if _TESSERACT_PATH:
        tessdata = Path.home() / ".local" / "share" / "tessdata"
        if tessdata.is_dir():
            env["TESSDATA_PREFIX"] = str(tessdata)

    import subprocess

    result = subprocess.run(
        [
            _OCRMYPDF_PATH,  # type: ignore[list-item]
            "--force-ocr",
            "--pages", str(page_number),
            "--output-type", "pdf",
            storage_path,
            storage_path,
        ],
        capture_output=True,
        text=True,
        env=env,
        timeout=120,
        check=False,
    )
    success = result.returncode == 0
    return {
        "page_number": page_number,
        "ocr_used": True,
        "ocr_confidence": 1.0 if success else 0.0,
        "extraction_status": "ocr_completed" if success else "failed",
    }
