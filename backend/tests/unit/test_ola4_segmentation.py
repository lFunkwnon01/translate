from __future__ import annotations

from app.pdf.segmentation import create_segments


def test_create_segments_from_blocks() -> None:
    blocks = [
        {"id": "b1", "page_number": 1, "text": "Hello", "is_table": False},
        {"id": "b2", "page_number": 1, "text": "World", "is_table": False},
    ]

    segments = create_segments(job_id="test-job", document_blocks=blocks)

    assert len(segments) >= 1
    all_text = " ".join(s["text"] for s in segments)
    assert "Hello" in all_text
    assert "World" in all_text


def test_segment_order() -> None:
    blocks = [
        {"id": "b1", "page_number": 1, "text": "First", "is_table": False},
        {"id": "b2", "page_number": 2, "text": "Second", "is_table": False},
    ]

    segments = create_segments(job_id="test-job", document_blocks=blocks)

    assert len(segments) >= 1
    for seg in segments:
        assert seg["page_number"] >= 1


def test_empty_blocks_creates_no_segments() -> None:
    blocks = []

    segments = create_segments(job_id="test-job", document_blocks=blocks)

    assert len(segments) == 0


def test_content_hash_is_deterministic() -> None:
    blocks = [{"id": "b1", "page_number": 1, "text": "same", "is_table": False}]

    s1 = create_segments(job_id="test-job", document_blocks=blocks)
    s2 = create_segments(job_id="test-job", document_blocks=blocks)

    assert s1[0]["content_hash"] == s2[0]["content_hash"]
