from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import Settings


def build_engine(settings: Settings):
    if settings.database_url.startswith("sqlite:///"):
        database_path = settings.database_url.removeprefix("sqlite:///")
        Path(database_path).parent.mkdir(parents=True, exist_ok=True)
    connect_args = (
        {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
    )
    return create_engine(settings.database_url, connect_args=connect_args)


def build_session_factory(settings: Settings) -> sessionmaker[Session]:
    return sessionmaker(bind=build_engine(settings), autoflush=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    from app.main import app

    session = app.state.session_factory()
    try:
        yield session
    finally:
        session.close()
