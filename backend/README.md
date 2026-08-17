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

Health check:

```bash
curl http://localhost:8000/health
```

The current scaffold implements only the application entry point and health endpoint. PDF processing, database persistence, worker execution and OCI integration are intentionally added in later vertical slices.
