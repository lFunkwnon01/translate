from dataclasses import dataclass
from typing import Protocol


class AIProviderError(RuntimeError):
    """Expected provider failure, kept separate from worker/programming errors."""


class AIProvider(Protocol):
    def translate(self, source: bytes, source_language: str, target_language: str) -> bytes:
        ...


@dataclass(frozen=True)
class FakeAIProvider:
    """Deterministic provider for this slice; it never performs OCR or calls OCI."""

    fail: bool = False
    error_message: str = "fake provider error"
    fail_on: str | None = None

    def translate(self, source: bytes, source_language: str, target_language: str) -> bytes:
        if self.fail or self.fail_on == "translate":
            raise AIProviderError(self.error_message)
        return b"%PDF-1.4\n% Fake translated artifact\n1 0 obj\n<<>>\nendobj\n%%EOF\n"
