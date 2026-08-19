# DocTranslate Backend

FastAPI backend scaffold for the PDF translation workflow.

## Run locally

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

The application reads `APP_ENV`, `APP_HOST` and `APP_PORT` from the environment or a local `backend/.env` file. Unknown environment variables are ignored so later infrastructure settings can be introduced without breaking startup. Do not commit `.env` files or credentials.

Health checks:

```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/health
```

`/health` remains available for existing probes. New API routes should be added under `/api/v1`.

The current scaffold implements only the application entry point and health endpoint. Upload, OCR, PDF processing, database persistence, worker execution and OCI integration are intentionally added in later vertical slices.
