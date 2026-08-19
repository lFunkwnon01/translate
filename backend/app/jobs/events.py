import json

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import JobEvent, TranslationJob


def record_event(
    db: Session,
    job: TranslationJob,
    event_type: str,
    *,
    payload: dict[str, object] | None = None,
) -> JobEvent:
    sequence = db.scalar(select(func.max(JobEvent.sequence)).where(JobEvent.job_id == job.id)) or 0
    event = JobEvent(
        job_id=job.id,
        sequence=sequence + 1,
        event_type=event_type,
        status=job.status,
        progress_percent=job.progress_percent,
        current_step=job.current_step,
        payload=json.dumps(payload or {}, sort_keys=True),
    )
    db.add(event)
    return event
