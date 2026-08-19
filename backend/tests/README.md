# Backend Test Harness

The harness uses `pytest` with a FastAPI app, SQLite database, and storage root
created under `tmp_path` for each test. The database dependency is overridden so
requests cannot accidentally use the module-level application database.
Tests use `/api/...` as the canonical route prefix and only cover implemented
routes.

## Contract coverage

| ID | Scope | Status |
| --- | --- | --- |
| TP-01 | `GET /health` status, payload and timestamp contract | Covered |
| TP-02 | Document upload, owner persistence and isolated storage | Covered |
| TP-03 | Upload MIME, valid/corrupt/non-PDF and 25 MiB validation | Covered |
| TP-04 | Job creation and outbox message | Covered |
| TP-05 | `GET /api/jobs/{job_id}` queued status and 404 | Covered |
| TP-06 | Job progress stream | Blocked: endpoint absent (strict xfail) |
| TP-07 | Translation configuration | Covered only by upload language validation; no separate endpoint |
| TP-08 | OCR warning behavior | Blocked: OCR/provider absent (strict xfail) |
| TP-09 | Preview retrieval | Blocked: endpoint absent (strict xfail) |
| TP-10 | Translated document download | Blocked: endpoint absent (strict xfail) |
| TP-11 | Job deletion/cancellation | Blocked: endpoint absent (strict xfail) |
| TP-12 | Error response contract for implemented routes | Covered: 400/404/413/415/422/409 |
| TP-13 | Persistence, outbox and deterministic FakeWorker artifact | Covered, including 0600 artifact and no-op queue |

FakeAI/timeout behavior is also an explicit strict `xfail` because no provider
integration exists in this backend slice. The test suite never calls OCI/OCR.

Run from `backend/`:

```bash
pytest --cov=app --cov-report=term-missing --cov-report=xml:coverage.xml --cov-report=html:htmlcov
```
