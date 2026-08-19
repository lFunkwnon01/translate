from __future__ import annotations

import re
from dataclasses import dataclass, field


def _terms(text: str) -> set[str]:
    return {term.lower() for term in re.findall(r"[\w'-]+", text) if len(term) > 2}


@dataclass
class LocalRAG:
    """Small deterministic retrieval index for document-local translation context."""

    entries: list[tuple[str, set[str]]] = field(default_factory=list)

    def add(self, text: str) -> None:
        if text.strip():
            self.entries.append((text, _terms(text)))

    def search(self, query: str, limit: int = 3) -> list[str]:
        query_terms = _terms(query)
        ranked = sorted(
            self.entries,
            key=lambda entry: len(query_terms & entry[1]),
            reverse=True,
        )
        return [text for text, terms in ranked if query_terms & terms][:limit]
