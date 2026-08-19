from __future__ import annotations

from typing import Any

import pdfplumber


def extract_tables(storage_path: str, page_number: int) -> list[dict[str, Any]]:
    tables: list[dict[str, Any]] = []
    with pdfplumber.open(storage_path) as pdf:
        if page_number < 1 or page_number > len(pdf.pages):
            return tables
        page = pdf.pages[page_number - 1]
        for idx, table in enumerate(page.extract_tables() or []):
            if not table:
                continue
            rows = []
            for row in table:
                cleaned = [cell if cell is not None else "" for cell in row]
                rows.append(cleaned)
            bboxes = page.find_tables()
            bbox = bboxes[idx].bbox if idx < len(bboxes) else (0, 0, page.width, page.height)
            tables.append(
                {
                    "block_index": idx,
                    "x0": float(bbox[0]),
                    "y0": float(bbox[1]),
                    "x1": float(bbox[2]),
                    "y1": float(bbox[3]),
                    "rows": rows,
                    "text": "\n".join(" | ".join(row) for row in rows),
                }
            )
    return tables
