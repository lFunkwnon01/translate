from __future__ import annotations

from app.pdf.segmentation import Segment, create_segments


def test_create_segments_from_blocks() -> None:
    pages = [{"page_number": 1, "text": "Hello World"}]
    blocks = {
        1: [
            {"text": "Hello"},
            {"text": "World"},
        ]
    }

    segments = create_segments(pages, blocks)

    assert len(segments) == 2
    assert segments[0].text == "Hello"
    assert segments[1].text == "World"


def test_segment_order() -> None:
    pages = [
        {"page_number": 1, "text": "Page 1"},
        {"page_number": 2, "text": "Page 2"},
    ]
    blocks = {
        1: [{"text": "A"}],
        2: [{"text": "B"}],
    }

    segments = create_segments(pages, blocks)

    assert len(segments) == 2
    assert segments[0].segment_index == 0
    assert segments[0].page_number == 1
    assert segments[1].segment_index == 1
    assert segments[1].page_number == 2


def test_segment_coordinates() -> None:
    pages = [{"page_number": 1, "text": "coord test"}]
    blocks = {
        1: [{"text": "coord test", "x0": 10, "y0": 20, "x1": 100, "y1": 30}]
    }

    segments = create_segments(pages, blocks)

    assert len(segments) == 1
    assert segments[0].text == "coord test"
    assert segments[0].page_number == 1
    assert segments[0].block_ids == ["block-0"]


def test_empty_blocks_creates_page_segment() -> None:
    pages = [{"page_number": 1, "text": "fallback"}]
    blocks: dict[int, list[dict]] = {1: []}

    segments = create_segments(pages, blocks)

    assert len(segments) == 1
    assert segments[0].text == "fallback"


def test_content_hash_is_deterministic() -> None:
    pages = [{"page_number": 1, "text": "same"}]
    blocks = {1: [{"text": "same"}]}

    s1 = create_segments(pages, blocks)
    s2 = create_segments(pages, blocks)

    assert s1[0].content_hash == s2[0].content_hash
