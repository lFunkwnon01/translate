from fastapi import APIRouter

from app.api.v1.health import router as health_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.uploads import router as uploads_router


api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health_router)
api_router.include_router(uploads_router)
api_router.include_router(jobs_router)

legacy_router = APIRouter()
legacy_router.include_router(health_router)
legacy_router.include_router(uploads_router, prefix="/api")
legacy_router.include_router(jobs_router, prefix="/api")
