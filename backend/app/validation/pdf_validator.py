from __future__ import annotations

from pathlib import Path

import fitz  # type: ignore[import-untyped]


def validate_pdf(path: str) -> dict[str, object]:
    errors: list[str] = []
    page_count = 0

    raw = Path(path).read_bytes()
    if not raw.startswith(b"%PDF"):
        errors.append("PDF_MISSING_MAGIC: file does not start with %PDF-")
    if not raw.rstrip().endswith(b"%%EOF"):
        errors.append("PDF_MISSING_EOF: file does not end with %%EOF")

    try:
        doc = fitz.open(path)
        page_count = len(doc)
        doc.close()
    except (ValueError, OSError) as exc:
        errors.append(f"PDF_CANNOT_OPEN: {exc}")

    return {"valid": len(errors) == 0, "page_count": page_count, "errors": errors}
