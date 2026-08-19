# Ola 4 Dependencies

Agent: D (Integration)
Base: `a1a4730` (`main`)

## Python Dependencies

### New Runtime Dependencies (Agent A)

| Package | Purpose | Version Constraint | Status |
|---------|---------|-------------------|--------|
| PyMuPDF | PDF parsing, page/block extraction, text extraction | `>=1.24,<2.0` | NOT INSTALLED |
| pdfplumber | Table extraction, layout-aware parsing | `>=0.11,<1.0` | NOT INSTALLED |

**Note:** These must be added to `[project.dependencies]` in `backend/pyproject.toml` by Agent A.

### New Dev Dependencies (Agent C)

| Package | Purpose | Version Constraint | Status |
|---------|---------|-------------------|--------|
| fpdf2 | Synthetic PDF fixture generation for tests | `>=2.8,<3.0` | INSTALLED (2.8.7) |

**Note:** These must be added to `[project.optional-dependencies.dev` in `backend/pyproject.toml` by Agent C.

### New Optional Dependencies (Agent B)

| Package | Purpose | Version Constraint | Status |
|---------|---------|-------------------|--------|
| ocrmypdf | OCR processing of scanned PDFs | `>=16.0,<17.0` | NOT INSTALLED |

**Note:** This must be added as an optional dependency group (e.g., `[project.optional-dependencies.ocr]`) by Agent B.

## System-Level Dependencies

| Binary | Purpose | Required By | Status |
|--------|---------|-------------|--------|
| Tesseract | OCR engine | ocrmypdf | NOT AVAILABLE |
| Ghostscript | PDF post-processing (ocrmypdf dependency) | ocrmypdf | NOT CHECKED |
| tessdata | Language data for Tesseract | Tesseract | NOT CHECKED |

## Installation Commands

```bash
# Runtime (required for core functionality)
pip install PyMuPDF pdfplumber

# Optional OCR (only if OCR pipeline is needed)
pip install ocrmypdf
# Also requires: apt-get install tesseract-ocr ghostscript

# Dev/Test (for fixture generation)
pip install fpdf2
```

## CI Considerations

- **Backend CI** (`backend.yml`): Currently installs `pip install -e '.[dev]'`. After Agent A adds PyMuPDF/pdfplumber to main dependencies, CI will auto-install them. No CI config change needed for runtime deps.
- **OCR in CI**: If OCR tests are added, a separate CI job or matrix entry is needed to install tesseract-ocr and ocrmypdf. Current CI does NOT install system-level OCR binaries.
- **fpdf2 in CI**: Agent C must add fpdf2 to `[project.optional-dependencies.dev]` so CI picks it up via `pip install -e '.[dev]'`.

## Dependency Matrix

```
Agent A (Backend)
├── PyMuPDF (runtime, required)
└── pdfplumber (runtime, required)

Agent B (Frontend + OCR)
├── Depends on: Agent A's port interfaces
└── ocrmypdf (optional runtime)
    └── Tesseract (system binary)
    └── Ghostscript (system binary)

Agent C (Tests)
├── fpdf2 (dev, for fixture generation)
├── Depends on: Agent A's extraction modules
└── Depends on: Agent B's OCR interfaces (for OCR tests)

Agent D (Integration)
└── This document (no code changes)
```
