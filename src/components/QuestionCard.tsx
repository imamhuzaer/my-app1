import React, { useState } from 'react';
import { HelpCircle, Check, Eye, EyeOff, Edit3, Trash2, Sparkles, MessageSquare } from 'lucide-react';
import { Question } from '../types';
import { MathRenderer } from './MathRenderer';

interface QuestionCardProps {
  question: Question;
  showAnswerGlobal: boolean;
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
  onAskAi: (question: Question) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  showAnswerGlobal,
  onEdit,
  onDelete,
  onAskAi,
}) => {
  const [showLocalAnswer, setShowLocalAnswer] = useState(false);

  const isAnswerVisible = showAnswerGlobal || showLocalAnswer;

  const getDifficultyBadge = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'mudah':
        return <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">Mudah</span>;
      case 'sedang':
        return <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">Sedang</span>;
      case 'sulit':
        return <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-md">Sulit</span>;
      case 'hots':
        return <span className="px-2 py-0.5 text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300 rounded-md">HOTS</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600 rounded-md">{diff}</span>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'pg':
        return 'Pilihan Ganda';
      case 'isian':
        return 'Isian Singkat';
      case 'essai':
        return 'Essai / Uraian';
      case 'tf':
        return 'Benar / Salah';
      default:
        return type.toUpperCase();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 hover:border-slate-300 transition-all space-y-4 relative group">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {question.number}
          </span>
          <span className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded-md">
            {getTypeLabel(question.type)}
          </span>
          {getDifficultyBadge(question.difficulty)}
          {question.bloomsTaxonomy && (
            <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-medium bg-slate-50 text-slate-500 border border-slate-200 rounded-md">
              {question.bloomsTaxonomy}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 text-slate-400">
          <button
            type="button"
            onClick={() => onAskAi(question)}
            title="Tanya AI tentang soal ini"
            className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200/60"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bantu Jawab / AI Tutor</span>
          </button>

          <button
            type="button"
            onClick={() => onEdit(question)}
            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
            title="Edit Soal"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(question.id)}
            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
            title="Hapus Soal"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question Main Body */}
      <div className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
        <MathRenderer text={question.questionText} />
      </div>

      {/* Question Image Attachment */}
      {question.imageUrl && (
        <div className="my-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 max-w-md">
          <img
            src={question.imageUrl}
            alt={`Gambar untuk soal ${question.number}`}
            referrerPolicy="no-referrer"
            className="w-full h-auto max-h-64 object-contain rounded-lg hover:scale-[1.02] transition-transform cursor-pointer"
            onClick={() => window.open(question.imageUrl, '_blank')}
            title="Klik untuk membuka gambar ukuran penuh"
          />
          {question.imageCaption && (
            <p className="mt-1.5 text-[11px] text-slate-500 italic text-center">
              Gambar {question.number}: {question.imageCaption}
            </p>
          )}
        </div>
      )}

      {/* Options for Pilihan Ganda or Benar/Salah */}
      {(question.type === 'pg' || question.type === 'tf') && question.options && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {question.options.map((opt) => {
            const isCorrectOption = isAnswerVisible && (
              opt.key === question.correctAnswer ||
              opt.text.toLowerCase() === question.correctAnswer.toLowerCase()
            );

            return (
              <div
                key={opt.key}
                className={`p-2.5 rounded-xl border text-xs flex items-start space-x-2.5 transition-all ${
                  isCorrectOption
                    ? 'bg-emerald-50 border-emerald-400 font-semibold text-emerald-950 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200 text-slate-700'
                }`}
              >
                <span className={`w-5 h-5 rounded-md font-bold text-[11px] flex items-center justify-center shrink-0 ${
                  isCorrectOption ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {opt.key}
                </span>
                <span className="mt-0.5 leading-snug flex-1">
                  <MathRenderer text={opt.text} />
                </span>
                {isCorrectOption && <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              </div>
            );
          })}
        </div>
      )}

      {/* Isian Singkat Answer Line */}
      {question.type === 'isian' && (
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
          <span className="font-semibold text-slate-800">Jawaban Singkat: </span>
          {isAnswerVisible ? (
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <MathRenderer text={question.correctAnswer} />
            </span>
          ) : (
            <span className="italic text-slate-400">....................................................................</span>
          )}
        </div>
      )}

      {/* Answer Key & Explanation Toggle Section */}
      <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowLocalAnswer(!showLocalAnswer)}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {showLocalAnswer ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showLocalAnswer ? 'Sembunyikan Pembahasan' : 'Lihat Kunci Jawaban & Pembahasan'}</span>
          </button>

          {question.points && (
            <span className="text-[11px] font-semibold text-slate-500">
              Bobot: {question.points} Poin
            </span>
          )}
        </div>

        {isAnswerVisible && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs space-y-2 animate-fadeIn">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-800">Kunci Jawaban:</span>
              <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                <MathRenderer text={question.correctAnswer} />
              </span>
            </div>

            <div>
              <span className="font-bold text-slate-800 block mb-0.5">Pembahasan:</span>
              <div className="text-slate-600 leading-relaxed">
                <MathRenderer text={question.explanation} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
