import React, { useState, useEffect, useRef } from 'react';
import { Edit3, Plus, X, Check, Image as ImageIcon, Upload, Trash2, Sigma, Calculator } from 'lucide-react';
import { Question, QuestionType, Difficulty } from '../types';

interface EditQuestionModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (savedQuestion: Question) => void;
}

const SAMPLE_DIAGRAM_IMAGES = [
  { name: 'Kurva Grafik Parabola (Matematika)', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80' },
  { name: 'Diagram Segitiga & Geometri', url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80' },
  { name: 'Struktur Sel & IPA Biologi', url: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?w=600&auto=format&fit=crop&q=80' },
  { name: 'Peta & Geografi IPS', url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&auto=format&fit=crop&q=80' },
];

const MATH_SYMBOLS = [
  { label: 'x²', insert: 'x²' },
  { label: 'xⁿ', insert: 'x^n' },
  { label: 'Pecahan', insert: '\\frac{a}{b}' },
  { label: 'Akar √', insert: '\\sqrt{x}' },
  { label: '±', insert: '±' },
  { label: 'π', insert: 'π' },
  { label: 'θ', insert: 'θ' },
  { label: 'α', insert: 'α' },
  { label: 'β', insert: 'β' },
  { label: 'Δ', insert: 'Δ' },
  { label: '∫', insert: '∫' },
  { label: '∑', insert: '∑' },
  { label: '≤', insert: '≤' },
  { label: '≥', insert: '≥' },
  { label: '≠', insert: '≠' },
  { label: '≈', insert: '≈' },
  { label: '∞', insert: '∞' },
];

export const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  question,
  isOpen,
  onClose,
  onSave,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [formData, setFormData] = useState<Question>({
    id: `custom-q-${Date.now()}`,
    number: 1,
    type: 'pg',
    questionText: '',
    options: [
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' },
    ],
    correctAnswer: 'A',
    explanation: '',
    difficulty: 'sedang',
    points: 10,
    imageUrl: '',
    imageCaption: '',
  });

  useEffect(() => {
    if (question) {
      setFormData(question);
    } else {
      setFormData({
        id: `custom-q-${Date.now()}`,
        number: 1,
        type: 'pg',
        questionText: '',
        options: [
          { key: 'A', text: '' },
          { key: 'B', text: '' },
          { key: 'C', text: '' },
          { key: 'D', text: '' },
        ],
        correctAnswer: 'A',
        explanation: '',
        difficulty: 'sedang',
        points: 10,
        imageUrl: '',
        imageCaption: '',
      });
    }
  }, [question, isOpen]);

  if (!isOpen) return null;

  const insertMathSymbol = (sym: string) => {
    setFormData((prev) => ({
      ...prev,
      questionText: prev.questionText ? prev.questionText + ' ' + sym : sym,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({
            ...prev,
            imageUrl: event.target!.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionTextChange = (key: string, text: string) => {
    const updated = (formData.options || []).map((opt) =>
      opt.key === key ? { ...opt, text } : opt
    );
    setFormData({ ...formData, options: updated });
  };

  const handleTypeChange = (newType: QuestionType) => {
    let defaultCorrect = formData.correctAnswer;
    let defaultOptions = formData.options;

    if (newType === 'tf') {
      defaultOptions = [
        { key: 'A', text: 'Benar' },
        { key: 'B', text: 'Salah' },
      ];
      defaultCorrect = 'Benar';
    } else if (newType === 'pg' && (!defaultOptions || defaultOptions.length < 4)) {
      defaultOptions = [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' },
      ];
      defaultCorrect = 'A';
    }

    setFormData({
      ...formData,
      type: newType,
      options: defaultOptions,
      correctAnswer: defaultCorrect,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.questionText.trim()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              {question ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              {question ? 'Edit Soal & Gambar' : 'Tambah Soal Manual'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Tipe Soal & Kesulitan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tipe Soal</label>
              <select
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
              >
                <option value="pg">Pilihan Ganda (PG)</option>
                <option value="isian">Isian Singkat</option>
                <option value="essai">Essai / Uraian</option>
                <option value="tf">Benar / Salah</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tingkat Kesulitan</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
              >
                <option value="mudah">Mudah</option>
                <option value="sedang">Sedang</option>
                <option value="sulit">Sulit</option>
                <option value="hots">HOTS</option>
              </select>
            </div>
          </div>

          {/* Quick Math Equation Symbols Toolbar */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center space-x-1">
                <Sigma className="w-3.5 h-3.5 text-indigo-600" />
                <span>Toolbar Simbol & Rumus Matematika (Equation)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Klik untuk sisipkan</span>
            </div>

            <div className="flex flex-wrap gap-1">
              {MATH_SYMBOLS.map((sym) => (
                <button
                  key={sym.label}
                  type="button"
                  onClick={() => insertMathSymbol(sym.insert)}
                  className="px-2 py-1 text-[10px] font-mono font-bold bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-md transition-colors"
                >
                  {sym.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Teks Pertanyaan *</label>
            <textarea
              ref={textareaRef}
              rows={3}
              required
              placeholder="Tuliskan teks soal pertanyaan di sini... Gunakan toolbar matematika di atas bila menggunakan rumus."
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Image Attachment Section */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>Lampirkan Gambar Pada Soal (Opsional)</span>
              </label>

              {formData.imageUrl && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: '', imageCaption: '' })}
                  className="text-[11px] text-rose-600 hover:underline flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus Gambar</span>
                </button>
              )}
            </div>

            {/* Upload or URL input */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="url"
                  placeholder="Atau tempelkan URL Gambar (https://...)"
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-slate-800 text-xs"
                />

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shrink-0 flex items-center space-x-1"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Unggah File</span>
                </button>
              </div>

              {/* Sample diagram presets */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold">Atau pilih contoh gambar diagram:</span>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_DIAGRAM_IMAGES.map((img) => (
                    <button
                      key={img.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: img.url, imageCaption: img.name })}
                      className="text-[10px] bg-white hover:bg-indigo-50 hover:border-indigo-300 text-slate-600 border border-slate-200 px-2 py-1 rounded-md transition-colors"
                    >
                      + {img.name}
                    </button>
                  ))}
                </div>
              </div>

              {formData.imageUrl && (
                <div className="pt-2 flex items-start space-x-3">
                  <img
                    src={formData.imageUrl}
                    alt="Preview Soal"
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 object-contain rounded border border-slate-200 bg-white"
                  />
                  <div className="flex-1 space-y-1">
                    <label className="block text-[10px] font-semibold text-slate-600">Keterangan / Caption Gambar:</label>
                    <input
                      type="text"
                      placeholder="misal: Grafik fungsi kuadrat f(x) = x^2 - 4x + 3"
                      value={formData.imageCaption || ''}
                      onChange={(e) => setFormData({ ...formData, imageCaption: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Options for PG */}
          {formData.type === 'pg' && formData.options && (
            <div className="space-y-2">
              <label className="block font-semibold text-slate-700">Opsi Pilihan Jawaban</label>
              {formData.options.map((opt) => (
                <div key={opt.key} className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs shrink-0">
                    {opt.key}
                  </span>
                  <input
                    type="text"
                    required
                    placeholder={`Isi opsi ${opt.key}...`}
                    value={opt.text}
                    onChange={(e) => handleOptionTextChange(opt.key, e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                  <input
                    type="radio"
                    name="correctAnswerRadio"
                    checked={formData.correctAnswer === opt.key}
                    onChange={() => setFormData({ ...formData, correctAnswer: opt.key })}
                    className="accent-emerald-600 cursor-pointer"
                    title="Jadikan Kunci Jawaban"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Correct Answer Selection for Isian/Essai/TF */}
          {formData.type !== 'pg' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kunci Jawaban Benar *</label>
              {formData.type === 'tf' ? (
                <select
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
                >
                  <option value="Benar">Benar</option>
                  <option value="Salah">Salah</option>
                </select>
              ) : (
                <input
                  type="text"
                  required
                  placeholder="Ketikkan frasa/kata kunci jawaban benar..."
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                />
              )}
            </div>
          )}

          {/* Explanation */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pembahasan / Penjelasan Detail</label>
            <textarea
              rows={3}
              placeholder="Tuliskan pembahasan atau langkah pengerjaan..."
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center space-x-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Soal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

