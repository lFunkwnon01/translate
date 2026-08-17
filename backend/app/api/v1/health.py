from datetime import datetime, timezone

from fastapi import APIRouter


router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict[str, object]:
    return {
        "status": "ok",
        "service": "doctranslate-api",
        "version": "0.1.0",
        "checks": {
            "database": "not_checked",
            "storage": "not_checked",
            "queue": "not_checked",
            "ai_provider": "not_configured",
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
