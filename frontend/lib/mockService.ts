import type { JobEvent, JobResource, PreviewResponse, UploadResponse } from "./api";
import { demoJob, jobs, preview } from "./mockData";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const mockJobs = new Map(jobs.map((job) => [job.job_id, job]));

export async function uploadMock(file: File, source = "auto", target = "es"): Promise<UploadResponse> {
  await wait(350);
  if (!file.name.toLowerCase().endsWith(".pdf")) throw new Error("UNSUPPORTED_FILE");
  if (file.size > 25 * 1024 * 1024) throw new Error("PLAN_LIMIT_EXCEEDED");
  const job = { ...demoJob, job_id: `job-mock-${Date.now()}`, document_id: `doc-mock-${Date.now()}`, status: "queued" as const, progress_percent: 5, current_step: "queued", source_language_code: source, target_language_code: target, requested_at: new Date().toISOString(), finished_at: undefined };
  mockJobs.set(job.job_id, job);
  return { document: { document_id: job.document_id, original_filename: file.name, mime_type: "application/pdf", size_bytes: file.size, status: "uploaded" }, job };
}
export async function getJobMock(id: string): Promise<JobResource> { await wait(180); const found = mockJobs.get(id); if (!found) throw new Error("NOT_FOUND"); return { ...found }; }
export async function getPreviewMock(id: string): Promise<PreviewResponse> { await wait(180); return { ...preview, job_id: id }; }
export async function downloadMock(id: string): Promise<Blob> { await wait(160); return new Blob([`DocTranslate mock artifact for ${id}\n`], { type: "application/pdf" }); }
export function createProgressMock(job: JobResource, onUpdate: (next: JobResource) => void, onEvent: (event: JobEvent) => void) {
  let cancelled = false;
  let progress = job.progress_percent;
  const timer = window.setInterval(() => {
    if (cancelled) return;
    progress = Math.min(100, progress + 17);
    const completed = progress === 100;
    const next: JobResource = { ...job, progress_percent: progress, status: completed ? "completed" : "translating", current_step: completed ? "completed" : "translating", finished_at: completed ? new Date().toISOString() : undefined };
    onUpdate(next);
    onEvent({ event_id: `${job.job_id}-${progress}`, timestamp: new Date().toISOString(), type: completed ? "success" : "info", message: completed ? "Translation completed and validated." : `Translation progress updated to ${progress}%.` });
    if (completed) window.clearInterval(timer);
  }, 900);
  return () => {
    if (cancelled || progress === 100) return;
    cancelled = true;
    window.clearInterval(timer);
    const next = { ...job, status: "cancelled" as const, current_step: "cancelled", progress_percent: progress };
    onUpdate(next);
    onEvent({ event_id: `${job.job_id}-cancelled`, timestamp: new Date().toISOString(), type: "warning", message: "Processing cancelled by the user." });
  };
}
