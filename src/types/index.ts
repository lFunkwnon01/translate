export type JobStatus = 
  | 'queued'
  | 'extracting'
  | 'ocr_processing'
  | 'analyzing'
  | 'translating'
  | 'reviewing'
  | 'rebuilding'
  | 'validating'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface LogEvent {
  id: string;
  timestamp: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  pageNumber?: number;
  fragmentId?: string;
}

export interface WarningItem {
  id: string;
  type: 'ocr_low_confidence' | 'table_structure' | 'untranslated_fragment' | 'font_substitution';
  title: string;
  description: string;
  pages: number[];
  severity: 'low' | 'medium' | 'high';
}

export interface QualityMetrics {
  ocrConfidence: number; // 0-100
  glossaryTermsCount: number;
  grammarStatus: 'Passed' | 'Warnings' | 'Failed';
  layoutFidelity: number; // e.g. 99.2%
  detectedLanguage: string;
  translatedLanguage: string;
  estimatedCost: string;
  modelUsed: string;
  totalTokens: number;
  untranslatedFragments: number;
}

export interface DocumentPage {
  pageNumber: number;
  originalText: string;
  translatedText: string;
  hasOcrWarning?: boolean;
  ocrConfidence?: number;
  tables?: Array<{
    headers: string[];
    rows: string[][];
  }>;
  callouts?: string[];
  glossaryTerms?: Array<{ term: string; translation: string; definition: string }>;
}

export interface TranslationJob {
  id: string;
  filename: string;
  fileSize: string;
  fileSizeBytes: number;
  sourceLang: string;
  targetLang: string;
  status: JobStatus;
  progress: number; // 0-100
  statusMessage: string;
  estimatedTimeRemaining: string;
  createdAt: string;
  completedAt?: string;
  duration?: string;
  eventLogs: LogEvent[];
  warnings: WarningItem[];
  qualityMetrics: QualityMetrics;
  pages: DocumentPage[];
  totalPages: number;
  glossaryName?: string;
  preserveLayout: boolean;
  ocrEnabled: boolean;
  errorMessage?: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  flag?: string;
}

export type ActiveTab = 'home' | 'login' | 'register' | 'dashboard' | 'translate' | 'progress' | 'preview' | 'history' | 'usage' | 'plan' | 'settings';

export interface UserSettings {
  interfaceLanguage: string;
  appearance: 'light' | 'dark' | 'system';
  defaultTargetLanguage: string;
  autoOcr: boolean;
  preserveLayout: boolean;
  defaultGlossary: string;
  confidenceThreshold: number;
  enableNotifications: boolean;
}
