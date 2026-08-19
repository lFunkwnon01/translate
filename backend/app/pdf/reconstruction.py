from __future__ import annotations

from typing import Any

import fitz  # type: ignore[import-untyped]


def reconstruct_pdf(
    original_path: str,
    translated_segments: list[dict[str, Any]],
    output_path: str,
) -> str:
    src = fitz.open(original_path)
    out = fitz.open()

    if len(src) == 0:
        if translated_segments:
            max_page = max(s.get("page_number", 1) for s in translated_segments)
            for page_num in range(1, max_page + 1):
                new_page = out.new_page(width=612, height=792)
                page_segs = [s for s in translated_segments if s.get("page_number") == page_num]
                translated_text = "\n\n".join(s.get("text", "") for s in page_segs)
                if translated_text.strip():
                    text_rect = fitz.Rect(36, 36, 576, 756)
                    new_page.insert_textbox(
                        text_rect, translated_text, fontsize=12.0, fontname="helv", color=(0, 0, 0)
                    )
        else:
            out.new_page(width=612, height=792)
    else:
        for page_num in range(len(src)):
            src_page = src[page_num]
            page_segments = [s for s in translated_segments if s.get("page_number") == page_num + 1]
            page_rect = src_page.rect
            new_page = out.new_page(width=page_rect.width, height=page_rect.height)

            translated_text = "\n\n".join(s.get("text", "") for s in page_segments)
            if translated_text.strip():
                text_rect = fitz.Rect(
                    page_rect.x0 + 36,
                    page_rect.y0 + 36,
                    page_rect.x1 - 36,
                    page_rect.y1 - 36,
                )
                new_page.insert_textbox(
                    text_rect,
                    translated_text,
                    fontsize=12.0,
                    fontname="helv",
                    color=(0, 0, 0),
                )
            else:
                new_page.draw_rect(page_rect, color=(0.8, 0.8, 0.8), width=0.5)

    if out.page_count < 1:
        out.new_page(width=612, height=792)

    out.save(output_path, garbage=4, deflate=True)
    out.close()
    src.close()
    return output_path
