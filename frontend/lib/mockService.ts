import type { JobResource, PreviewResponse, UploadResponse } from "./api";
import { demoJob, jobs, preview } from "./mockData";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export async function uploadMock(file: File, source = "auto", target = "es"): Promise<UploadResponse> {
  await wait(350);
  if (!file.name.toLowerCase().endsWith(".pdf")) throw new Error("UNSUPPORTED_FILE");
  if (file.size > 25 * 1024 * 1024) throw new Error("PLAN_LIMIT_EXCEEDED");
  const job = { ...demoJob, job_id: `job-mock-${Date.now()}`, document_id: `doc-mock-${Date.now()}`, status: "queued" as const, progress_percent: 5, current_step: "queued", source_language_code: source, target_language_code: target, requested_at: new Date().toISOString(), finished_at: undefined };
  return { document: { document_id: job.document_id, original_filename: file.name, mime_type: "application/pdf", size_bytes: file.size, status: "uploaded" }, job };
}
export async function getJobMock(id: string): Promise<JobResource> { await wait(180); const found = jobs.find((job) => job.job_id === id); if (!found) throw new Error("NOT_FOUND"); return { ...found }; }
export async function getPreviewMock(id: string): Promise<PreviewResponse> { await wait(180); return { ...preview, job_id: id }; }
export async function downloadMock(id: string): Promise<Blob> { await wait(160); return new Blob([`DocTranslate mock artifact for ${id}\n`], { type: "application/pdf" }); }
export function createProgressMock(job: JobResource, onUpdate: (next: JobResource) => void, onFinish: (next: JobResource) => void) {
  let cancelled = false; let progress = job.progress_percent;
  const timer = window.setInterval(() => { if (cancelled) return; progress = Math.min(100, progress + 17); const next: JobResource = { ...job, progress_percent: progress, status: progress === 100 ? "completed" : "translating", current_step: progress === 100 ? "completed" : "translating", finished_at: progress === 100 ? new Date().toISOString() : undefined }; onUpdate(next); if (progress === 100) { window.clearInterval(timer); onFinish(next); } }, 900);
  return () => { cancelled = true; window.clearInterval(timer); const next = { ...job, status: "cancelled" as const, current_step: "cancelled", progress_percent: progress }; onUpdate(next); };
}
