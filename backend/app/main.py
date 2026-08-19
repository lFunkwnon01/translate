from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router, legacy_router
from app.core.config import Settings, get_settings
from app.db.session import build_session_factory
from app.worker.runtime import TranslationWorker


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    app = FastAPI(
        title="DocTranslate API",
        version="0.1.0",
        description="Contextual PDF translation backend",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.state.settings = settings
    app.state.session_factory = build_session_factory(settings)
    app.state.worker = TranslationWorker(settings)
    app.include_router(legacy_router)
    app.include_router(api_router)
    return app


app = create_app()
