import type { JobResource, PreviewResponse } from "./api";
import type { DocumentPage, JobWarning } from "./types";

export const documentPages: DocumentPage[] = [
  { document_page_id: "dp-1", document_id: "doc-demo-1042", page_number: 1, width: 612, height: 792, rotation: 0, extraction_status: "extracted", ocr_used: false, ocr_confidence: null },
  { document_page_id: "dp-2", document_id: "doc-demo-1042", page_number: 2, width: 612, height: 792, rotation: 0, extraction_status: "ocr_completed", ocr_used: true, ocr_confidence: 0.71 },
];

export const jobWarnings: JobWarning[] = [
  { code: "OCR_LOW_CONFIDENCE", page_number: 2, message: "OCR confidence is below 90%. Manual review recommended." },
];

export const demoJob: JobResource = {
  job_id: "job-demo-1042",
  document_id: "doc-demo-1042",
  status: "completed",
  progress_percent: 100,
  current_step: "completed",
  source_language_code: "en",
  target_language_code: "es",
  requested_at: "2026-08-19T09:20:00Z",
  finished_at: "2026-08-19T09:21:35Z",
  links: { stream: "/api/jobs/job-demo-1042/stream", preview: "/api/jobs/job-demo-1042/preview", download: "/api/jobs/job-demo-1042/download" },
};

export const jobs: JobResource[] = [
  demoJob,
  {
    ...demoJob,
    job_id: "job-processing-1043",
    document_id: "doc-processing-1043",
    status: "extracting",
    progress_percent: 30,
    current_step: "extracting",
    requested_at: "2026-08-19T10:04:00Z",
    finished_at: undefined,
  },
  {
    ...demoJob,
    job_id: "job-ocr-1044",
    document_id: "doc-ocr-1044",
    status: "extracting",
    progress_percent: 25,
    current_step: "ocr_processing",
    requested_at: "2026-08-19T10:15:00Z",
    finished_at: undefined,
  },
];

export const preview: PreviewResponse = {
  job_id: demoJob.job_id,
  warnings: ["OCR_LOW_CONFIDENCE: una línea de la página 2 requiere revisión."],
  extraction: { status: "complete", document_type: "Technical guide", page_count: 2, blocks: 3, tables: 1 },
  reconstruction_errors: ["Página 2: una celda de tabla no pudo conservar su ancho original."],
  pages: [
    {
      page_number: 1,
      original_text: "Installation and maintenance guide",
      translated_text: "Guía de instalación y mantenimiento",
      blocks: [
        { block_id: "b-1", kind: "heading", text: "Installation and maintenance guide", translated_text: "Guía de instalación y mantenimiento", page_number: 1 },
      ],
    },
    {
      page_number: 2,
      original_text: "Disconnect power before opening the enclosure.",
      translated_text: "Desconecte la alimentación antes de abrir la carcasa.",
      ocr_warning: true,
      blocks: [
        { block_id: "b-2", kind: "paragraph", text: "Disconnect power before opening the enclosure.", translated_text: "Desconecte la alimentación antes de abrir la carcasa.", page_number: 2, confidence: 0.71 },
        { block_id: "b-3", kind: "list", text: "Inspect the seal before use.", translated_text: "Inspeccione el sello antes de usarlo.", page_number: 2 },
      ],
      tables: [
        {
          table_id: "t-1",
          page_number: 2,
          headers: ["Step", "Check"],
          rows: [["1", "Power off"]],
          translated_rows: [["1", "Apagar"]],
        },
      ],
    },
  ],
};
