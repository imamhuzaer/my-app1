import React from 'react';
import { History, Trash2, FolderOpen, Printer, X, Calendar, BookOpen } from 'lucide-react';
import { SavedQuiz } from '../types';
import { printQuizPDF } from '../utils/exporter';

interface SavedQuizzesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedQuizzes: SavedQuiz[];
  onLoadQuiz: (quiz: SavedQuiz) => void;
  onDeleteQuiz: (id: string) => void;
  onClearAllHistory?: () => void;
}

export const SavedQuizzesModal: React.FC<SavedQuizzesModalProps> = ({
  isOpen,
  onClose,
  savedQuizzes,
  onLoadQuiz,
  onDeleteQuiz,
  onClearAllHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Riwayat & Bank Soal Tersimpan</h2>
              <p className="text-xs text-slate-500">Daftar naskah soal yang telah dibuat oleh Anda</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {savedQuizzes.length > 0 && onClearAllHistory && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin menghapus seluruh riwayat soal?')) {
                    onClearAllHistory();
                  }
                }}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Semua Riwayat</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content / List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {savedQuizzes.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-medium">Belum ada riwayat soal yang dibuat.</p>
              <p className="text-[11px] text-slate-400">
                Gunakan form generator di sebelah kiri untuk membuat set soal pertama Anda.
              </p>
            </div>
          ) : (
            savedQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 bg-white hover:bg-indigo-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-800 rounded-md">
                      {quiz.subject}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {quiz.questions.length} Soal
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {quiz.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(quiz.createdAt).toLocaleDateString('id-ID')}</span>
                    <span>• {quiz.grade}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      onLoadQuiz(quiz);
                      onClose();
                    }}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Buka</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => printQuizPDF(quiz, true)}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Cetak PDF"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteQuiz(quiz.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus Dari Riwayat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

