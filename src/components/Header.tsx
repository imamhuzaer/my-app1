import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle, History, Key } from 'lucide-react';

interface HeaderProps {
  savedCount: number;
  onOpenSavedModal: () => void;
  hasApiKey?: boolean;
  onOpenApiKeyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  savedCount,
  onOpenSavedModal,
  hasApiKey = false,
  onOpenApiKeyModal,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Generator Soal AI
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-full">
                Desain by Imam Huzaer
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Generator Soal Ujian, Kuis, & Pembahasan Otomatis
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Gemini API Key Trigger Button */}
          <button
            type="button"
            onClick={onOpenApiKeyModal}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              hasApiKey
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 animate-pulse'
            }`}
            title="Klik untuk memasukkan atau mengubah Gemini API Key Anda"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">
              {hasApiKey ? 'API Key Aktif' : 'Input API Key'}
            </span>
            {hasApiKey ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            )}
          </button>

          {/* History / Saved Collections Button */}
          <button
            type="button"
            onClick={onOpenSavedModal}
            className="relative inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <History className="w-4 h-4" />
            <span>Riwayat & Bank Soal</span>
            {savedCount > 0 && (
              <span className="ml-1 bg-white text-indigo-700 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};


