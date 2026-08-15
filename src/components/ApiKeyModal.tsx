import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Check, ExternalLink, ShieldCheck, AlertCircle, X, Sparkles, Trash2 } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (newKey: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = inputKey.trim();
    if (!trimmed) {
      setErrorMessage('API Key tidak boleh kosong. Harap masukkan API Key Gemini Anda.');
      return;
    }

    if (!trimmed.startsWith('AIzaSy') && trimmed.length < 20) {
      setErrorMessage('Format API Key Gemini biasanya diawali dengan "AIzaSy...". Pastikan Anda menyalin seluruh karakter.');
      // Still allow saving if user confirms, but show warning
    } else {
      setErrorMessage('');
    }

    onSaveApiKey(trimmed);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setInputKey('');
    onSaveApiKey('');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
              <Key className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Pengaturan Gemini API Key</h2>
              <p className="text-xs text-indigo-200">
                Gunakan API Key Gemini pribadi agar bebas limit bersama
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          
          <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl space-y-2">
            <div className="flex items-start space-x-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs text-indigo-950 space-y-1">
                <p className="font-bold">Mengapa wajib input API Key manual?</p>
                <p className="text-indigo-800 text-[11px] leading-relaxed">
                  Dengan menggunakan API Key Gemini Anda sendiri, pembuatan soal AI tidak akan terganggu oleh antrean atau limit kuota pengguna lain. API Key tersimpan aman di browser Anda (LocalStorage).
                </p>
              </div>
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <label htmlFor="gemini-api-key-input" className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Gemini API Key Anda <span className="text-rose-500">*</span>
            </label>

            <div className="relative">
              <input
                id="gemini-api-key-input"
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  if (e.target.value.trim()) setErrorMessage('');
                }}
                placeholder="Tempelkan API Key di sini (contoh: AIzaSy...)"
                className="w-full pl-4 pr-24 py-3 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                  title={showKey ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {inputKey && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-600 flex items-center space-x-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </p>
            )}
          </div>

          {/* How to get API Key Link */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 block">Belum punya API Key?</span>
              <span className="text-[11px] text-slate-500 block">Dapatkan secara gratis dari Google AI Studio</span>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 text-slate-700 text-xs font-bold rounded-lg transition-all shadow-2xs"
            >
              <span>Buat API Key</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Kunci API Anda disimpan langsung pada browser lokal dan tidak dibagikan ke pengguna lain.</span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleSave}
            className={`inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-bold text-white rounded-xl transition-all shadow-md active:scale-95 ${
              savedSuccess
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Berhasil Disimpan!</span>
              </>
            ) : (
              <>
                <Key className="w-4 h-4" />
                <span>Simpan API Key</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
