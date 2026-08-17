import React, { useState } from 'react';
import { 
  Sliders, 
  Languages, 
  BookOpen, 
  Save, 
  Check, 
  Moon, 
  Sun, 
  Laptop,
  CheckCircle2
} from 'lucide-react';
import { UserSettings } from '../../types';
import { LANGUAGES } from '../../data/mockData';

interface SettingsScreenProps {
  settings: UserSettings;
  onSaveSettings: (newSettings: UserSettings) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'translation' | 'glossaries'>('general');
  const [formData, setFormData] = useState<UserSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title & Subtitle (Matching Image 11) */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
           Manage your translation preferences, glossaries, and application behavior.
        </p>
      </div>

      {/* Grid: Left Tab Sidebar + Right Form Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Sub-tabs (Matching Image 11) */}
        <div className="md:col-span-1 space-y-1 bg-white rounded-xl border border-slate-200 shadow-xs p-3 h-fit">
          <button
            onClick={() => setActiveSubTab('general')}
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors text-left ${
              activeSubTab === 'general'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>General</span>
          </button>

          <button
            onClick={() => setActiveSubTab('translation')}
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors text-left ${
              activeSubTab === 'translation'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Languages className="w-4 h-4" />
            <span>Translation</span>
          </button>

          <button
            onClick={() => setActiveSubTab('glossaries')}
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors text-left ${
              activeSubTab === 'glossaries'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Glossaries & Memories</span>
          </button>
        </div>

        {/* Right Content Panel (Matching Image 11) */}
        <div className="md:col-span-3">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
            
            {/* Tab: General */}
            {activeSubTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                    General Preferences
                  </h3>
                </div>

                {/* Interface Language */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Interface Language
                  </label>
                  <p className="text-[11px] text-slate-400">Select the language used throughout the dashboard and menus.</p>
                  <select
                    value={formData.interfaceLanguage}
                    onChange={(e) => setFormData({ ...formData, interfaceLanguage: e.target.value })}
                    className="w-full sm:w-72 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>

                {/* Appearance */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Appearance
                  </label>
                  <p className="text-[11px] text-slate-400">Choose how DocTranslate AI looks to you.</p>
                  
                  <div className="grid grid-cols-3 gap-3 max-w-md pt-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, appearance: 'light' })}
                      className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center space-y-2 transition-all ${
                        formData.appearance === 'light'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Light</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, appearance: 'dark' })}
                      className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center space-y-2 transition-all ${
                        formData.appearance === 'dark'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Moon className="w-4 h-4 text-slate-600" />
                      <span>Dark</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, appearance: 'system' })}
                      className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center space-y-2 transition-all ${
                        formData.appearance === 'system'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Laptop className="w-4 h-4 text-slate-600" />
                      <span>System</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Translation */}
            {activeSubTab === 'translation' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                    Engine & Translation Preferences
                  </h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Default Target Language
                    </label>
                    <select
                      value={formData.defaultTargetLanguage}
                      onChange={(e) => setFormData({ ...formData, defaultTargetLanguage: e.target.value })}
                      className="w-full sm:w-72 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      {LANGUAGES.filter(l => l.code !== 'auto').map((l) => (
                        <option key={l.code} value={l.code}>{l.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.autoOcr}
                        onChange={(e) => setFormData({ ...formData, autoOcr: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 mt-0.5"
                      />
                      <div>
                        <span className="font-semibold text-slate-800">Automatic OCR Extraction</span>
                        <p className="text-[11px] text-slate-500">
                          Automatically run multi-layer neural OCR when scanned pages or flattened bitmaps are detected.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.preserveLayout}
                        onChange={(e) => setFormData({ ...formData, preserveLayout: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 mt-0.5"
                      />
                      <div>
                        <span className="font-semibold text-slate-800">Strict PDF Layout Geometry Preservation</span>
                        <p className="text-[11px] text-slate-500">
                          Enforce vector font scaling and bounding box locking to avoid overlapping text.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* OCR Threshold slider */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700">OCR Confidence Warning Threshold</label>
                      <span className="font-mono font-bold text-blue-600">{formData.confidenceThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="98"
                      value={formData.confidenceThreshold}
                      onChange={(e) => setFormData({ ...formData, confidenceThreshold: Number(e.target.value) })}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Pages below this score will trigger manual review flags.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Glossaries */}
            {activeSubTab === 'glossaries' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                    Custom Glossaries & Domain Memories
                  </h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Active Terminology Glossary
                    </label>
                    <select
                      value={formData.defaultGlossary}
                      onChange={(e) => setFormData({ ...formData, defaultGlossary: e.target.value })}
                      className="w-full sm:w-80 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      <option value="Engineering Glossary V2">Engineering Glossary V2 (1,420 terms)</option>
                      <option value="Finance & Banking Master V4">Finance & Banking Master V4 (850 terms)</option>
                      <option value="German Civil Code Terminology">German Civil Code Terminology (2,100 terms)</option>
                      <option value="Medical & Pharmaceutical V1">Medical & Pharmaceutical V1 (3,600 terms)</option>
                    </select>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-700">
                    <p className="font-semibold text-slate-900 mb-1">Sample Terminology Rules:</p>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                      <li><span className="font-mono font-medium text-slate-800">spool assembly</span> → <span className="font-mono text-blue-700">conjunto de carrete</span></li>
                      <li><span className="font-mono font-medium text-slate-800">electro-proportional</span> → <span className="font-mono text-blue-700">electroproporcional</span></li>
                      <li><span className="font-mono font-medium text-slate-800">metering orifice</span> → <span className="font-mono text-blue-700">orificio de medición</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {savedSuccess ? (
                <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Settings saved successfully!
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">Changes apply to all new translation projects.</span>
              )}

              <button
                type="submit"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#3538cd] hover:bg-[#2b2db5] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};
