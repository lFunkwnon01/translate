export type JobStatus = "queued" | "extracting" | "translating" | "completed" | "failed" | "cancelled";
export type ApiErrorCode = "UNSUPPORTED_FILE" | "PLAN_LIMIT_EXCEEDED" | "INVALID_PDF" | "NOT_FOUND" | "MOCK_FAILURE";

export interface ApiError { error: { code: ApiErrorCode; message: string; details: Record<string, string | number> } }
export interface DocumentResource { document_id: string; original_filename: string; mime_type: "application/pdf"; size_bytes: number; status: "uploaded" }
export interface JobResource { job_id: string; document_id: string; status: JobStatus; progress_percent: number; current_step: string; source_language_code: string; target_language_code: string; requested_at: string; started_at?: string; finished_at?: string; links: { stream: string; preview: string | null; download: string | null } }
export interface UploadResponse { document: DocumentResource; job: JobResource }
export interface PreviewPage { page_number: number; original_text: string; translated_text: string; ocr_warning?: boolean }
export interface PreviewResponse { job_id: string; pages: PreviewPage[]; warnings: string[] }
