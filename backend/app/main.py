from fastapi import FastAPI

from app.api.router import api_router, legacy_router
from app.core.config import Settings, get_settings
from app.db.base import Base
from app.db.session import build_session_factory
from app.models import Document, JobOutboxMessage, TranslationJob  # noqa: F401


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    app = FastAPI(
        title="DocTranslate API",
        version="0.1.0",
        description="Contextual PDF translation backend",
    )
    app.state.settings = settings
    app.state.session_factory = build_session_factory(settings)
    Base.metadata.create_all(app.state.session_factory.kw["bind"])
    app.include_router(legacy_router)
    app.include_router(api_router)
    return app


app = create_app()
