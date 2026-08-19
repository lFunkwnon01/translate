# DocTranslate Backend

FastAPI backend scaffold for the PDF translation workflow.

## Run locally

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
set -a; [ ! -f .env ] || source .env; set +a
alembic upgrade head
uvicorn app.main:app --reload --host "${APP_HOST:-127.0.0.1}" --port "${APP_PORT:-8000}"
```

Copy `.env.example` to `.env` before starting if you want local values. The application reads `APP_ENV`, `APP_HOST` and `APP_PORT` from the environment (or from `backend/.env` when settings are loaded). The shell command above passes the configured host and port to Uvicorn; its defaults are `127.0.0.1` and `8000`. Unknown environment variables are ignored so later infrastructure settings can be introduced without breaking startup. Do not commit `.env` files or credentials.

Health checks:

```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/health
```

`/health` remains available for existing probes. The canonical API route is `/api/...`; `/api/v1/...` is a temporary versioned alias for compatibility and should not be used for new route references.

The public health payload is intentionally limited to the API check and does not expose database, storage, queue, or provider readiness details. If operational readiness checks are added later, keep them internal to deployment/runtime diagnostics rather than extending this public contract.

## Ola 2 backend foundation

The local MVP now persists `documents`, `translation_jobs` and `job_outbox_messages` in SQLite. Alembic is the only runtime/dev schema owner; the application never calls SQLAlchemy `create_all`. Run migrations explicitly before starting the service:

```bash
alembic upgrade head
```

`POST /api/documents/upload` requires `Idempotency-Key`, accepts only PDF files up to 25 MiB, and stores files beneath a permission-restricted `STORAGE_ROOT` partitioned by installation owner and UUID. The configured `OWNER_KEY` is local installation identity; it is never accepted from request bodies.

The `FakeWorker` in `app.worker.fake` consumes one pending outbox message and writes a deterministic test artifact. It does not call OCI, perform OCR/RAG, or expose public authentication. The real provider integration remains outside this slice.
