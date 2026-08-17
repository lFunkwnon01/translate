import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Check, 
  Eye, 
  Columns, 
  Sparkles,
  Layers,
  Info,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TranslationJob, DocumentPage } from '../../types';
import { generateTranslatedPDF, generateOriginalDummy } from '../../utils/pdfGenerator';

interface PreviewScreenProps {
  job: TranslationJob;
  onNewTranslation: () => void;
}

export const PreviewScreen: React.FC<PreviewScreenProps> = ({
  job,
  onNewTranslation,
}) => {
  const [currentPageIdx, setCurrentPageIdx] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'translated' | 'side-by-side'>('side-by-side');
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState<{ term: string; translation: string; definition: string } | null>(null);

  const totalPages = job.pages.length > 0 ? job.pages.length : 1;
  const currentPage: DocumentPage = job.pages[currentPageIdx] || {
    pageNumber: 1,
    originalText: `TECHNICAL OPERATION MANUAL: INDUSTRIAL HYDRAULIC VALVE SYSTEM\nModel: HV-9000-X Pro Series\nRev: 4.2.1 | Build 2026\n\n1. GENERAL SYSTEM SPECIFICATIONS\nThe HV-9000-X is an electro-proportional hydraulic flow control valve engineered for high-pressure industrial machinery. Operating at pressures up to 350 bar (5076 psi), the internal spool assembly utilizes active micro-positioning sensors with sub-millisecond response latency.`,
    translatedText: `MANUAL TÉCNICO DE OPERACIÓN: SISTEMA DE VÁLVULA HIDRÁULICA INDUSTRIAL\nModelo: Serie HV-9000-X Pro\nRev: 4.2.1 | Compilación 2026\n\n1. ESPECIFICACIONES GENERALES DEL SISTEMA\nLa HV-9000-X es una válvula electroproporcional de control de flujo hidráulico diseñada para maquinaria industrial de alta presión. Operando a presiones de hasta 350 bar (5076 psi), el conjunto de carrete interno utiliza sensores de microposicionamiento activo con latencia de respuesta inferior al milisegundo.`,
  };

  const handleDownloadPDF = () => {
    try {
      generateTranslatedPDF(job);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

  const handleDownloadOriginal = () => {
    generateOriginalDummy(job);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(150, Math.max(75, prev + delta)));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Success Banner (Matching Image 3) */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-emerald-900">Translation Complete!</h2>
            <p className="text-xs text-emerald-700">
              Your document is ready for review and download. All layout geometries and formatting preserved.
            </p>
          </div>
        </div>

        <button
          onClick={onNewTranslation}
          className="hidden sm:inline-flex items-center text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline px-2 py-1"
        >
          Start another file
        </button>
      </div>

      {/* Main Grid: Left PDF Preview (2 Cols) + Right Actions & Details (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: PDF Preview Canvas */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Viewer Toolbar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
            
            {/* Title & View Mode Toggle */}
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-800">PDF Preview</span>
              <div className="h-4 w-[1px] bg-slate-200" />
              
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setViewMode('side-by-side')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center space-x-1 ${
                    viewMode === 'side-by-side' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Side-by-Side</span>
                </button>
                <button
                  onClick={() => setViewMode('translated')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center space-x-1 ${
                    viewMode === 'translated' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Translated Only</span>
                </button>
              </div>
            </div>

            {/* Page Navigation & Zoom Controls */}
            <div className="flex items-center space-x-4 text-xs text-slate-600">
              {/* Zoom Buttons */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleZoom(-10)}
                  disabled={zoomLevel <= 75}
                  className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono text-[11px] w-9 text-center">{zoomLevel}%</span>
                <button
                  onClick={() => handleZoom(10)}
                  disabled={zoomLevel >= 150}
                  className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              <div className="h-4 w-[1px] bg-slate-200" />

              {/* Page Navigator */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPageIdx((p) => Math.max(0, p - 1))}
                  disabled={currentPageIdx === 0}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-medium text-slate-800">
                  Page {currentPage.pageNumber} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPageIdx((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPageIdx >= totalPages - 1}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Document Canvas Container */}
          <div className="bg-slate-100/90 rounded-2xl border border-slate-300/80 p-4 sm:p-6 overflow-x-auto min-h-[580px] flex justify-center items-start">
            
            {/* Scaled PDF Page wrapper */}
            <div 
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="transition-transform duration-200 w-full max-w-4xl"
            >
              {viewMode === 'side-by-side' ? (
                /* Side-by-Side Dual Column View */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Original Page (Left) */}
                  <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6 relative">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Original Document ({job.sourceLang})
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Page {currentPage.pageNumber}</span>
                    </div>

                    <div className="font-serif text-slate-800 text-xs leading-relaxed space-y-4 whitespace-pre-wrap">
                      {currentPage.originalText}
                    </div>
                  </div>

                  {/* Translated Page (Right) */}
                  <div className="bg-white rounded-lg shadow-md border border-blue-200 p-6 relative">
                    <div className="flex items-center justify-between pb-3 border-b border-blue-100 mb-4">
                      <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center space-x-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Translated ({job.targetLang})</span>
                      </span>
                      <span className="text-[10px] text-blue-500 font-mono">Page {currentPage.pageNumber}</span>
                    </div>

                    {/* OCR Notice on Page if any */}
                    {currentPage.hasOcrWarning && (
                      <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-md text-[11px] flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Advertencia OCR ({currentPage.ocrConfidence}% Confianza):</span>
                          <p className="mt-0.5">Texto aproximado debido a nota manuscrita en documento original.</p>
                        </div>
                      </div>
                    )}

                    {/* Main translated text */}
                    <div className="font-serif text-slate-900 text-xs leading-relaxed space-y-4 whitespace-pre-wrap">
                      {currentPage.translatedText}
                    </div>

                    {/* Rendered Table if page has table */}
                    {currentPage.tables && (
                      <div className="mt-4 border border-slate-200 rounded-md overflow-hidden text-[11px]">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                            <tr>
                              {currentPage.tables[0].headers.map((h, i) => (
                                <th key={i} className="p-2">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-600 font-mono">
                            {currentPage.tables[0].rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-2">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Rendered Callouts */}
                    {currentPage.callouts && currentPage.callouts.map((c, idx) => (
                      <div key={idx} className="mt-3.5 bg-blue-50/70 border-l-3 border-blue-500 p-2.5 text-[11px] text-blue-900 rounded-r-md">
                        {c}
                      </div>
                    ))}

                    {/* Glossary Highlights */}
                    {currentPage.glossaryTerms && currentPage.glossaryTerms.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Términos de Glosario en esta Página:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentPage.glossaryTerms.map((gt, gIdx) => (
                            <button
                              key={gIdx}
                              onClick={() => setSelectedGlossaryTerm(gt)}
                              className="text-[11px] bg-slate-100 hover:bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded border border-slate-200 hover:border-blue-300 transition-colors"
                            >
                              📖 {gt.term} → {gt.translation}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              ) : (
                /* Single Translated Full Page View */
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-10 max-w-2xl mx-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{job.filename}</h3>
                      <p className="text-[11px] text-slate-400">Neural Translated • Layout Engine V2</p>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">Page {currentPage.pageNumber} / {totalPages}</span>
                  </div>

                  <div className="font-serif text-slate-900 text-sm leading-relaxed whitespace-pre-wrap">
                    {currentPage.translatedText}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Right Column: Actions, Warnings & Quality, Job Details (Matching Image 3) */}
        <div className="space-y-6">
          
          {/* Main Action Buttons */}
          <div className="space-y-3">
            <button
              id="download-translated-pdf-btn"
              onClick={handleDownloadPDF}
              className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 bg-[#3538cd] hover:bg-[#2b2db5] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Translated PDF</span>
            </button>

            <button
              id="download-original-btn"
              onClick={handleDownloadOriginal}
              className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Download Original</span>
            </button>
          </div>

          {/* Warnings & Quality Card (Matching Image 3) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 tracking-tight pb-3 border-b border-slate-100 uppercase">
              Warnings & Quality
            </h3>

            {/* Low Confidence OCR Warning */}
            {job.warnings.some((w) => w.type === 'ocr_low_confidence') ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start space-x-2 text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold">Low Confidence OCR</span>
                    <p className="text-amber-700 mt-0.5 text-[11px]">
                      Pages 4 & 12 required approximation.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-600 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>No OCR quality warnings detected.</span>
              </div>
            )}

            {/* Quality Metrics List */}
            <div className="space-y-3 pt-1 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500">Glossary Terms Applied</span>
                <span className="font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px]">
                  {job.qualityMetrics.glossaryTermsCount}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500">Grammar Checks</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px] flex items-center">
                  <Check className="w-3 h-3 mr-1" />
                  {job.qualityMetrics.grammarStatus}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500">Layout Fidelity</span>
                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                  {job.qualityMetrics.layoutFidelity}% Preserved
                </span>
              </div>
            </div>
          </div>

          {/* JOB DETAILS Card (Matching Image 3) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 tracking-tight pb-3 border-b border-slate-100 uppercase">
              Job Details
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Language Pair</span>
                <span className="font-bold text-slate-900 font-mono">
                  {job.sourceLang} → {job.targetLang}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Duration</span>
                <span className="font-medium text-slate-800 font-mono">{job.duration || '2m 15s'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">File Size</span>
                <span className="font-medium text-slate-800 font-mono">{job.fileSize}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Date</span>
                <span className="font-medium text-slate-800">{job.createdAt}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Model</span>
                <span className="font-medium text-slate-800 text-[11px] truncate max-w-[130px] text-right">
                  {job.qualityMetrics.modelUsed}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Estimated Cost</span>
                <span className="font-semibold text-emerald-600 font-mono">{job.qualityMetrics.estimatedCost}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Glossary Term Definition Inspector Modal if clicked */}
      {selectedGlossaryTerm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-blue-600">
                <BookOpen className="w-5 h-5" />
                <h4 className="text-sm font-bold text-slate-900">Custom Domain Glossary</h4>
              </div>
              <button 
                onClick={() => setSelectedGlossaryTerm(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Source Term</span>
                <p className="text-slate-900 font-bold text-sm mt-0.5">{selectedGlossaryTerm.term}</p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Locked Translation</span>
                <p className="text-blue-600 font-bold text-sm mt-0.5">{selectedGlossaryTerm.translation}</p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Definition & Context</span>
                <p className="text-slate-600 mt-0.5 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {selectedGlossaryTerm.definition}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedGlossaryTerm(null)}
              className="mt-5 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
