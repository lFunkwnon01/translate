# Backend Test Harness

The harness uses `pytest` and a shared FastAPI `TestClient` fixture. It currently
covers only the implemented `GET /health` route. Tests must not assume routes
that are still part of the target API but are absent from the scaffold.

## Contract coverage

| ID | Scope | Status |
| --- | --- | --- |
| TP-01 | `GET /health` status, payload and timestamp contract | Covered |
| TP-02 | Document upload | Pending endpoint implementation |
| TP-03 | Upload validation | Pending endpoint implementation |
| TP-04 | Job creation | Pending endpoint implementation |
| TP-05 | Job status | Pending endpoint implementation |
| TP-06 | Job progress stream | Pending endpoint implementation |
| TP-07 | Translation configuration | Pending endpoint implementation |
| TP-08 | OCR warning behavior | Pending endpoint implementation |
| TP-09 | Preview retrieval | Pending endpoint implementation |
| TP-10 | Translated document download | Pending endpoint implementation |
| TP-11 | Job deletion | Pending endpoint implementation |
| TP-12 | Error response contract | Pending endpoint implementation |
| TP-13 | Persistence, queue and provider integration | Pending implementation |

Run from `backend/`:

```bash
pytest
```
