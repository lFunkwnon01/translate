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
| TP-03 | Upload MIME, PDF signature and size validation | Covered |
| TP-04 | Job creation and outbox message | Covered |
| TP-05 | Job status | Covered through `FakeWorker` state transition |
| TP-06 | Job progress stream | Pending endpoint implementation |
| TP-07 | Translation configuration | Pending endpoint implementation |
| TP-08 | OCR warning behavior | Pending endpoint implementation |
| TP-09 | Preview retrieval | Pending endpoint implementation |
| TP-10 | Translated document download | Pending endpoint implementation |
| TP-11 | Job deletion | Pending endpoint implementation |
| TP-12 | Error response contract | Pending endpoint implementation |
| TP-13 | Persistence, outbox and deterministic FakeWorker artifact | Covered |

The different-payload reuse of an `Idempotency-Key` is retained as a strict
`xfail`: the current endpoint replays the existing response and does not yet
return the expected conflict response.

Run from `backend/`:

```bash
pytest
```
