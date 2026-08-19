import type { JobEvent, JobResource, PreviewResponse, UploadResponse } from "./api";
import type { JobWarning } from "./types";
import { demoJob, jobs, preview, jobWarnings } from "./mockData";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const mockJobs = new Map(jobs.map((job) => [job.job_id, job]));
const mockWarnings = new Map<string, JobWarning[]>([[demoJob.job_id, jobWarnings]]);

export async function uploadMock(file: File, source = "auto", target = "es", opts?: { ocr?: boolean; preserveLayout?: boolean }): Promise<UploadResponse> {
  await wait(350);
  if (!file.name.toLowerCase().endsWith(".pdf")) throw new Error("UNSUPPORTED_FILE");
  if (file.size > 25 * 1024 * 1024) throw new Error("PLAN_LIMIT_EXCEEDED");
  const job = {
    ...demoJob,
    job_id: `job-mock-${Date.now()}`,
    document_id: `doc-mock-${Date.now()}`,
    status: "queued" as const,
    progress_percent: 5,
    current_step: "queued",
    source_language_code: source,
    target_language_code: target,
    requested_at: new Date().toISOString(),
    finished_at: undefined,
  };
  mockJobs.set(job.job_id, job);
  return { document: { document_id: job.document_id, original_filename: file.name, mime_type: "application/pdf", size_bytes: file.size, status: "uploaded" }, job };
}

export async function getJobMock(id: string): Promise<JobResource> {
  await wait(180);
  const found = mockJobs.get(id);
  if (!found) throw new Error("NOT_FOUND");
  return { ...found };
}

export async function getPreviewMock(id: string): Promise<PreviewResponse> {
  await wait(180);
  return { ...preview, job_id: id };
}

export async function getWarningsMock(id: string): Promise<JobWarning[]> {
  await wait(100);
  return mockWarnings.get(id) ?? [];
}

export async function downloadMock(id: string): Promise<Blob> {
  await wait(160);
  return new Blob([`DocTranslate mock artifact for ${id}\n`], { type: "application/pdf" });
}

export function createProgressMock(
  job: JobResource,
  onUpdate: (next: JobResource) => void,
  onEvent: (event: JobEvent) => void
) {
  let cancelled = false;
  let progress = job.progress_percent;
  const totalSteps = [
    { at: 20, step: "extracting", label: "extracting" },
    { at: 40, step: "ocr_processing", label: "ocr processing" },
    { at: 65, step: "translating", label: "translating" },
    { at: 85, step: "rebuilding", label: "rebuilding" },
    { at: 95, step: "validating", label: "validating" },
    { at: 100, step: "completed", label: "completed" },
  ];

  const timer = window.setInterval(() => {
    if (cancelled) return;
    progress = Math.min(100, progress + 12);
    const completed = progress >= 100;
    const currentStep = completed ? "completed" : totalSteps.find((s) => progress < s.at)?.step ?? "completed";

    const mockTotalPages = 8;
    const mockCurrentPage = Math.min(mockTotalPages, Math.max(1, Math.floor((progress / 100) * mockTotalPages)));

    const next: JobResource = {
      ...job,
      progress_percent: completed ? 100 : progress,
      status: completed ? "completed" : (currentStep === "extracting" || currentStep === "ocr_processing") ? "extracting" : "translating",
      current_step: currentStep,
      finished_at: completed ? new Date().toISOString() : undefined,
    };

    onUpdate(next);

    const pageInfo = currentStep === "extracting" || currentStep === "ocr_processing"
      ? ` (page ${mockCurrentPage}/${mockTotalPages})`
      : "";

    let evtType: JobEvent["type"] = "info";
    let msg = `${currentStep.replace(/_/g, " ")}${pageInfo}`;
    if (currentStep === "ocr_processing") {
      evtType = "warning";
      msg = `OCR processing low-confidence page${pageInfo}`;
    } else if (completed) {
      evtType = "success";
      msg = "Translation completed and validated.";
    }

    onEvent({
      event_id: `${job.job_id}-${progress}`,
      timestamp: new Date().toISOString(),
      type: evtType,
      message: msg,
    });

    if (completed) window.clearInterval(timer);
  }, 900);

  return () => {
    if (cancelled || progress >= 100) return;
    cancelled = true;
    window.clearInterval(timer);
    const next = { ...job, status: "cancelled" as const, current_step: "cancelled", progress_percent: progress };
    onUpdate(next);
    onEvent({
      event_id: `${job.job_id}-cancelled`,
      timestamp: new Date().toISOString(),
      type: "warning",
      message: "Processing cancelled by the user.",
    });
  };
}
