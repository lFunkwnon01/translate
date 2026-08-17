import { TranslationJob, JobStatus, LogEvent, DocumentPage } from '../types';
import { SAMPLE_PAGES_MANUAL_TECNICO } from '../data/mockData';

export interface RunOptions {
  scenario?: 'normal' | 'ocr_warning' | 'recoverable_error' | 'permanent_error';
  speedMs?: number;
  onUpdate: (job: TranslationJob) => void;
  onComplete?: (job: TranslationJob) => void;
}

export function createNewJob(
  filename: string,
  fileSizeBytes: number,
  sourceLang: string,
  targetLang: string,
  options?: { preserveLayout?: boolean; glossaryName?: string; ocrEnabled?: boolean }
): TranslationJob {
  const id = `job_${Math.floor(1000 + Math.random() * 9000)}`;
  const fileSizeMb = (fileSizeBytes / (1024 * 1024)).toFixed(1) + ' MB';
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    id,
    filename,
    fileSize: fileSizeMb,
    fileSizeBytes,
    sourceLang: sourceLang === 'auto' ? 'EN' : sourceLang.toUpperCase(),
    targetLang: targetLang.toUpperCase(),
    status: 'queued',
    progress: 5,
    statusMessage: 'Validating and queuing document...',
    estimatedTimeRemaining: '~2 mins',
    createdAt: `Today, ${timeStr}`,
    totalPages: Math.max(4, Math.ceil(fileSizeBytes / 100000)),
    preserveLayout: options?.preserveLayout ?? true,
    ocrEnabled: options?.ocrEnabled ?? true,
    glossaryName: options?.glossaryName || 'Engineering Glossary V2',
    eventLogs: [
      {
        id: '1',
        timestamp: now.toLocaleTimeString(),
        message: `Document '${filename}' validated and accepted into processing queue.`,
        type: 'info',
      }
    ],
    warnings: [],
    qualityMetrics: {
      ocrConfidence: 98,
      glossaryTermsCount: 15,
      grammarStatus: 'Passed',
      layoutFidelity: 99.2,
      detectedLanguage: sourceLang === 'auto' ? 'English (Detected)' : sourceLang,
      translatedLanguage: targetLang,
      estimatedCost: `$${(0.01 + fileSizeBytes / 100000000).toFixed(3)}`,
      modelUsed: 'OCI Generative AI / Translation Model',
      totalTokens: Math.floor(fileSizeBytes / 300) + 1200,
      untranslatedFragments: 0,
    },
    pages: SAMPLE_PAGES_MANUAL_TECNICO.map(p => ({ ...p })),
  };
}

export class JobSimulator {
  private timer: number | null = null;
  private currentJob: TranslationJob;
  private isCancelled: boolean = false;
  private options: RunOptions;

  constructor(initialJob: TranslationJob, options: RunOptions) {
    this.currentJob = JSON.parse(JSON.stringify(initialJob));
    this.options = options;
  }

  public start() {
    this.isCancelled = false;
    let step = 0;
    const scenario = this.options.scenario || 'normal';

    const getTimestamp = () => new Date().toLocaleTimeString();

    const addLog = (msg: string, type: LogEvent['type'] = 'info', page?: number) => {
      this.currentJob.eventLogs.push({
        id: String(Date.now() + Math.random()),
        timestamp: getTimestamp(),
        message: msg,
        type,
        pageNumber: page,
      });
    };

    const steps: Array<() => void> = [
      // Step 1: Queued -> Extracting (15%)
      () => {
        this.currentJob.status = 'extracting';
        this.currentJob.progress = 18;
        this.currentJob.statusMessage = 'Extracting typography, vectors & text layout...';
        this.currentJob.estimatedTimeRemaining = '~1m 45s';
        addLog(`Document structure extracted successfully (${this.currentJob.totalPages} pages).`, 'info');
      },

      // Step 2: OCR check (30%)
      () => {
        if (scenario === 'ocr_warning') {
          this.currentJob.status = 'ocr_processing';
          this.currentJob.progress = 32;
          this.currentJob.statusMessage = 'Executing high-resolution neural OCR on scanned pages...';
          this.currentJob.estimatedTimeRemaining = '~1m 30s';
          addLog('Detected 2 scanned image pages requiring OCR extraction.', 'warning', 4);
          addLog('OCR engine executed: Page 4 scanned note confidence 74%.', 'warning', 4);
          
          if (!this.currentJob.warnings.some(w => w.id === 'w_ocr')) {
            this.currentJob.warnings.push({
              id: 'w_ocr',
              type: 'ocr_low_confidence',
              title: 'Low Confidence OCR',
              description: 'Pages 4 & 12 required approximation due to low-contrast handwritten segments.',
              pages: [4, 12],
              severity: 'medium'
            });
          }
        } else {
          this.currentJob.progress = 30;
          this.currentJob.statusMessage = 'Vector font extraction and layout parsing completed.';
          addLog('All pages verified with high native digital text clarity.', 'info');
        }
      },

      // Step 3: Analyzing & Terminology (45%)
      () => {
        this.currentJob.status = 'analyzing';
        this.currentJob.progress = 45;
        this.currentJob.statusMessage = 'Analyzing context & terminology...';
        this.currentJob.estimatedTimeRemaining = '~1m 15s';
        addLog('Analyzing terminology against custom domain glossary...', 'info');
        addLog('15 domain terms recognized and locked for consistency.', 'success');
      },

      // Step 4: Translating with potential recoverable error (65%)
      () => {
        if (scenario === 'recoverable_error' && step === 3) {
          this.currentJob.progress = 55;
          this.currentJob.statusMessage = 'OCI Gateway 429 RateLimit encountered — Exponential backoff retry...';
          addLog('Llamada OCI rate limit: iniciada política de backoff y reintento en 2s.', 'warning');
          return;
        }

        if (scenario === 'permanent_error') {
          this.currentJob.status = 'failed';
          this.currentJob.progress = 50;
          this.currentJob.statusMessage = 'Failed: Corrupt encrypted trailer in document stream.';
          this.currentJob.errorMessage = 'Document decryption failed: Missing valid security descriptor.';
          addLog('FATAL: Credencial inválida o archivo corrupto detectado.', 'error');
          this.options.onUpdate({ ...this.currentJob });
          this.stop();
          return;
        }

        this.currentJob.status = 'translating';
        this.currentJob.progress = 68;
        this.currentJob.statusMessage = 'Translating document paragraphs & technical tables...';
        this.currentJob.estimatedTimeRemaining = '~45s';
        addLog('Neural multilingual translation stream active: 8/8 batch blocks completed.', 'info');
      },

      // Step 5: Reviewing & Rebuilding layout (85%)
      () => {
        this.currentJob.status = 'rebuilding';
        this.currentJob.progress = 88;
        this.currentJob.statusMessage = 'Rebuilding pixel-perfect PDF geometry & table alignments...';
        this.currentJob.estimatedTimeRemaining = '~20s';
        addLog('Rebuilding PDF layout with original bounding boxes and styles.', 'info');
      },

      // Step 6: Validation & Completion (100%)
      () => {
        this.currentJob.status = 'completed';
        this.currentJob.progress = 100;
        this.currentJob.statusMessage = 'Translation Complete! Your document is ready for review and download.';
        this.currentJob.estimatedTimeRemaining = '0s';
        this.currentJob.completedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.currentJob.duration = '1m 35s';
        addLog('Quality validation passed. Grammar check: 100% compliant.', 'success');
        addLog('Document ready for review & download.', 'success');
      }
    ];

    const intervalTime = this.options.speedMs || 1400;

    this.timer = window.setInterval(() => {
      if (this.isCancelled) {
        this.stop();
        return;
      }

      if (step < steps.length) {
        steps[step]();
        this.options.onUpdate({ ...this.currentJob });
        step++;
      } else {
        this.stop();
        if (this.options.onComplete) {
          this.options.onComplete({ ...this.currentJob });
        }
      }
    }, intervalTime);
  }

  public cancel(): TranslationJob {
    this.isCancelled = true;
    this.stop();
    this.currentJob.status = 'cancelled';
    this.currentJob.statusMessage = 'Cancelled by user at fragment boundary.';
    this.currentJob.eventLogs.push({
      id: String(Date.now()),
      timestamp: new Date().toLocaleTimeString(),
      message: 'Usuario pulsó cancelar: worker terminó el fragmento actual y liberó temporales.',
      type: 'warning'
    });
    this.options.onUpdate({ ...this.currentJob });
    return this.currentJob;
  }

  public stop() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
