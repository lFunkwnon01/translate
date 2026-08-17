import React from 'react';

interface FooterProps {
  onOpenDocModal?: (title: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDocModal }) => {
  return (
    <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        
        {/* Left branding */}
        <div className="flex items-center space-x-3">
          <span className="font-bold text-slate-900 text-sm">DocTranslate AI</span>
          <span>© 2024 DocTranslate AI. High-performance document processing.</span>
        </div>

        {/* Right footer links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <button 
            onClick={() => onOpenDocModal?.('API Documentation')}
            className="hover:text-slate-900 transition-colors"
          >
            Documentation
          </button>
          <button 
            onClick={() => onOpenDocModal?.('Privacy Policy')}
            className="hover:text-slate-900 transition-colors"
          >
            Privacy Policy
          </button>
          <button 
            onClick={() => onOpenDocModal?.('Terms of Service')}
            className="hover:text-slate-900 transition-colors"
          >
            Terms of Service
          </button>
          <button 
            onClick={() => onOpenDocModal?.('API Documentation')}
            className="hover:text-slate-900 transition-colors"
          >
            API Documentation
          </button>
          <button 
            onClick={() => onOpenDocModal?.('Help Center & Support')}
            className="hover:text-slate-900 transition-colors"
          >
            Help Center
          </button>
        </div>

      </div>
    </footer>
  );
};
