import React from 'react';
import { Languages, History, Settings, Workflow, BarChart3, CreditCard } from 'lucide-react';
import { ActiveTab } from '../../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenFlows: () => void;
  onOpenAuth: () => void;
  userEmail?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenFlows,
  onOpenAuth,
  userEmail,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center space-x-8">
          <button
            id="brand-logo-btn"
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-2 text-left group transition-transform focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
              <Languages className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold text-[#3538cd] tracking-tight">
              DocTranslate <span className="text-[#3538cd]">AI</span>
            </span>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              id="nav-translate-btn"
              onClick={() => setActiveTab('translate')}
              className={`px-3.5 py-2 text-sm font-medium transition-all relative ${
                activeTab === 'translate'
                  ? 'text-blue-600 font-semibold after:absolute after:bottom-[-18px] after:left-0 after:right-0 after:h-[2.5px] after:bg-blue-600 after:rounded-full'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Translate
            </button>

            <button
              id="nav-usage-btn"
              onClick={() => setActiveTab('usage')}
              className={`px-3.5 py-2 text-sm font-medium transition-all relative ${
                activeTab === 'usage' ? 'text-blue-600 font-semibold after:absolute after:bottom-[-18px] after:left-0 after:right-0 after:h-[2.5px] after:bg-blue-600 after:rounded-full' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="mr-1 inline h-3.5 w-3.5" /> Usage
            </button>

            <button
              id="nav-plan-btn"
              onClick={() => setActiveTab('plan')}
              className={`px-3.5 py-2 text-sm font-medium transition-all relative ${
                activeTab === 'plan' ? 'text-blue-600 font-semibold after:absolute after:bottom-[-18px] after:left-0 after:right-0 after:h-[2.5px] after:bg-blue-600 after:rounded-full' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="mr-1 inline h-3.5 w-3.5" /> Plans
            </button>

            <button
              id="nav-dashboard-btn"
              onClick={() => setActiveTab('preview')}
              className={`px-3.5 py-2 text-sm font-medium transition-all relative ${
                activeTab === 'preview'
                  ? 'text-blue-600 font-semibold after:absolute after:bottom-[-18px] after:left-0 after:right-0 after:h-[2.5px] after:bg-blue-600 after:rounded-full'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dashboard
            </button>

            <button
              id="nav-history-btn"
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 text-sm font-medium transition-all relative ${
                activeTab === 'history'
                  ? 'text-blue-600 font-semibold after:absolute after:bottom-[-18px] after:left-0 after:right-0 after:h-[2.5px] after:bg-blue-600 after:rounded-full'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              History
            </button>

            <button
              id="nav-settings-btn"
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-2 text-sm font-medium transition-all relative ${
                activeTab === 'settings'
                  ? 'text-blue-600 font-semibold after:absolute after:bottom-[-18px] after:left-0 after:right-0 after:h-[2.5px] after:bg-blue-600 after:rounded-full'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Right side CTA & Flow inspector */}
        <div className="flex items-center space-x-3">
          <button
            id="view-architecture-flows-btn"
            onClick={onOpenFlows}
            title="Inspect System Architecture & Workflows"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 rounded-md border border-slate-200 hover:border-blue-200 transition-colors"
          >
            <Workflow className="w-3.5 h-3.5 text-blue-600" />
            <span>Architecture & Flows</span>
          </button>

          <button
            id="auth-action-btn"
            onClick={onOpenAuth}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#3538cd] hover:bg-[#2b2db5] rounded-md transition-colors shadow-xs"
          >
            {userEmail ? (
              <span className="truncate max-w-[130px]">{userEmail.split('@')[0]}</span>
            ) : (
              'Sign In'
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
