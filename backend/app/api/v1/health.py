from datetime import UTC, datetime
from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["health"])


class HealthChecks(BaseModel):
    api: Literal["ok"] = "ok"


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: Literal["doctranslate-api"]
    version: Literal["0.1.0"]
    checks: HealthChecks
    timestamp: datetime


@router.get("/health")
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="doctranslate-api",
        version="0.1.0",
        checks=HealthChecks(),
        timestamp=datetime.now(UTC),
    )
