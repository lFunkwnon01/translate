export type JobStatus = "queued" | "extracting" | "translating" | "completed" | "failed" | "cancelled";
export type ApiErrorCode = "UNSUPPORTED_FILE" | "PLAN_LIMIT_EXCEEDED" | "INVALID_PDF" | "NOT_FOUND" | "MOCK_FAILURE";
export type JobEventType = "info" | "success" | "warning" | "error";

export interface ApiError { error: { code: ApiErrorCode; message: string; details: Record<string, string | number> } }
export interface DocumentResource { document_id: string; original_filename: string; mime_type: "application/pdf"; size_bytes: number; status: "uploaded" }
export interface JobResource { job_id: string; document_id: string; status: JobStatus; progress_percent: number; current_step: string; source_language_code: string; target_language_code: string; requested_at: string; started_at?: string; finished_at?: string; links: { stream: string; preview: string | null; download: string | null } }
export interface UploadResponse { document: DocumentResource; job: JobResource }
export interface ExtractedBlock { block_id: string; kind: "heading" | "paragraph" | "list"; text: string; translated_text: string; page_number: number; confidence?: number }
export interface ExtractedTable { table_id: string; page_number: number; headers: string[]; rows: string[][]; translated_rows: string[][]; }
export interface PreviewPage { page_number: number; original_text: string; translated_text: string; ocr_warning?: boolean; blocks?: ExtractedBlock[]; tables?: ExtractedTable[] }
export interface PreviewResponse { job_id: string; pages: PreviewPage[]; warnings: string[]; extraction: { status: "complete" | "partial"; document_type: string; page_count: number; blocks: number; tables: number; }; reconstruction_errors: string[] }
export interface JobEvent { event_id: string; timestamp: string; type: JobEventType; message: string }
