"use client";

import { useState } from "react";
import type { PreviewPage } from "../../lib/api";

interface DocumentPreviewProps {
  pages: PreviewPage[];
  warnings: string[];
  extractionStatus: "complete" | "partial";
  documentType: string;
  pageCount: number;
  blockCount: number;
  tableCount: number;
}

export function DocumentPreview({
  pages,
  warnings,
  extractionStatus,
  documentType,
  pageCount,
  blockCount,
  tableCount,
}: DocumentPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const totalPages = pages.length || pageCount;

  const page = pages.find((p) => p.page_number === currentPage) ?? pages[0];
  const hasWarnings = warnings.length > 0;

  return (
    <section className="panel stack preview-panel">
      <div className="row">
        <div>
          <div className="eyebrow">Document preview</div>
          <h3>Original vs Translated</h3>
        </div>
        <span className="tag">{totalPages} pages</span>
      </div>

      <div className="extraction-grid">
        <div>
          <span className="muted small">Extraction</span>
          <strong>{extractionStatus === "complete" ? "Ready" : "Partial"}</strong>
          <span className="muted small">
            {documentType} · {pageCount} pages
          </span>
        </div>
        <div>
          <span className="muted small">Structure</span>
          <strong>{blockCount} blocks</strong>
          <span className="muted small">
            {tableCount} {tableCount === 1 ? "table" : "tables"}
          </span>
        </div>
      </div>

      <div className="preview-controls row">
        <div className="preview-nav">
          <button
            className="btn secondary btn-sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            ← Prev
          </button>
          <span className="small muted" style={{ padding: "0 8px" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn secondary btn-sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next →
          </button>
        </div>
        <div className="zoom-controls">
          <button
            className="btn secondary btn-sm"
            disabled={zoom <= 50}
            onClick={() => setZoom((z) => Math.max(50, z - 25))}
          >
            −
          </button>
          <span className="small muted" style={{ padding: "0 6px" }}>
            {zoom}%
          </span>
          <button
            className="btn secondary btn-sm"
            disabled={zoom >= 200}
            onClick={() => setZoom((z) => Math.min(200, z + 25))}
          >
            +
          </button>
        </div>
      </div>

      {page ? (
        <div className="preview-side-by-side" style={{ fontSize: `${zoom / 100}rem` }}>
          <div className="preview-col">
            <div className="small muted" style={{ marginBottom: 6, fontWeight: 700 }}>
              Original
            </div>
            <div className="preview-text-block">
              {page.original_text}
            </div>
          </div>
          <div className="preview-col">
            <div className="small muted" style={{ marginBottom: 6, fontWeight: 700 }}>
              Translated
            </div>
            <div className="preview-text-block">
              {page.translated_text}
            </div>
          </div>
        </div>
      ) : (
        <div className="muted small">No page data available.</div>
      )}

      {hasWarnings && (
        <div className="ocr-page-warning small">
          <strong>OCR note:</strong> This page had OCR processing applied. Some content may require review.
        </div>
      )}

      {page?.blocks && page.blocks.length > 0 && (
        <div className="preview-blocks">
          <div className="small muted" style={{ fontWeight: 700, marginBottom: 6 }}>
            Extracted blocks
          </div>
          {page.blocks.map((block) => (
            <div className="document-block" key={block.block_id}>
              <span className="tag">{block.kind}</span>
              <span className="small">{block.translated_text}</span>
              {block.confidence !== undefined && (
                <span className="muted small">
                  OCR {Math.round(block.confidence * 100)}%
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {page?.tables && page.tables.length > 0 && (
        <div className="preview-tables">
          <div className="small muted" style={{ fontWeight: 700, marginBottom: 6 }}>
            Extracted tables
          </div>
          {page.tables.map((table) => (
            <div className="table-wrap" key={table.table_id}>
              <table>
                <thead>
                  <tr>
                    {table.headers.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.translated_rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
