import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  UserCheck, 
  ListChecks, 
  Send,
  HelpCircle
} from 'lucide-react';
import { Question } from '../types';
import { generateGoogleAppsScript, downloadGoogleAppsScript } from '../utils/exporter';

interface GoogleFormExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizTitle: string;
  subject: string;
  grade: string;
  questions: Question[];
  initialEmail?: string;
}

export const GoogleFormExportModal: React.FC<GoogleFormExportModalProps> = ({
  isOpen,
  onClose,
  quizTitle,
  subject,
  grade,
  questions,
  initialEmail = 'ImamHuzaer11@gmail.com',
}) => {
  const [userEmail, setUserEmail] = useState(initialEmail);
  const [copied, setCopied] = useState(false);
  const [emailError, setEmailError] = useState('');

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
    if (!email || email.trim() === '') {
      setEmailError('Email Google / Gmail wajib diisi agar Anda memiliki akses Editor penuh.');
      return false;
    }
    if (!email.includes('@')) {
      setEmailError('Format email tidak valid. Pastikan menyertakan karakter @');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleCopyScript = () => {
    if (!validateEmail(userEmail)) return;
    const script = generateGoogleAppsScript({ title: quizTitle, subject, grade, questions }, userEmail);
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadScript = () => {
    if (!validateEmail(userEmail)) return;
    downloadGoogleAppsScript({ title: quizTitle, subject, grade, questions }, userEmail);
  };

  const handleOpenScriptEditor = () => {
    if (!validateEmail(userEmail)) return;
    // Copy script first for convenience then open script.new
    const script = generateGoogleAppsScript({ title: quizTitle, subject, grade, questions }, userEmail);
    navigator.clipboard.writeText(script);
    setCopied(true);
    window.open('https://script.new', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-900 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <h2 className="text-lg font-bold">Ekspor Otomatis ke Google Form</h2>
              <p className="text-xs text-purple-200">
                Jadikan {questions.length} soal kuis menjadi Google Form interaktif berstruktur 3 Section
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

          {/* Email Input Requirement (Wajib Input Email) */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-3">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-600 text-white rounded-xl shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <label htmlFor="user-google-email" className="block text-xs font-bold text-purple-950 uppercase tracking-wider">
                  Email Google Anda (Wajib Akses Editor) <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-purple-800">
                  Masukkan email Google/Gmail Anda agar Google Form otomatis ditambahkan ke Google Drive akun tersebut dengan <strong>akses Editor penuh</strong> (bukan hanya melihat hasil).
                </p>
                <div className="mt-2 relative">
                  <input
                    id="user-google-email"
                    type="email"
                    value={userEmail}
                    onChange={(e) => {
                      setUserEmail(e.target.value);
                      if (e.target.value.includes('@')) setEmailError('');
                    }}
                    placeholder="contoh: namaanda@gmail.com"
                    className={`w-full px-4 py-2.5 text-xs bg-white border ${
                      emailError ? 'border-red-500 focus:ring-red-500' : 'border-purple-300 focus:ring-purple-600'
                    } rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 shadow-2xs`}
                  />
                  {emailError && (
                    <p className="text-[11px] font-semibold text-red-600 mt-1">{emailError}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Google Form Section Structure Preview */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <ListChecks className="w-4 h-4 text-purple-600" />
              <span>Struktur Section Google Form yang Dihasilkan</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Section 1 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">1</span>
                  <span className="text-xs font-bold text-slate-800">Identitas Siswa</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Formulir input Nama Lengkap, Kelas/Rombel, dan Nomor Absen siswa.
                </p>
              </div>

              {/* Section 2 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">2</span>
                  <span className="text-xs font-bold text-slate-800">Naskah Soal ({questions.length})</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Semua soal PG, isian, & essai lengkap dengan Kunci Jawaban & Skor Poin.
                </p>
              </div>

              {/* Section 3 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">3</span>
                  <span className="text-xs font-bold text-slate-800">Submit Jawaban</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Halaman penyerahan akhir, ucapan terimakasih & konfirmasi jawaban.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Step-by-Step */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-purple-300 tracking-wider flex items-center space-x-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Petunjuk Pemasangan 1-Klik</span>
              </span>
              <span className="text-[10px] bg-purple-900/80 text-purple-200 px-2 py-0.5 rounded-full font-mono">
                Google Apps Script
              </span>
            </div>

            <ol className="text-xs space-y-2 text-slate-300">
              <li className="flex items-start space-x-2">
                <span className="font-bold text-purple-400">1.</span>
                <span>Klik tombol <strong className="text-white">&quot;Buka script.new & Salin Kode&quot;</strong> di bawah. Kode script akan tersalin otomatis.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold text-purple-400">2.</span>
                <span>Pada tab baru Google Apps Script yang terbuka, hapus semua kode bawaan lalu <strong>Paste (Tempel)</strong> kode Anda.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold text-purple-400">3.</span>
                <span>Klik tombol <strong className="text-white font-mono">▶ Run (Jalankan)</strong> di bagian atas. Google Form Kuis akan langsung terbuat di Google Drive akun email <strong>{userEmail || 'Anda'}</strong>!</span>
              </li>
            </ol>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Batal
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadScript}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Download Script (.gs)</span>
            </button>

            <button
              type="button"
              onClick={handleCopyScript}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 text-xs font-bold text-purple-900 bg-purple-100 hover:bg-purple-200 border border-purple-300 rounded-xl transition-colors shadow-2xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-purple-700" />}
              <span>{copied ? 'Kode Tersalin!' : 'Salin Kode Script'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenScriptEditor}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors shadow-md active:scale-[0.98]"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Buka script.new & Salin Kode</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
