from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class ContextManager:
    window_size: int = 2
    glossary: dict[str, str] = field(default_factory=dict)

    def build(self, index: int, segments: list[str], retrieved: list[str]) -> dict[str, object]:
        start = max(0, index - self.window_size)
        end = min(len(segments), index + self.window_size + 1)
        return {
            "before": segments[start:index],
            "after": segments[index + 1:end],
            "retrieved": retrieved,
            "glossary": dict(self.glossary),
        }

    def remember(self, source: str, translated: str) -> None:
        if source.strip() and translated.strip():
            self.glossary.setdefault(source.strip(), translated.strip())
