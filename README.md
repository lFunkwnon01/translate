# DocTranslate AI

Frontend prototype for the PDF contextual translation workflow.

This version is intentionally decoupled from the backend and uses mock data to validate the complete user experience:

- PDF upload and validation.
- Translation configuration.
- Processing progress.
- OCR warnings.
- Recoverable and permanent errors.
- Preview and download states.
- History and settings screens.

## Current stack

- React 19.
- Vite.
- TypeScript.
- Tailwind CSS.
- Lucide icons.
- Motion animations.
- jsPDF for the local preview/download mock.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run lint
npm run build
```

## Architecture status

This is the visual prototype extracted from the initial mockup. The current repository is a Vite/React prototype. The project documentation defines Next.js + App Router as the target frontend architecture for the next migration step.

The mock service in `src/services/jobService.ts` simulates the backend workflow. It does not call OCI or any external AI provider.

## Backend integration target

The mock service will later be replaced by FastAPI calls for:

```text
POST   /api/documents/upload
GET    /api/jobs/{job_id}
GET    /api/jobs/{job_id}/stream
GET    /api/jobs/{job_id}/preview
GET    /api/jobs/{job_id}/download
DELETE /api/jobs/{job_id}
GET    /health
```

No API keys, OCI credentials or PDF documents belong in this repository.
