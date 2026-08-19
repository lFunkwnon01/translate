import hashlib
import json
from typing import Annotated
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    Header,
    HTTPException,
    Request,
    UploadFile,
    status,
)
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.db.session import get_db
from app.jobs.events import record_event
from app.models import Document, JobOutboxMessage, TranslationJob
from app.storage.local import LocalStorage

router = APIRouter(prefix="/documents", tags=["documents"])
SUPPORTED_LANGUAGES = {"en", "es", "de", "fr", "it", "pt", "ja", "ko", "zh"}


def api_error(
    code: str, message: str, status_code: int, details: dict | None = None
) -> HTTPException:
    return HTTPException(
        status_code, detail={"error": {"code": code, "message": message, "details": details or {}}}
    )


def request_hash(content: bytes, source_language_code: str, target_language_code: str) -> str:
    digest = hashlib.sha256()
    digest.update(content)
    digest.update(b"\0")
    digest.update(source_language_code.encode("utf-8"))
    digest.update(b"\0")
    digest.update(target_language_code.encode("utf-8"))
    return digest.hexdigest()


@router.post("/upload", status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    request: Request,
    file: Annotated[UploadFile, File()],
    target_language_code: Annotated[str | None, Form()] = None,
    source_language_code: Annotated[str, Form()] = "auto",
    db: Session = Depends(get_db),  # noqa: B008
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
) -> dict[str, object]:
    settings: Settings = request.app.state.settings
    if not idempotency_key or not 1 <= len(idempotency_key) <= 128:
        raise api_error("IDEMPOTENCY_KEY_REQUIRED", "Idempotency-Key es obligatorio.", 400)
    if (
        not file.filename
        or not file.filename.lower().endswith(".pdf")
        or file.content_type != "application/pdf"
    ):
        raise api_error("UNSUPPORTED_FILE", "Solo se aceptan archivos PDF.", 415)
    if source_language_code != "auto" and source_language_code not in SUPPORTED_LANGUAGES:
        raise api_error("UNSUPPORTED_LANGUAGE", "Idioma fuente no soportado.", 422)
    if target_language_code is None or target_language_code not in SUPPORTED_LANGUAGES:
        raise api_error("UNSUPPORTED_LANGUAGE", "Idioma destino no soportado.", 422)

    content = await file.read(settings.max_file_size_bytes + 1)
    if len(content) > settings.max_file_size_bytes:
        raise api_error(
            "PLAN_LIMIT_EXCEEDED",
            "El archivo supera el limite permitido.",
            413,
            {
                "metric_code": "max_file_size_bytes",
                "limit_value": settings.max_file_size_bytes,
                "received_value": len(content),
            },
        )
    if not content.startswith(b"%PDF-") or b"%%EOF" not in content[-1024:]:
        raise api_error("INVALID_PDF", "El archivo no es un PDF valido.", 422)
    owner_key = settings.owner_key
    calculated_request_hash = request_hash(content, source_language_code, target_language_code)
    existing = db.scalar(
        select(TranslationJob).where(
            TranslationJob.owner_key == owner_key, TranslationJob.idempotency_key == idempotency_key
        )
    )
    if existing:
        document = db.get(Document, existing.document_id)
        if document is None:
            raise api_error("STORAGE_ERROR", "No se encontro el documento del trabajo.", 500)
        if existing.request_hash != calculated_request_hash:
            raise api_error(
                "IDEMPOTENCY_KEY_CONFLICT",
                "La clave de idempotencia ya fue usada con otra solicitud.",
                409,
            )
        return _response(document, existing)

    document_id = str(uuid4())
    storage = LocalStorage(settings.storage_root)
    storage_path, content_hash = storage.save_document(owner_key, document_id, content)
    document = Document(
        id=document_id,
        owner_key=owner_key,
        original_filename=file.filename,
        mime_type="application/pdf",
        size_bytes=len(content),
        content_hash=content_hash,
        storage_path=storage_path,
    )
    job = TranslationJob(
        document_id=document_id,
        owner_key=owner_key,
        idempotency_key=idempotency_key,
        request_hash=calculated_request_hash,
        source_language_code=source_language_code,
        target_language_code=target_language_code,
    )
    db.add_all([document, job])
    db.flush()
    db.add(JobOutboxMessage(job_id=job.id, payload=json.dumps({"job_id": job.id})))
    record_event(db, job, "job.queued")
    db.commit()
    return _response(document, job)


def _response(document: Document, job: TranslationJob) -> dict[str, object]:
    return {
        "document": {
            "document_id": document.id,
            "original_filename": document.original_filename,
            "mime_type": document.mime_type,
            "size_bytes": document.size_bytes,
            "status": document.status,
        },
        "job": {
            "job_id": job.id,
            "status": job.status,
            "progress_percent": job.progress_percent,
            "current_step": job.current_step,
            "requested_at": job.requested_at,
        },
    }
