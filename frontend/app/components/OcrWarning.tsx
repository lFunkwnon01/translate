"use client";

import { useState } from "react";
import type { JobWarning } from "../../lib/types";

function confidenceColor(confidence: number | null): string {
  if (confidence === null) return "#66747f";
  if (confidence > 0.9) return "#087443";
  if (confidence > 0.7) return "#c86d32";
  return "#9c3028";
}

function confidenceBg(confidence: number | null): string {
  if (confidence === null) return "#edf5f0";
  if (confidence > 0.9) return "#dcefe5";
  if (confidence > 0.7) return "#fff4e8";
  return "#fff0ef";
}

interface OcrWarningProps {
  warnings: JobWarning[];
  pageConfidences?: Map<number, number>;
}

export function OcrWarning({ warnings, pageConfidences }: OcrWarningProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || warnings.length === 0) return null;
  const ocrWarnings = warnings.filter((w) => w.code === "OCR_LOW_CONFIDENCE");
  if (ocrWarnings.length === 0) return null;
  return (
    <div className="warning ocr-warning" role="alert">
      <div className="row">
        <strong>OCR warnings detected</strong>
        <button className="btn secondary btn-sm" onClick={() => setDismissed(true)}>
          Dismiss
        </button>
      </div>
      <p className="small" style={{ margin: "6px 0 10px" }}>
        Some pages required OCR processing with varying confidence levels.
      </p>
      <div className="ocr-pages">
        {ocrWarnings.map((w) => {
          const conf = w.page_number !== undefined && pageConfidences ? pageConfidences.get(w.page_number) ?? null : null;
          return (
            <div className="ocr-page-item" key={`${w.code}-${w.page_number}`}>
              <span
                className="ocr-conf-badge"
                style={{ background: confidenceBg(conf), color: confidenceColor(conf) }}
              >
                {conf !== null ? `${Math.round(conf * 100)}%` : "N/A"}
              </span>
              <span className="small">
                {w.page_number !== undefined ? `Page ${w.page_number}` : "General"}
                {" — "}
                {w.message}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
