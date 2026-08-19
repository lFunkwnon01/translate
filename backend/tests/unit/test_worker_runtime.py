from app.core.config import Settings
from app.providers.ai import FakeAIProvider
from app.worker.runtime import TranslationWorker


def test_runtime_worker_uses_fake_provider_by_default(tmp_path) -> None:
    settings = Settings(storage_root=str(tmp_path / "storage"))

    worker = TranslationWorker(settings)

    assert isinstance(worker.provider, FakeAIProvider)
