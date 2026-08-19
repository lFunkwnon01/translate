import json
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.jobs.events import record_event
from app.models import DocumentPage, JobEvent, TranslationJob
from app.storage.local import LocalStorage

router = APIRouter(prefix="/jobs", tags=["jobs"])


def _job(job_id: str, request: Request, db: Session) -> TranslationJob:
    job = db.get(TranslationJob, job_id)
    if not job or job.owner_key != request.app.state.settings.owner_key:
        raise HTTPException(404, detail={"error": {"code": "NOT_FOUND", "message": "Trabajo no encontrado."}})
    return job


def _links(job: TranslationJob) -> dict[str, str | None]:
    ready = job.status == "completed"
    return {
        "stream": f"/api/jobs/{job.id}/stream",
        "preview": f"/api/jobs/{job.id}/preview?page=1" if ready else None,
        "download": f"/api/jobs/{job.id}/download" if ready else None,
    }


def _ocr_warnings(job: TranslationJob, db: Session) -> list[dict[str, object]]:
    if not job.document_id:
        return []
    pages = db.scalars(
        select(DocumentPage).where(DocumentPage.document_id == job.document_id).order_by(DocumentPage.page_number)
    ).all()
    warnings: list[dict[str, object]] = []
    for page in pages:
        if page.ocr_used:
            warnings.append({
                "code": "OCR_USED",
                "page_number": page.page_number,
                "message": f"OCR applied on page {page.page_number}",
                "confidence": page.ocr_confidence,
            })
        elif page.ocr_confidence is not None and page.ocr_confidence < 0.5:
            warnings.append({
                "code": "OCR_LOW_CONFIDENCE",
                "page_number": page.page_number,
                "message": f"Low OCR confidence on page {page.page_number}",
                "confidence": page.ocr_confidence,
            })
    return warnings


def _status(job: TranslationJob, db: Session | None = None) -> dict[str, object]:
    ocr_warning = _ocr_warnings(job, db) if db is not None else None
    return {
        "job_id": job.id,
        "document_id": job.document_id,
        "status": job.status,
        "progress_percent": job.progress_percent,
        "current_step": job.current_step,
        "checkpoint": job.checkpoint,
        "cancellation_requested": job.cancellation_requested,
        "source_language_code": job.source_language_code,
        "target_language_code": job.target_language_code,
        "requested_at": job.requested_at,
        "started_at": job.started_at,
        "finished_at": job.finished_at,
        "ocr_warning": ocr_warning,
        "links": _links(job),
    }


def _artifact(request: Request, job: TranslationJob):
    if not job.artifact_path:
        raise HTTPException(409, detail={"error": {"code": "ARTIFACT_NOT_READY", "message": "El artifact no esta listo."}})
    try:
        path = LocalStorage(request.app.state.settings.storage_root).artifact_path(
            job.owner_key, job.id, job.artifact_path
        )
    except ValueError:
        raise HTTPException(404, detail={"error": {"code": "ARTIFACT_NOT_FOUND", "message": "Artifact no encontrado."}}) from None
    if not path.is_file():
        raise HTTPException(404, detail={"error": {"code": "ARTIFACT_NOT_FOUND", "message": "Artifact no encontrado."}})
    return path


@router.get("/{job_id}")
def get_job(job_id: str, request: Request, db: Session = Depends(get_db)) -> dict[str, object]:  # noqa: B008
    return _status(_job(job_id, request, db), db)


@router.get("/{job_id}/events")
def get_events(job_id: str, request: Request, db: Session = Depends(get_db)) -> dict[str, object]:  # noqa: B008
    job = _job(job_id, request, db)
    events = db.scalars(select(JobEvent).where(JobEvent.job_id == job.id).order_by(JobEvent.sequence)).all()
    return {"job_id": job.id, "events": [_event_json(event) for event in events]}


@router.get("/{job_id}/stream")
def stream_events(job_id: str, request: Request, db: Session = Depends(get_db)) -> StreamingResponse:  # noqa: B008
    job = _job(job_id, request, db)
    events = db.scalars(select(JobEvent).where(JobEvent.job_id == job.id).order_by(JobEvent.sequence)).all()

    def body():
        for event in events:
            yield f"id: {event.sequence}\nevent: {event.event_type}\ndata: {json.dumps(_event_json(event), default=str)}\n\n"

    return StreamingResponse(body(), media_type="text/event-stream", headers={"Cache-Control": "no-cache"})


@router.delete("/{job_id}", status_code=204)
def cancel_job(job_id: str, request: Request, db: Session = Depends(get_db)) -> Response:  # noqa: B008
    job = _job(job_id, request, db)
    if job.status in {"completed", "failed", "cancelled"}:
        raise HTTPException(409, detail={"error": {"code": "JOB_NOT_CANCELLABLE", "message": "El trabajo ya termino."}})
    job.cancellation_requested = True
    job.status = "cancellation_requested"
    job.current_step = "cancellation_requested"
    job.checkpoint = "cancellation_requested"
    record_event(db, job, "job.cancellation_requested")
    db.commit()
    return Response(status_code=204)


@router.post("/{job_id}/cancel")
def cancel_job_json(job_id: str, request: Request, db: Session = Depends(get_db)) -> dict[str, object]:  # noqa: B008
    cancel_job(job_id, request, db)
    return _status(_job(job_id, request, db), db)


@router.get("/{job_id}/preview")
def preview_job(
    job_id: str,
    request: Request,
    page: int = Query(1, ge=1),
    db: Session = Depends(get_db),  # noqa: B008
) -> Response:
    job = _job(job_id, request, db)
    if job.status != "completed":
        raise HTTPException(409, detail={"error": {"code": "ARTIFACT_NOT_READY", "message": "El artifact no esta listo."}})
    if page != 1:
        raise HTTPException(404, detail={"error": {"code": "PAGE_NOT_FOUND", "message": "Pagina no disponible."}})
    path = _artifact(request, job)
    expires = datetime.now(UTC) + timedelta(seconds=request.app.state.settings.preview_ttl_seconds)
    return Response(path.read_bytes(), media_type="application/pdf", headers={"Cache-Control": f"private, max-age={request.app.state.settings.preview_ttl_seconds}", "Expires": expires.strftime("%a, %d %b %Y %H:%M:%S GMT"), "X-Preview-Page": "1"})


@router.get("/{job_id}/download")
def download_job(job_id: str, request: Request, db: Session = Depends(get_db)) -> FileResponse:  # noqa: B008
    job = _job(job_id, request, db)
    if job.status != "completed":
        raise HTTPException(409, detail={"error": {"code": "ARTIFACT_NOT_READY", "message": "El artifact no esta listo."}})
    path = _artifact(request, job)
    return FileResponse(path, media_type="application/pdf", filename=f"{job.id}.pdf")


def _event_json(event: JobEvent) -> dict[str, object]:
    return {
        "id": event.id,
        "sequence": event.sequence,
        "event_type": event.event_type,
        "status": event.status,
        "progress_percent": event.progress_percent,
        "current_step": event.current_step,
        "payload": json.loads(event.payload),
        "created_at": event.created_at,
    }
