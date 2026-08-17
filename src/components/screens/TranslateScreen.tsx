import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Languages, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  HardDrive, 
  Sparkles, 
  ArrowRight,
  Info,
  X,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { TranslationJob, LanguageOption } from '../../types';
import { LANGUAGES } from '../../data/mockData';

interface TranslateScreenProps {
  recentJobs: TranslationJob[];
  onStartJob: (file: { name: string; size: number }, sourceLang: string, targetLang: string, scenario?: 'normal' | 'ocr_warning' | 'recoverable_error' | 'permanent_error') => void;
  onViewJob: (job: TranslationJob) => void;
  onViewAllHistory: () => void;
}

export const TranslateScreen: React.FC<TranslateScreenProps> = ({
  recentJobs,
  onStartJob,
  onViewJob,
  onViewAllHistory,
}) => {
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number } | null>({
    name: 'Manual_Tecnico.pdf',
    size: 4404019, // ~4.2 MB
  });
  const [sourceLang, setSourceLang] = useState<string>('auto');
  const [targetLang, setTargetLang] = useState<string>('es');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [scenarioMode, setScenarioMode] = useState<'normal' | 'ocr_warning' | 'recoverable_error' | 'permanent_error'>('normal');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile({
        name: file.name,
        size: file.size,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile({
        name: file.name,
        size: file.size,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !targetLang) return;
    onStartJob(selectedFile, sourceLang, targetLang, scenarioMode);
  };

  const handleSelectPreset = (name: string, size: number, src: string, tgt: string, scenario: typeof scenarioMode = 'normal') => {
    setSelectedFile({ name, size });
    setSourceLang(src);
    setTargetLang(tgt);
    setScenarioMode(scenario);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Title & Subtitle */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Translate PDFs with High Precision
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Enterprise-grade document translation powered by advanced AI. Fast, secure, and formatting-preserved.
        </p>
      </div>

      {/* Main Grid: 2/3 Left upload + 1/3 Right Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Upload Box */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer relative bg-white ${
                isDragging 
                  ? 'border-blue-600 bg-blue-50/50' 
                  : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/60'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx,.pptx,.txt"
                className="hidden" 
              />

              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-14 h-14 rounded-full bg-[#eef2ff] text-[#3538cd] flex items-center justify-center mb-4">
                  <UploadCloud className="w-7 h-7" />
                </div>

                <h3 className="text-base font-bold text-slate-800">
                  Drag & Drop your document here
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  or click to browse from your computer
                </p>

                <div className="mt-4 flex items-center space-x-2">
                  <span className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 text-slate-600 rounded-md">.pdf</span>
                  <span className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 text-slate-600 rounded-md">.docx</span>
                  <span className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 text-slate-600 rounded-md">.pptx</span>
                </div>
              </div>

              {/* Selected File Badge inside dropzone if present */}
              {selectedFile && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 inline-flex items-center space-x-3 bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg text-xs"
                >
                  <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-semibold text-blue-900 truncate max-w-[220px]">
                    {selectedFile.name}
                  </span>
                  <span className="text-blue-600 font-mono">
                    ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-blue-400 hover:text-blue-800 p-0.5 rounded-full"
                    title="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Quick Test Presets (Instant 1-Click Scenarios) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                Fast Test Scenarios (from Documentation):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectPreset('Manual_Tecnico.pdf', 4404019, 'auto', 'es', 'normal')}
                  className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors ${
                    selectedFile?.name === 'Manual_Tecnico.pdf' && scenarioMode === 'normal'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  📄 Manual_Tecnico.pdf (EN → ES)
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset('Scanned_Invoice_FR.pdf', 5872025, 'fr', 'en', 'ocr_warning')}
                  className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors ${
                    scenarioMode === 'ocr_warning'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🔍 Scanned_Invoice.pdf (OCR Flow)
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset('Legal_Contract_Draft.docx', 1468006, 'de', 'en', 'recoverable_error')}
                  className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors ${
                    scenarioMode === 'recoverable_error'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ⚡ Backoff Retry (Network glitch)
                </button>
              </div>
            </div>

            {/* Language Selectors Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Source Language
                </label>
                <div className="relative">
                  <select
                    id="source-language-select"
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none font-medium cursor-pointer"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <Languages className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Language
                </label>
                <div className="relative">
                  <select
                    id="target-language-select"
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none font-medium cursor-pointer"
                  >
                    <option value="" disabled>Select Language...</option>
                    {LANGUAGES.filter(l => l.code !== 'auto').map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <Languages className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Bar: Free Plan Info & Start Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Free plan limit: 25 MiB. OCR automatically applied when needed.</span>
              </div>

              <button
                id="start-translation-submit-btn"
                type="submit"
                disabled={!selectedFile || !targetLang}
                className={`w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-semibold transition-all space-x-2 ${
                  selectedFile && targetLang
                    ? 'bg-[#3538cd] hover:bg-[#2b2db5] text-white shadow-md cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Languages className="w-4 h-4" />
                <span>Start Translation</span>
              </button>
            </div>

          </form>

        </div>

        {/* Right Column (1 Col): Recent Activity & Storage Meter */}
        <div className="space-y-6">
          
          {/* Recent Activity Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
              <button 
                onClick={onViewAllHistory}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {recentJobs.slice(0, 3).map((job) => (
                <div 
                  key={job.id}
                  onClick={() => onViewJob(job)}
                  className="py-3 first:pt-0 last:pb-0 flex items-start space-x-3 cursor-pointer hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {job.filename}
                    </p>
                    
                    <div className="flex items-center space-x-2 mt-1">
                      {job.status === 'completed' && (
                        <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Completed
                        </span>
                      )}

                      {(job.status === 'translating' || job.status === 'analyzing' || job.status === 'extracting') && (
                        <span className="inline-flex items-center text-[11px] font-semibold text-blue-600">
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          Translating ({job.progress}%)
                        </span>
                      )}

                      {job.status === 'failed' && (
                        <span className="inline-flex items-center text-[11px] font-semibold text-rose-600">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Failed (OCR Error)
                        </span>
                      )}

                      {job.status === 'cancelled' && (
                        <span className="inline-flex items-center text-[11px] font-semibold text-amber-600">
                          <Clock className="w-3 h-3 mr-1" />
                          Cancelled
                        </span>
                      )}

                      <span className="text-[11px] text-slate-400">• {job.createdAt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Storage Used Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-slate-500" />
                <span>Storage Used</span>
              </div>
              <span className="font-mono text-slate-900">1.2 GB / 5 GB</span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-2 rounded-full w-[24%]"></div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
