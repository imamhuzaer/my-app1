import React, { useState } from 'react';
import { 
  Printer, 
  FileSpreadsheet, 
  BookmarkCheck, 
  Eye, 
  EyeOff, 
  Search, 
  Shuffle, 
  Layers,
  FileText,
  Award,
  ListOrdered,
  FormInput
} from 'lucide-react';
import { Question } from '../types';
import { QuestionCard } from './QuestionCard';
import { KisiKisiTable } from './KisiKisiTable';
import { RubrikPenilaian } from './RubrikPenilaian';
import { GoogleFormExportModal } from './GoogleFormExportModal';
import { 
  printQuizPDF, 
  printKisiKisiPDF, 
  printRubrikPDF, 
  exportToWord, 
  exportKisiKisiWord, 
  exportRubrikWord 
} from '../utils/exporter';

interface QuestionListProps {
  title: string;
  curriculum?: string;
  subject: string;
  grade: string;
  topic: string;
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  onSaveQuiz: () => void;
  onAddQuestion?: () => void;
  onEditQuestion: (q: Question) => void;
  onAskAi: (q: Question) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  title,
  curriculum = 'Kurikulum Merdeka',
  subject,
  grade,
  topic,
  questions,
  onQuestionsChange,
  onSaveQuiz,
  onEditQuestion,
  onAskAi,
}) => {
  const [activeTab, setActiveTab] = useState<'soal' | 'kisikisi' | 'rubrik'>('soal');
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGFormModalOpen, setIsGFormModalOpen] = useState(false);

  const handleDeleteQuestion = (id: string) => {
    const updated = questions
      .filter((q) => q.id !== id)
      .map((q, idx) => ({ ...q, number: idx + 1 }));
    onQuestionsChange(updated);
  };

  const handleShuffle = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const renumbered = shuffled.map((q, idx) => ({ ...q, number: idx + 1 }));
    onQuestionsChange(renumbered);
  };

  const filteredQuestions = questions.filter((q) =>
    q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (q.topic && q.topic.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      {/* Quiz Header Info Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-600 text-white rounded-full">
              {curriculum}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-800 rounded-full">
              {subject}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full">
              {grade}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {questions.length} Soal Terdaftar
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-slate-500">Topik: <span className="font-semibold text-slate-700">{topic}</span></p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSaveQuiz}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors shadow-2xs"
          >
            <BookmarkCheck className="w-4 h-4 text-indigo-600" />
            <span>Simpan ke Bank Soal</span>
          </button>
        </div>
      </div>

      {/* Main View Tabs (Daftar Soal | Tabel Kisi-Kisi | Rubrik Penilaian) */}
      <div className="bg-slate-200/80 p-1.5 rounded-2xl flex items-center gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('soal')}
          className={`flex-1 inline-flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'soal'
              ? 'bg-white text-indigo-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ListOrdered className="w-4 h-4 text-indigo-600" />
          <span>Daftar Soal & Pembahasan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('kisikisi')}
          className={`flex-1 inline-flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'kisikisi'
              ? 'bg-white text-indigo-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Tabel Kisi-Kisi Soal</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rubrik')}
          className={`flex-1 inline-flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'rubrik'
              ? 'bg-white text-indigo-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-purple-600" />
          <span>Rubrik & Pedoman Penilaian</span>
        </button>
      </div>

      {/* Export & Toolbar Bar for 'soal' tab */}
      {activeTab === 'soal' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Search & Filter */}
          <div className="flex items-center space-x-2 flex-1 min-w-[200px]">
            <div className="relative w-full max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari kata kunci dalam soal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowAllAnswers(!showAllAnswers)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0"
            >
              {showAllAnswers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{showAllAnswers ? 'Sembunyikan Kunci' : 'Tampilkan Kunci'}</span>
            </button>

            <button
              type="button"
              onClick={handleShuffle}
              title="Acak Urutan Soal"
              className="p-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Export Menu */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => exportToWord({ title, subject, grade, questions }, true)}
              title="Ekspor Naskah Soal & Kunci Jawaban ke MS Word (.doc)"
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Ekspor Word</span>
            </button>

            <button
              type="button"
              onClick={() => printQuizPDF({ title, subject, grade, questions }, true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              <span>Cetak PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setIsGFormModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors shadow-2xs"
            >
              <FormInput className="w-3.5 h-3.5" />
              <span>Ekspor ke Google Form</span>
            </button>
          </div>
        </div>
      )}

      {/* Export Toolbar for Kisi-Kisi Tab */}
      {activeTab === 'kisikisi' && (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => exportKisiKisiWord({ title, subject, grade, questions })}
            className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors shadow-2xs"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Ekspor Word Kisi-Kisi</span>
          </button>

          <button
            type="button"
            onClick={() => printKisiKisiPDF({ title, subject, grade, questions })}
            className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            <span>Cetak PDF Kisi-Kisi</span>
          </button>
        </div>
      )}

      {/* Export Toolbar for Rubrik Tab */}
      {activeTab === 'rubrik' && (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => exportRubrikWord({ title, questions })}
            className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors shadow-2xs"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Ekspor Word Rubrik</span>
          </button>

          <button
            type="button"
            onClick={() => printRubrikPDF({ title, questions })}
            className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
          >
            <Printer className="w-4 h-4 text-purple-600" />
            <span>Cetak PDF Rubrik</span>
          </button>
        </div>
      )}

      {/* Tab Content Display */}
      {activeTab === 'soal' && (
        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-indigo-200 p-12 text-center text-slate-500 space-y-3 shadow-2xs">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">Belum ada soal yang di-generate</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Silakan tentukan mata pelajaran, jenjang, topik, dan jumlah soal di form sebelah kiri, lalu klik tombol <span className="font-bold text-indigo-600">&quot;Generate Soal Sekarang&quot;</span>.
                </p>
              </div>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              <p className="text-xs">Tidak ada soal yang cocok dengan kata kunci pencarian.</p>
            </div>
          ) : (
            filteredQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                showAnswerGlobal={showAllAnswers}
                onEdit={onEditQuestion}
                onDelete={handleDeleteQuestion}
                onAskAi={onAskAi}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'kisikisi' && (
        <KisiKisiTable
          quizTitle={title}
          subject={subject}
          grade={grade}
          topic={topic}
          questions={questions}
        />
      )}

      {activeTab === 'rubrik' && (
        <RubrikPenilaian
          quizTitle={title}
          questions={questions}
        />
      )}

      {/* Google Form Export Modal */}
      <GoogleFormExportModal
        isOpen={isGFormModalOpen}
        onClose={() => setIsGFormModalOpen(false)}
        quizTitle={title}
        subject={subject}
        grade={grade}
        questions={questions}
      />
    </div>
  );
};


