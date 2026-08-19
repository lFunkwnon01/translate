export interface DocumentPage {
  document_page_id: string;
  document_id: string;
  page_number: number;
  width: number;
  height: number;
  rotation: number;
  extraction_status: "pending" | "extracted" | "ocr_required" | "ocr_completed" | "failed";
  ocr_used: boolean;
  ocr_confidence: number | null;
}

export interface DocumentBlock {
  block_id: string;
  document_page_id: string;
  block_order: number;
  block_type: "paragraph" | "heading" | "table" | "caption" | "formula" | "image" | "unknown";
  source_text: string | null;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  is_table: boolean;
  is_image: boolean;
}

export interface JobWarning {
  code: string;
  page_number?: number;
  message: string;
}
