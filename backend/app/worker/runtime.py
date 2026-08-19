from __future__ import annotations

import time

from app.core.config import Settings, get_settings
from app.db.session import build_session_factory
from app.providers.ai import create_provider
from app.storage.local import LocalStorage
from app.worker.fake import FakeWorker


class TranslationWorker(FakeWorker):
    """Production worker with the provider selected from application settings."""

    def __init__(self, settings: Settings | None = None, worker_id: str = "translation-worker") -> None:
        resolved_settings = settings or get_settings()
        super().__init__(
            LocalStorage(resolved_settings.storage_root),
            worker_id=worker_id,
            provider=create_provider(resolved_settings),
        )


def main() -> None:
    """Consume pending jobs until the process receives an interrupt."""
    settings = get_settings()
    session_factory = build_session_factory(settings)
    worker = TranslationWorker(settings)

    while True:
        with session_factory() as db:
            processed = worker.process_next(db)
        if processed is None:
            time.sleep(1)


if __name__ == "__main__":
    main()
