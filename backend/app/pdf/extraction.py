from __future__ import annotations

import hashlib
from typing import Any

import fitz  # type: ignore[import-untyped]


def extract_document(storage_path: str) -> dict[str, Any]:
    doc = fitz.open(storage_path)
    pages: list[dict[str, Any]] = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        rect = page.rect
        text = page.get_text("text")
        text_hash = hashlib.sha256(text.encode()).hexdigest()
        has_text = bool(text.strip())
        pages.append(
            {
                "page_number": page_num + 1,
                "width": rect.width,
                "height": rect.height,
                "text": text,
                "text_hash": text_hash,
                "has_text": has_text,
                "extraction_status": "extracted" if has_text else "ocr_required",
            }
        )
    doc.close()
    return {"page_count": len(pages), "pages": pages}


def extract_page_text(doc: fitz.Document, page_number: int) -> str:
    page = doc[page_number - 1]
    return page.get_text("text")


def extract_page_blocks(doc: fitz.Document, page_number: int) -> list[dict[str, Any]]:
    page = doc[page_number - 1]
    raw_blocks = page.get_text("blocks")
    blocks: list[dict[str, Any]] = []
    for idx, block in enumerate(raw_blocks):
        x0, y0, x1, y1, text, _block_no, block_type = block
        text_content = text.strip() if block_type == 0 else ""
        text_hash = hashlib.sha256(text_content.encode()).hexdigest()
        blocks.append(
            {
                "block_index": idx,
                "x0": float(x0),
                "y0": float(y0),
                "x1": float(x1),
                "y1": float(y1),
                "text": text_content,
                "content_hash": text_hash,
                "ocr_used": False,
            }
        )
    return blocks
