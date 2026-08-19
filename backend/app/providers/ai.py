from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING, Protocol

if TYPE_CHECKING:
    from app.core.config import Settings


class AIProviderError(RuntimeError):
    """Expected provider failure, kept separate from worker/programming errors."""


class AIProvider(Protocol):
    def translate(self, source: bytes, source_language: str, target_language: str) -> bytes:
        ...

    def translate_segment(
        self,
        text: str,
        context: dict[str, object],
        source_language: str,
        target_language: str,
    ) -> str:
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

    def translate_segment(self, text: str, context: dict[str, object], source_language: str, target_language: str) -> str:
        if self.fail or self.fail_on == "translate":
            raise AIProviderError(self.error_message)
        return f"[translated {source_language}->{target_language}] {text}"


def create_provider(settings: Settings) -> AIProvider:
    """Create the appropriate AI provider based on settings."""
    if settings.ai_provider == "oracle":
        from app.providers.oracle import OracleAIProvider

        return OracleAIProvider(
            config_path=settings.oracle_config_path,
            config_profile=settings.oracle_config_profile,
            endpoint=settings.oracle_endpoint,
            model_id=settings.oracle_model_id,
            compartment_id=settings.oracle_compartment_id,
        )
    return FakeAIProvider()
