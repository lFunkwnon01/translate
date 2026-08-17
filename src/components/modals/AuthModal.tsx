import React, { useState } from 'react';
import { X, Lock, Mail, ShieldCheck, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  setUserEmail,
}) => {
  const [emailInput, setEmailInput] = useState(userEmail || 'engineering@enterprise.corp');
  const [isLoggedIn, setIsLoggedIn] = useState(!!userEmail);

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setUserEmail(emailInput);
    setIsLoggedIn(true);
    onClose();
  };

  const handleSignOut = () => {
    setUserEmail('');
    setIsLoggedIn(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 relative animate-in fade-in zoom-in duration-150">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isLoggedIn ? 'Enterprise Workspace' : 'Sign in to DocTranslate AI'}
            </h3>
            <p className="text-xs text-slate-500">
              {isLoggedIn ? 'Active enterprise SSO session' : 'Access team glossaries and translation history'}
            </p>
          </div>
        </div>

        {isLoggedIn ? (
          <div className="mt-6 space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Connected Account:</span>
                <span className="font-bold text-slate-900">{userEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Plan Tier:</span>
                <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Enterprise Pro</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Security Mode:</span>
                <span className="font-semibold text-emerald-600">Zero Retention Active</span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg text-xs transition-colors border border-rose-200"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignIn} className="mt-6 space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Corporate Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="name@company.com"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">SSO Password / Token</label>
              <div className="relative">
                <input
                  type="password"
                  defaultValue="••••••••••••"
                  className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#3538cd] hover:bg-[#2b2db5] text-white font-bold rounded-lg text-xs shadow-md transition-all mt-2 cursor-pointer"
            >
              Sign In with Corporate SSO
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
