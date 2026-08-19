"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { JobEvent, JobResource } from "../lib/api";
import { cancelJob, getArtifact, getJob, uploadDocument } from "../lib/api";
import type { JobWarning } from "../lib/types";
import { demoJob, jobs } from "../lib/mockData";
import { OcrWarning } from "./components/OcrWarning";

function Nav() {
  return (
    <nav className="nav">
      <a className="brand" href="/">doc<span>translate</span></a>
      <div className="navlinks">
        <a href="/dashboard">Dashboard</a>
        <a href="/translate">Translate</a>
        <a href="/usage">Usage</a>
        <a href="/plan">Plan</a>
        <a href="/settings">Settings</a>
      </div>
      <a className="btn secondary" href="/login">Sign in</a>
    </nav>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <Nav />
      {children}
      <footer className="footer">DocTranslate AI · Local mock workspace · No external providers connected</footer>
    </div>
  );
}

const statusLabel: Record<JobResource["status"], string> = {
  queued: "Queued",
  extracting: "Extracting",
  ocr_processing: "OCR processing",
  translating: "Translating",
  rebuilding: "Rebuilding PDF",
  validating: "Validating PDF",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
  cancellation_requested: "Cancelling",
};
const terminalStatuses: JobResource["status"][] = ["completed", "failed", "cancelled"];

const pipelineStages = [
  { label: "Extract", threshold: 15 },
  { label: "OCR", threshold: 30 },
  { label: "Translate", threshold: 55 },
  { label: "Rebuild", threshold: 78 },
  { label: "Validate", threshold: 92 },
];

function JobRow({ job }: { job: JobResource }) {
  return (
    <a className="panel row" href={`/jobs/${job.job_id}`}>
      <div>
        <strong>{job.job_id === demoJob.job_id ? "technical-manual.pdf" : job.job_id.includes("ocr") ? "scanned-report.pdf" : "product-spec.pdf"}</strong>
        <div className="muted small">
          {job.source_language_code.toUpperCase()} → {job.target_language_code.toUpperCase()} · {new Date(job.requested_at).toLocaleDateString()}
        </div>
      </div>
      <span className="tag">{statusLabel[job.status]}</span>
    </a>
  );
}

export function Home() {
  return (
    <Layout>
      <main className="container hero">
        <section>
          <div className="eyebrow">Context-aware PDF translation</div>
          <h1>Make every page read like it was written here.</h1>
          <p className="lead">
            Translate technical documents with layout preservation, transparent progress, and a reviewable preview. A safe local mock is ready for the full workflow.
          </p>
          <div className="actions">
            <a className="btn" href="/translate">Start translating</a>
            <a className="btn secondary" href="/dashboard">View workspace</a>
          </div>
        </section>
        <aside className="hero-card">
          <strong>98.6%</strong>
          <p>Preview quality score<br />Terminology locked · 15 terms<br />OCR warnings surfaced, never hidden</p>
        </aside>
      </main>
    </Layout>
  );
}

export function Auth({ register = false }: { register?: boolean }) {
  const router = useRouter();
  const submit = (e: FormEvent) => { e.preventDefault(); router.push("/dashboard"); };
  return (
    <Layout>
      <main className="container">
        <div className="panel auth-panel">
          <div className="eyebrow">DocTranslate workspace</div>
          <h2>{register ? "Create your workspace" : "Welcome back"}</h2>
          <p className="muted">{register ? "Start with a private local translation workspace." : "Continue your document translation workflow."}</p>
          <form className="stack" onSubmit={submit}>
            <label>Email<input className="field" type="email" required placeholder="you@company.com" /></label>
            <label>Password<input className="field" type="password" required minLength={6} placeholder="password" /></label>
            <button className="btn" type="submit">{register ? "Create account" : "Sign in"}</button>
          </form>
          <p className="small muted">Mock auth only. No credentials are sent anywhere.</p>
          <a className="small" href={register ? "/login" : "/register"}>{register ? "Already have an account? Sign in" : "Need an account? Register"}</a>
        </div>
      </main>
    </Layout>
  );
}

export function Dashboard() {
  const recentWarnings: JobWarning[] = [
    { code: "OCR_LOW_CONFIDENCE", page_number: 2, message: "OCR confidence below threshold for technical-manual.pdf" },
    { code: "OCR_LOW_CONFIDENCE", page_number: 5, message: "OCR confidence below threshold for scanned-report.pdf" },
  ];
  return (
    <Layout>
      <main className="container">
        <div className="row">
          <div>
            <div className="eyebrow">Workspace / overview</div>
            <h2>Your translation desk</h2>
            <p className="muted">A calm place to move from upload to review.</p>
          </div>
          <a className="btn" href="/translate">+ New translation</a>
        </div>
        <div className="grid" style={{ margin: "28px 0" }}>
          <div className="stat"><strong>12</strong><span className="muted">Documents this month</span></div>
          <div className="stat"><strong>84%</strong><span className="muted">Average quality score</span></div>
          <div className="stat"><strong>4.2 MB</strong><span className="muted">Storage used</span></div>
        </div>
        <div className="grid two" style={{ margin: "0 0 28px" }}>
          <div className="stat"><strong>3</strong><span className="muted">Pages processed (mock)</span></div>
          <div className="stat"><strong>71%</strong><span className="muted">Avg OCR confidence</span></div>
        </div>
        <section className="stack">
          <div className="row"><h3>Recent warnings</h3></div>
          <OcrWarning warnings={recentWarnings} pageConfidences={new Map([[2, 0.71], [5, 0.65]])} />
        </section>
        <section className="stack" style={{ marginTop: 24 }}>
          <div className="row"><h3>Recent jobs</h3><a className="small" href="/usage">View usage →</a></div>
          {jobs.map((job) => <JobRow key={job.job_id} job={job} />)}
        </section>
      </main>
    </Layout>
  );
}

export function Translate() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState("auto");
  const [target, setTarget] = useState("es");
  const [ocr, setOcr] = useState(true);
  const [preserveLayout, setPreserveLayout] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const estimatedTime = file ? Math.max(5, Math.ceil(file.size / (1024 * 1024) * 8)) : 0;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) { setError("Choose a PDF to continue."); return; }
    setBusy(true);
    setError("");
    try {
      const result = await uploadDocument(file, source, target);
      router.push(`/jobs/${result.job.job_id}`);
    } catch (err) {
      setError(`Upload failed: ${String(err).replace("Error: ", "")}. Try a PDF under 25 MiB.`);
      setBusy(false);
    }
  };

  return (
    <Layout>
      <main className="container">
        <div className="eyebrow">New translation</div>
        <h2>Bring a document into focus.</h2>
        <p className="lead">
          Upload a PDF and choose how the mock worker should process it. The flow mirrors the API contract without making a network request.
        </p>
        <form className="panel stack upload-form" onSubmit={submit}>
          <label className="dropzone">
            <strong>{file ? file.name : "Drop a PDF here"}</strong>
            <span className="muted small">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MiB selected` : "PDF only · 25 MiB maximum"}</span>
            <input hidden type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <span className="btn secondary choose-file">Choose file</span>
          </label>
          <div className="grid two">
            <label>Source language<select className="field" value={source} onChange={(e) => setSource(e.target.value)}><option value="auto">Auto-detect</option><option value="en">English</option><option value="de">German</option></select></label>
            <label>Target language<select className="field" value={target} onChange={(e) => setTarget(e.target.value)}><option value="es">Spanish</option><option value="en">English</option><option value="fr">French</option></select></label>
          </div>
          <div className="grid two">
            <label className="toggle-row"><input type="checkbox" checked={ocr} onChange={(e) => setOcr(e.target.checked)} /> Enable OCR for scanned pages</label>
            <label className="toggle-row"><input type="checkbox" checked={preserveLayout} onChange={(e) => setPreserveLayout(e.target.checked)} /> Preserve layout and tables</label>
          </div>
          {estimatedTime > 0 && <div className="muted small">Estimated processing time: ~{estimatedTime}s</div>}
          {error && <div className="error" role="alert">{error}</div>}
          <button className="btn" disabled={busy || !file}>{busy ? "Validating upload..." : "Upload and translate"}</button>
        </form>
      </main>
    </Layout>
  );
}

export function JobDetail({ id }: { id: string }) {
  const [job, setJob] = useState<JobResource | null>(null);
  const [error, setError] = useState(false);
  const [previewState, setPreviewState] = useState<"idle" | "loading" | "error">("idle");
  const [downloadState, setDownloadState] = useState<"idle" | "loading" | "error">("idle");
  const [events, setEvents] = useState<JobEvent[]>([]);
  const [warnings, setWarnings] = useState<JobWarning[]>([]);
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let active = true;
    getJob(id).then((v) => active && setJob(v)).catch(() => active && setError(true));
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    if (!job || terminalStatuses.includes(job.status)) return;
    let active = true;
    const poll = async () => {
      try {
        const next = await getJob(job.job_id);
        if (active) setJob(next);
      } catch { if (active) setError(true); }
    };
    const timer = window.setInterval(poll, 1500);
    cancelRef.current = () => window.clearInterval(timer);
    return () => { active = false; window.clearInterval(timer); };
  }, [job?.job_id]);

  useEffect(() => {
    if (!job) return;
    let active = true;
    setWarnings([]);
    return () => { active = false; };
  }, [job?.job_id]);

  if (error) return <Layout><main className="container"><div className="error" role="alert">Job not found. <a href="/dashboard">Return to dashboard.</a></div></main></Layout>;
  if (!job) return <Layout><main className="container"><div className="panel loading" aria-live="polite">Loading job...</div></main></Layout>;

  const isDone = job.status === "completed";

  const showPreview = async () => {
    setPreviewState("loading");
    try {
      const blob = await getArtifact(job.job_id, "preview");
      window.open(URL.createObjectURL(blob), "_blank", "noopener,noreferrer");
      setPreviewState("idle");
    } catch { setPreviewState("error"); }
  };

  const download = async () => {
    setDownloadState("loading");
    try {
      const blob = await getArtifact(job.job_id, "download");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${job.job_id}-translated.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setDownloadState("idle");
    } catch { setDownloadState("error"); }
  };

  const isExtracting = job.current_step === "extracting" || job.current_step === "ocr_processing";
  const mockTotalPages = 8;
  const mockCurrentPage = isExtracting ? Math.max(1, Math.min(mockTotalPages, Math.floor((job.progress_percent / 100) * mockTotalPages))) : null;

  return (
    <Layout>
      <main className="container">
        <a className="small muted" href="/dashboard">← Dashboard</a>
        <div className="row job-heading">
          <div>
            <div className="eyebrow">Job {job.job_id}</div>
            <h2>{isDone ? "Ready for review" : "Processing document"}</h2>
          </div>
          <span className="tag">{statusLabel[job.status]}</span>
        </div>

        <OcrWarning warnings={warnings} />

        <section className="panel stack">
          <div className="row">
            <strong>Extraction and translation pipeline</strong>
            <span className="muted">{job.current_step?.replace(/_/g, " ")}</span>
          </div>
          <div className="bar"><i style={{ width: `${job.progress_percent}%` }} /></div>
          <div className="row small">
            <span>{job.progress_percent}% complete</span>
            <span className="muted">{job.source_language_code.toUpperCase()} → {job.target_language_code.toUpperCase()}</span>
          </div>
          {mockCurrentPage && (
            <div className="muted small">
              Processing page {mockCurrentPage} of {mockTotalPages}
            </div>
          )}
          <div className="pipeline">
            {pipelineStages.map((stage) => (
              <span key={stage.label} className={job.progress_percent >= stage.threshold ? "active" : ""}>{stage.label}</span>
            ))}
          </div>
          {job.status === "cancelled" && <div className="warning">This job was cancelled. Start a new translation to try again.</div>}
          {job.status === "failed" && <div className="error">Translation failed. Please review the document and try again.</div>}
          <div className="actions">
            <button className="btn secondary" onClick={async () => { await cancelJob(job.job_id); setJob(await getJob(job.job_id)); }} disabled={isDone || terminalStatuses.includes(job.status)}>Cancel job</button>
            <button className="btn secondary" onClick={showPreview} disabled={!isDone || previewState === "loading"}>{previewState === "loading" ? "Loading preview..." : "Open document preview"}</button>
            <button className="btn" onClick={download} disabled={!isDone || downloadState === "loading"}>{downloadState === "loading" ? "Preparing download..." : "Download PDF"}</button>
          </div>
          {previewState === "error" && <div className="error" role="alert">Preview unavailable. Try again.</div>}
          {downloadState === "error" && <div className="error" role="alert">Download unavailable. Try again.</div>}
        </section>

        <section className="grid job-columns">
          <div className="panel stack">
            <div className="row"><h3>Processing events</h3><span className="muted small">{events.length} updates</span></div>
            {events.length === 0 ? <p className="muted small">Waiting for worker events...</p> : events.map((event) => (
              <div className="event" key={event.event_id}>
                <i className={`event-dot ${event.type}`} />
                <span>{event.message}<small className="muted">{new Date(event.timestamp).toLocaleTimeString()}</small></span>
              </div>
            ))}
          </div>
          <div className="panel stack">
            <h3>Review checklist</h3>
            <p className="muted small">OCR warnings and reconstruction issues remain visible in the preview.</p>
            <div className="check-row">Extraction result <span>{isDone ? "Ready" : "Pending"}</span></div>
            <div className="check-row">Tables preserved <span>{isDone ? "Review" : "Pending"}</span></div>
            <div className="check-row">Download artifact <span>{isDone ? "Enabled" : "Disabled"}</span></div>
            <div className="check-row">Warnings resolved <span>{warnings.length > 0 ? `${warnings.length} active` : "None"}</span></div>
          </div>
        </section>

      </main>
    </Layout>
  );
}

export function Simple({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <Layout>
      <main className="container">
        <div className="eyebrow">DocTranslate</div>
        <h2>{title}</h2>
        <p className="lead">{body}</p>
        {children}
      </main>
    </Layout>
  );
}
