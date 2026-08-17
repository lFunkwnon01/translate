import React, { useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Loader2, 
  Circle, 
  Terminal, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Zap,
  Play,
  Check
} from 'lucide-react';
import { TranslationJob, JobStatus } from '../../types';

interface ProgressScreenProps {
  job: TranslationJob;
  onCancelJob: () => void;
  onFastForward: () => void;
  onTriggerOcrWarning: () => void;
  onTriggerBackoffRetry: () => void;
  onProceedToReview: () => void;
}

const PIPELINE_STAGES = [
  { id: 'queued', label: 'Queued', desc: 'Validated & stored' },
  { id: 'extracting', label: 'Extracting', desc: 'Layout & fonts' },
  { id: 'analyzing', label: 'Analyzing', desc: 'Context & glossary' },
  { id: 'translating', label: 'Translating', desc: 'Multimodal AI' },
  { id: 'rebuilding', label: 'Rebuilding', desc: 'Pixel geometry' },
  { id: 'completed', label: 'Completed', desc: 'Ready for review' },
];

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  job,
  onCancelJob,
  onFastForward,
  onTriggerOcrWarning,
  onTriggerBackoffRetry,
  onProceedToReview,
}) => {
  // Determine which step is currently active
  const getStageStatus = (stageId: string): 'completed' | 'active' | 'pending' | 'error' => {
    if (job.status === 'failed') return 'error';
    if (job.status === 'cancelled') return 'pending';
    if (job.status === 'completed') return 'completed';

    const stageOrder = ['queued', 'extracting', 'analyzing', 'translating', 'rebuilding', 'completed'];
    const currentIdx = stageOrder.indexOf(job.status === 'ocr_processing' ? 'extracting' : job.status);
    const targetIdx = stageOrder.indexOf(stageId);

    if (targetIdx < currentIdx) return 'completed';
    if (targetIdx === currentIdx) return 'active';
    return 'pending';
  };

  // SVG Circular Gauge calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (job.progress / 100) * circumference;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Translating Document
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Job ID: <span className="font-semibold text-slate-700">{job.id}</span> • <span className="text-slate-700">{job.filename}</span> ({job.sourceLang} → {job.targetLang})
          </p>
        </div>

        {job.status !== 'completed' && job.status !== 'failed' && job.status !== 'cancelled' ? (
          <button
            id="cancel-translation-btn"
            onClick={onCancelJob}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Cancel Translation</span>
          </button>
        ) : job.status === 'completed' ? (
          <button
            id="proceed-preview-btn"
            onClick={onProceedToReview}
            className="inline-flex items-center space-x-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
          >
            <span>Review & Download PDF</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* 3 Column Layout (Matching Image 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Pipeline Status Stepper */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-6 flex items-center justify-between">
              <span>Pipeline Status</span>
              <span className="text-[11px] font-normal text-slate-400">Step {job.status === 'completed' ? 6 : job.status === 'rebuilding' ? 5 : job.status === 'translating' ? 4 : job.status === 'analyzing' ? 3 : 2} of 6</span>
            </h2>

            <div className="space-y-6 relative pl-2">
              {PIPELINE_STAGES.map((stage, idx) => {
                const status = getStageStatus(stage.id);

                return (
                  <div key={stage.id} className="flex items-start space-x-3.5 relative group">
                    {/* Vertical connector line */}
                    {idx < PIPELINE_STAGES.length - 1 && (
                      <div 
                        className={`absolute left-3.5 top-7 bottom-[-24px] w-0.5 ${
                          status === 'completed' ? 'bg-blue-600' : 'bg-slate-200'
                        }`} 
                      />
                    )}

                    {/* Step Icon */}
                    <div className="relative z-10 shrink-0">
                      {status === 'completed' && (
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        </div>
                      )}

                      {status === 'active' && (
                        <div className="w-7 h-7 rounded-full bg-blue-50 border-2 border-blue-600 text-blue-600 flex items-center justify-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
                        </div>
                      )}

                      {status === 'pending' && (
                        <div className="w-7 h-7 rounded-full bg-white border-2 border-slate-200 text-slate-300 flex items-center justify-center">
                          <Circle className="w-2.5 h-2.5 text-slate-300" />
                        </div>
                      )}

                      {status === 'error' && (
                        <div className="w-7 h-7 rounded-full bg-rose-100 border border-rose-400 text-rose-600 flex items-center justify-center">
                          <X className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Step Details */}
                    <div>
                      <h4 className={`text-xs font-bold leading-tight ${
                        status === 'active' ? 'text-blue-600' : status === 'completed' ? 'text-slate-800' : 'text-slate-400'
                      }`}>
                        {stage.label}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {stage.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
            Engine: <span className="font-semibold text-slate-700">{job.qualityMetrics.modelUsed}</span>
          </div>
        </div>

        {/* Column 2: Circular Progress Meter */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col items-center justify-center text-center">
          
          {/* Circular SVG */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Foreground progress circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className={`transition-all duration-700 ease-out ${
                  job.status === 'completed' 
                    ? 'stroke-emerald-500' 
                    : job.status === 'failed'
                    ? 'stroke-rose-500'
                    : 'stroke-blue-600'
                }`}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Centered Percentage text */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {job.progress}%
              </span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                {job.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Status Message Text */}
          <h3 className="text-sm font-bold text-slate-900 mt-6 max-w-xs">
            {job.statusMessage}
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            Estimated time remaining:{' '}
            <span className="font-semibold text-slate-700">{job.estimatedTimeRemaining}</span>
          </p>

          {job.status === 'completed' && (
            <button
              onClick={onProceedToReview}
              className="mt-6 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center space-x-2"
            >
              <span>Inspect Translated PDF</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Column 3: Event Log Terminal */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-900">Event Log</h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
              Live SSE Stream
            </span>
          </div>

          {/* Log Window */}
          <div className="mt-4 flex-1 bg-slate-900 text-slate-200 rounded-lg p-3.5 font-mono text-[11px] space-y-2 overflow-y-auto max-h-[300px] border border-slate-800">
            {job.eventLogs.map((log) => (
              <div key={log.id} className="leading-relaxed">
                <span className="text-slate-500 select-none">[{log.timestamp}]</span>{' '}
                <span className={
                  log.type === 'error'
                    ? 'text-rose-400 font-semibold'
                    : log.type === 'warning'
                    ? 'text-amber-300 font-semibold'
                    : log.type === 'success'
                    ? 'text-emerald-300 font-semibold'
                    : 'text-slate-200'
                }>
                  {log.message}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Total Events: {job.eventLogs.length}</span>
            <span>Glossary: {job.glossaryName}</span>
          </div>
        </div>

      </div>

      {/* Interactive Simulation & Test Control Bar (Allows test-driving all user flows from prompt) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Interactive Pipeline Simulator Controls</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Test specific pipeline states described in the technical specifications.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onTriggerOcrWarning}
              className="px-2.5 py-1.5 text-xs font-medium bg-white text-amber-700 border border-amber-300 hover:bg-amber-50 rounded-md transition-colors"
            >
              Simulate OCR Warning
            </button>

            <button
              onClick={onTriggerBackoffRetry}
              className="px-2.5 py-1.5 text-xs font-medium bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-50 rounded-md transition-colors"
            >
              Simulate Network Backoff
            </button>

            <button
              onClick={onFastForward}
              className="px-2.5 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              ⚡ Fast-Forward to 100%
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
