from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import TranslationJob

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/{job_id}")
def get_job(job_id: str, request: Request, db: Session = Depends(get_db)) -> dict[str, object]:
    job = db.get(TranslationJob, job_id)
    if not job or job.owner_key != request.app.state.settings.owner_key:
        raise HTTPException(404, detail={"error": {"code": "NOT_FOUND", "message": "Trabajo no encontrado."}})
    return {"job_id": job.id, "document_id": job.document_id, "status": job.status,
            "progress_percent": job.progress_percent, "current_step": job.current_step,
            "source_language_code": job.source_language_code, "target_language_code": job.target_language_code,
            "requested_at": job.requested_at, "started_at": job.started_at, "finished_at": job.finished_at,
            "links": {"stream": f"/api/jobs/{job.id}/stream", "preview": None, "download": None}}
