from __future__ import annotations

import hashlib
import json
from typing import Any


def create_segments(
    job_id: str,
    document_blocks: list[dict[str, Any]],
    owner_key: str = "",
    document_id: str = "",
) -> list[dict[str, Any]]:
    segments: list[dict[str, Any]] = []
    current_texts: list[str] = []
    current_block_ids: list[str] = []
    current_page: int | None = None
    segment_index = 0

    for block in document_blocks:
        page_num = block.get("page_number", 0)
        block_id = block.get("id", "")
        text = block.get("text", "")
        is_table = block.get("is_table", False)

        if is_table or (current_page is not None and page_num != current_page) and current_texts:
            combined = "\n".join(current_texts)
            segments.append(
                _make_segment(
                    job_id=job_id,
                    document_id=document_id,
                    owner_key=owner_key,
                    segment_index=segment_index,
                    page_number=current_page or 0,
                    block_ids=current_block_ids,
                    text=combined,
                )
            )
            segment_index += 1
            current_texts = []
            current_block_ids = []

        if is_table:
            segments.append(
                _make_segment(
                    job_id=job_id,
                    document_id=document_id,
                    owner_key=owner_key,
                    segment_index=segment_index,
                    page_number=page_num,
                    block_ids=[block_id] if block_id else [],
                    text=text,
                )
            )
            segment_index += 1
            current_page = page_num
            continue

        if text.strip():
            current_texts.append(text)
            current_block_ids.append(block_id)
            current_page = page_num

    if current_texts:
        combined = "\n".join(current_texts)
        segments.append(
            _make_segment(
                job_id=job_id,
                document_id=document_id,
                owner_key=owner_key,
                segment_index=segment_index,
                page_number=current_page or 0,
                block_ids=current_block_ids,
                text=combined,
            )
        )

    return segments


def _make_segment(
    job_id: str,
    document_id: str,
    owner_key: str,
    segment_index: int,
    page_number: int,
    block_ids: list[str],
    text: str,
) -> dict[str, Any]:
    return {
        "job_id": job_id,
        "document_id": document_id,
        "owner_key": owner_key,
        "segment_index": segment_index,
        "page_number": page_number,
        "block_ids": json.dumps(block_ids),
        "text": text,
        "content_hash": hashlib.sha256(text.encode()).hexdigest(),
        "status": "pending",
    }
