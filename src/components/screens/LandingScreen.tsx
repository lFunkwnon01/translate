import React from 'react';
import { 
  ArrowRight, 
  UploadCloud, 
  Layers, 
  ScanText, 
  BookOpen, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  Clock, 
  FileText,
  Sparkles
} from 'lucide-react';
import { TranslationJob } from '../../types';

interface LandingScreenProps {
  onStartTranslating: () => void;
  onSelectSampleJob: (jobId: string) => void;
  onOpenFlows: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onStartTranslating,
  onSelectSampleJob,
  onOpenFlows,
}) => {
  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="pt-12 md:pt-16 pb-6 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Enterprise-Grade Document Translation Powered by{' '}
          <span className="text-[#3538cd] block sm:inline">Advanced AI</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Preserve formatting, detect OCR automatically, and translate PDFs with architectural precision.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            id="hero-start-translating-btn"
            onClick={onStartTranslating}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-[#3538cd] hover:bg-[#2b2db5] rounded-lg transition-all shadow-md hover:shadow-lg space-x-2"
          >
            <span>Start Translating</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            id="hero-view-docs-btn"
            onClick={onOpenFlows}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all border border-slate-200"
          >
            View Documentation & Flows
          </button>
        </div>

        {/* Trusted By Logos */}
        <div className="mt-12 pt-6 border-t border-slate-100">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            TRUSTED BY 500+ GLOBAL TEAMS
          </p>
          <div className="mt-4 flex items-center justify-center space-x-8 text-slate-400 opacity-75">
            <Building2 className="w-6 h-6 hover:text-slate-600 transition-colors" />
            <Building2 className="w-7 h-7 hover:text-slate-600 transition-colors" />
            <Building2 className="w-6 h-6 hover:text-slate-600 transition-colors" />
            <Building2 className="w-7 h-7 hover:text-slate-600 transition-colors" />
            <Building2 className="w-6 h-6 hover:text-slate-600 transition-colors" />
          </div>
        </div>
      </section>

      {/* Interactive Project Draft Container (Matching screenshot Image 7) */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Draft Upload Box (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-slate-900">New Translation Project</span>
              </div>
              <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">
                Draft
              </span>
            </div>

            {/* Big Drop Area */}
            <div 
              onClick={onStartTranslating}
              className="mt-6 border-2 border-dashed border-slate-200 rounded-xl p-10 text-center hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[220px]"
            >
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-800">
                Drag & drop your documents here
              </p>
              <p className="mt-1 text-xs text-slate-400">
                 Supports PDF up to 25 MiB
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Automatic layout reconstruction</span>
              <button 
                onClick={onStartTranslating}
                className="font-medium text-blue-600 hover:underline flex items-center space-x-1"
              >
                <span>Open Full Translation Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Side Widgets (1 Col) */}
          <div className="space-y-6">
            
            {/* Recent Activity Mini Widget */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 tracking-tight">Recent Activity</span>
                <Clock className="w-3.5 h-3.5 text-slate-400" />
              </div>
              
              <div className="mt-4 space-y-4">
                <div 
                  onClick={() => onSelectSampleJob('job_8910')}
                  className="cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-800 truncate max-w-[160px]">Q3_Financial_Report.pdf</span>
                    <span className="text-emerald-600 font-semibold text-[11px]">100%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-1.5 rounded-full w-full"></div>
                  </div>
                </div>

                <div 
                  onClick={() => onSelectSampleJob('job_4310')}
                  className="cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-800 truncate max-w-[160px]">Architecture_Specs.docx</span>
                    <span className="text-blue-600 font-semibold text-[11px]">45%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-600 h-1.5 rounded-full w-[45%]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Translation Settings Mini Widget */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
              <span className="text-xs font-bold text-slate-900 tracking-tight block pb-3 border-b border-slate-100">
                Translation Settings
              </span>

              <div className="mt-3.5 space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">Target Language</label>
                  <select 
                    defaultValue="ja"
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ja">Japanese (Corporate)</option>
                    <option value="es">Spanish (Español)</option>
                    <option value="de">German (Deutsch)</option>
                    <option value="fr">French (Français)</option>
                  </select>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" />
                    <span>Apply Engineering Glossary V2</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" />
                    <span>Preserve Exact PDF Layout</span>
                  </label>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Engineered for Precision Features (4 Cards matching Image 7) */}
      <section className="max-w-6xl mx-auto px-4 pt-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Engineered for Precision</h2>
          <p className="text-sm text-slate-500 mt-1.5">
            Advanced tools built specifically for complex document workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Formatting Preservation */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-blue-200 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Formatting Preservation</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Advanced layout engine keeps your PDFs looking identical, rebuilding structures natively.
            </p>
          </div>

          {/* Card 2: OCR Intelligence */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-blue-200 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <ScanText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">OCR Intelligence</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Automatic detection and processing of scanned documents with high-fidelity text extraction.
            </p>
          </div>

          {/* Card 3: Glossary & Style */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-blue-200 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Glossary & Style</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Maintain brand consistency across all languages with custom terminology databases.
            </p>
          </div>

            {/* Card 4: Private Processing */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-blue-200 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
             <h3 className="text-sm font-bold text-slate-900">Private Processing</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Local processing options, end-to-end encryption, and secure file handling for sensitive data.
            </p>
          </div>

        </div>
      </section>

      {/* Seamless Workflow Stepper (Matching Image 7) */}
      <section className="max-w-4xl mx-auto px-4 pt-6">
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-8 text-center">
          <h2 className="text-xl font-bold text-slate-900">Seamless Workflow</h2>
          <p className="text-xs text-slate-500 mt-1">From upload to download in minutes, not days.</p>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full border-2 border-blue-600 bg-white flex items-center justify-center text-blue-600 text-xs font-bold shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-3">STEP 1</span>
              <span className="text-xs font-bold text-slate-800 mt-0.5">Upload</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">Securely upload complex PDFs or Office files.</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full border border-slate-300 bg-white flex items-center justify-center text-slate-600 text-xs font-bold shadow-xs">
                2
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-3">STEP 2</span>
              <span className="text-xs font-bold text-slate-800 mt-0.5">Analyze</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">AI detects layouts, fonts, and applies glossaries.</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full border border-slate-300 bg-white flex items-center justify-center text-slate-600 text-xs font-bold shadow-xs">
                3
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-3">STEP 3</span>
              <span className="text-xs font-bold text-slate-800 mt-0.5">Translate</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">Context-aware neural translation engine processes text.</p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full border border-slate-300 bg-white flex items-center justify-center text-slate-600 text-xs font-bold shadow-xs">
                4
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-3">STEP 4</span>
              <span className="text-xs font-bold text-slate-800 mt-0.5">Download</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">Retrieve pixel-perfect translated documents.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Bottom CTA Banner (Matching Image 7) */}
      <section className="max-w-4xl mx-auto px-4 pt-4 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Ready to break language barriers?</h2>
        <div className="mt-4">
          <button
            id="bottom-start-trial-btn"
            onClick={onStartTranslating}
            className="inline-flex items-center justify-center px-7 py-3 text-sm font-semibold text-white bg-[#3538cd] hover:bg-[#2b2db5] rounded-lg transition-all shadow-md hover:shadow-lg"
          >
             Create Free Account
          </button>
        </div>
         <p className="text-xs text-slate-400 mt-2">Free plan available. Premium features coming later.</p>
      </section>

    </div>
  );
};
