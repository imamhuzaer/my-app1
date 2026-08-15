import React, { useState } from 'react';
import { Sparkles, Sliders, FileText, Check, Hash, Key, BookOpen, Heart, Award } from 'lucide-react';
import { QuizConfig, Curriculum, Subject, EducationLevel, Difficulty, QuestionType } from '../types';

interface GeneratorFormProps {
  config: QuizConfig;
  onChange: (config: QuizConfig) => void;
  onGenerate: () => void;
  isLoading: boolean;
  apiKey?: string;
  onOpenApiKeyModal: () => void;
}

const CURRICULUM_OPTIONS: { 
  value: Curriculum; 
  label: string; 
  badge: string; 
  desc: string;
  icon: typeof BookOpen;
  theme: string;
}[] = [
  { 
    value: 'Kurikulum Merdeka', 
    label: 'Kurikulum Merdeka', 
    badge: 'Kemendikbud', 
    desc: 'Capaian Pembelajaran (CP) & Profil Pelajar Pancasila',
    icon: Sparkles,
    theme: 'border-indigo-500 bg-indigo-50/80 text-indigo-950 ring-indigo-500'
  },
  { 
    value: 'Kurikulum 2013', 
    label: 'Kurikulum 2013 (K-13)', 
    badge: 'Nasional', 
    desc: 'Kompetensi Inti & Dasar (KI/KD) Pendekatan Saintifik',
    icon: BookOpen,
    theme: 'border-blue-500 bg-blue-50/80 text-blue-950 ring-blue-500'
  },
  { 
    value: 'Kurikulum Berbasis Cinta (Kemenag)', 
    label: 'Kurikulum Berbasis Cinta', 
    badge: 'Kemenag RI', 
    desc: 'Nilai Kasih Sayang, Moderasi Beragama & Akhlak Mulia',
    icon: Heart,
    theme: 'border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-emerald-500'
  },
];

const SUBJECT_OPTIONS: Subject[] = [
  'Matematika',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'IPA (Fisika, Kimia, Biologi)',
  'IPS (Sejarah, Geografi, Ekonomi)',
  'Informatika & Pemrograman',
  'PPKn & Pancasila',
  'Lainnya / Custom',
];

const EDUCATION_LEVELS: EducationLevel[] = ['SD', 'SMP', 'SMA/SMK', 'Perguruan Tinggi', 'Umum'];

const CLASS_OPTIONS_BY_LEVEL: Record<string, string[]> = {
  SD: ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'],
  SMP: ['Kelas 7', 'Kelas 8', 'Kelas 9'],
  'SMA/SMK': ['Kelas 10', 'Kelas 11', 'Kelas 12'],
};

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; desc: string; color: string }[] = [
  { value: 'mudah', label: 'Mudah', desc: 'Pemahaman Dasar (C1-C2)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'sedang', label: 'Sedang', desc: 'Aplikasi Konsep (C3)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'sulit', label: 'Sulit', desc: 'Analisis & Pemecahan Masalah (C4)', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'hots', label: 'HOTS', desc: 'Penalaran Tingkat Tinggi (C4-C6)', color: 'bg-purple-50 text-purple-700 border-purple-200' },
];

const QUESTION_TYPE_LABELS: { value: QuestionType; label: string; sub: string }[] = [
  { value: 'pg', label: 'Pilihan Ganda (PG)', sub: 'A, B, C, D, E (Porsi Utama)' },
  { value: 'isian', label: 'Isian Singkat', sub: 'Jawaban angka/istilah' },
  { value: 'essai', label: 'Essai / Uraian', sub: 'Penjelasan mendalam' },
  { value: 'tf', label: 'Benar / Salah', sub: 'Opsi Benar atau Salah' },
];

export const GeneratorForm: React.FC<GeneratorFormProps> = ({
  config,
  onChange,
  onGenerate,
  isLoading,
  apiKey = '',
  onOpenApiKeyModal,
}) => {
  const [showMaterialText, setShowMaterialText] = useState(Boolean(config.materialText));

  // Determine current selected Education Level and Class
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel>(() => {
    if (config.grade.includes('SD')) return 'SD';
    if (config.grade.includes('SMP')) return 'SMP';
    if (config.grade.includes('SMA')) return 'SMA/SMK';
    if (config.grade.includes('Perguruan Tinggi')) return 'Perguruan Tinggi';
    return 'Umum';
  });

  const [selectedClass, setSelectedClass] = useState<string>(() => {
    const match = config.grade.match(/Kelas \d+/);
    return match ? match[0] : (CLASS_OPTIONS_BY_LEVEL[selectedLevel]?.[0] || '');
  });

  // Keep config.grade in sync when Level or Class changes
  const handleLevelChange = (newLevel: EducationLevel) => {
    setSelectedLevel(newLevel);
    const availableClasses = CLASS_OPTIONS_BY_LEVEL[newLevel];
    if (availableClasses && availableClasses.length > 0) {
      const defaultCls = availableClasses[0];
      setSelectedClass(defaultCls);
      onChange({ ...config, grade: `${newLevel} ${defaultCls}` });
    } else {
      setSelectedClass('');
      onChange({ ...config, grade: newLevel });
    }
  };

  const handleClassChange = (newClass: string) => {
    setSelectedClass(newClass);
    onChange({ ...config, grade: `${selectedLevel} ${newClass}` });
  };

  const handleTypeToggle = (type: QuestionType) => {
    let updatedTypes = [...config.questionTypes];
    if (updatedTypes.includes(type)) {
      if (updatedTypes.length > 1) {
        updatedTypes = updatedTypes.filter((t) => t !== type);
      }
    } else {
      updatedTypes.push(type);
    }
    onChange({ ...config, questionTypes: updatedTypes });
  };

  const hasMultipleTypes = config.questionTypes.length > 1;

  const handleGenerateClick = () => {
    if (!apiKey || !apiKey.trim()) {
      onOpenApiKeyModal();
      return;
    }
    onGenerate();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
      {/* Form Title & Subtitle */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Form Buat & Generate Soal</h2>
            <p className="text-xs text-slate-500">Konfigurasi kurikulum, jenjang, mata pelajaran & topik</p>
          </div>
        </div>
      </div>

      {/* Manual Gemini API Key Input Banner (Wajib API Manual) */}
      <div className={`p-3.5 rounded-2xl border transition-all ${
        apiKey && apiKey.trim()
          ? 'bg-slate-50 border-slate-200'
          : 'bg-amber-50/90 border-amber-300 ring-1 ring-amber-200'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className={`p-2 rounded-xl shrink-0 ${
              apiKey && apiKey.trim()
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-800 animate-pulse'
            }`}>
              <Key className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {apiKey && apiKey.trim() ? 'Gemini API Key Terpasang' : 'Wajib Input Gemini API Key'}
                </span>
                {apiKey && apiKey.trim() ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    Aktif
                  </span>
                ) : (
                  <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    Wajib
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {apiKey && apiKey.trim()
                  ? `Kunci: ${apiKey.slice(0, 7)}••••••••${apiKey.slice(-4)}`
                  : 'Masukkan API Key Anda agar tidak terbebani antrean/limit bersama'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenApiKeyModal}
            className={`shrink-0 px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-2xs ${
              apiKey && apiKey.trim()
                ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            {apiKey && apiKey.trim() ? 'Ganti Kunci' : 'Input Kunci API'}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        
        {/* INPUTAN KURIKULUM (DI ATAS MATA PELAJARAN) */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Pilihan Kurikulum Pendidikan</span>
              <span className="text-rose-500">*</span>
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {CURRICULUM_OPTIONS.map((item) => {
              const isSelected = config.curriculum === item.value;
              const IconComponent = item.icon;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onChange({ ...config, curriculum: item.value })}
                  className={`p-3 text-left rounded-2xl border transition-all relative ${
                    isSelected
                      ? `${item.theme} ring-2 font-semibold shadow-xs`
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1.5">
                      <IconComponent className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-xs font-bold">{item.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </div>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-black/5">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[10px] opacity-75 mt-1 leading-snug">
                    {item.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 1: Subject (Mata Pelajaran) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Mata Pelajaran <span className="text-rose-500">*</span>
          </label>
          <select
            value={config.subject}
            onChange={(e) => onChange({ ...config, subject: e.target.value as Subject })}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          >
            {SUBJECT_OPTIONS.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
          {config.subject === 'Lainnya / Custom' && (
            <input
              type="text"
              placeholder="Tuliskan nama mata pelajaran..."
              value={config.customSubject || ''}
              onChange={(e) => onChange({ ...config, customSubject: e.target.value })}
              className="mt-2 w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
        </div>

        {/* Row 2: Jenjang Education Level & Kelas (Dynamic) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Jenjang Pendidikan <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => handleLevelChange(e.target.value as EducationLevel)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            >
              {EDUCATION_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Conditional Class Dropdown */}
          {CLASS_OPTIONS_BY_LEVEL[selectedLevel] ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Opsi Kelas <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedClass}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              >
                {CLASS_OPTIONS_BY_LEVEL[selectedLevel].map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-end pb-2">
              <span className="text-xs text-slate-400 italic">
                (Opsi kelas ditiadakan untuk jenjang {selectedLevel})
              </span>
            </div>
          )}
        </div>

        {/* Topik Spesifik */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Topik Spesifik / Bab Pembahasan <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Persamaan Kuadrat, Hukum Newton, Tata Bahasa, Pancasila"
            value={config.topic}
            onChange={(e) => onChange({ ...config, topic: e.target.value })}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Tipe Soal (Checkboxes/Pills) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700">
              Tipe Soal Yang Diminta
            </label>
            {hasMultipleTypes && (
              <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                Porsi Soal PG Otomatis Dominan (60-70%)
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {QUESTION_TYPE_LABELS.map((item) => {
              const isChecked = config.questionTypes.includes(item.value);
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleTypeToggle(item.value)}
                  className={`p-2.5 text-left rounded-xl border transition-all ${
                    isChecked
                      ? 'bg-indigo-50/80 border-indigo-500 text-indigo-950 font-semibold shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{item.label}</span>
                    {isChecked && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </div>
                  <span className="block text-[10px] text-slate-500 mt-0.5">{item.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tingkat Kesulitan */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Tingkat Kesulitan / Karakteristik Soal
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {DIFFICULTY_OPTIONS.map((item) => {
              const isSelected = config.difficulty === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onChange({ ...config, difficulty: item.value })}
                  className={`p-2.5 text-left rounded-xl border transition-all ${
                    isSelected
                      ? `${item.color} border-current ring-1 ring-current font-semibold shadow-2xs`
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">{item.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Jumlah Soal Direct Number Input */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Hash className="w-3.5 h-3.5 text-indigo-600" />
              <span>Jumlah Soal Yang Ingin Dibuat</span>
            </span>
            <span className="text-[10px] text-slate-400">Ketikkan angka (bebas misal 5, 10, 30, dst)</span>
          </label>

          <div className="flex items-center space-x-3">
            <input
              type="number"
              min={1}
              max={100}
              value={config.count}
              onChange={(e) => onChange({ ...config, count: Math.max(1, Number(e.target.value) || 1) })}
              className="w-32 bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
            <div className="flex items-center space-x-1.5">
              {[5, 10, 20, 30, 50].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onChange({ ...config, count: num })}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                    config.count === num
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {num} Soal
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Teks/Materi Acuan Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowMaterialText(!showMaterialText)}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{showMaterialText ? '− Sembunyikan Teks Acuan/Materi' : '+ Tambahkan Teks Acuan / Bacaan (Opsional)'}</span>
          </button>

          {showMaterialText && (
            <div className="mt-2.5">
              <textarea
                rows={4}
                placeholder="Tempelkan paragraf bacaan, artikel, atau kutipan buku di sini agar soal di-generate langsung dari materi ini..."
                value={config.materialText || ''}
                onChange={(e) => onChange({ ...config, materialText: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Generate Submit Button */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={handleGenerateClick}
          disabled={isLoading || !config.topic.trim()}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center space-x-2 shadow-md transition-all ${
            isLoading || !config.topic.trim()
              ? 'bg-slate-300 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-[0.99] shadow-indigo-200'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Memproses AI & Menyusun Soal...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Soal Sekarang</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
