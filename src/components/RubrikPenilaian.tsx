import React from 'react';
import { Award, Copy, Check, Info, Calculator } from 'lucide-react';
import { Question } from '../types';

interface RubrikPenilaianProps {
  quizTitle: string;
  questions: Question[];
}

export const RubrikPenilaian: React.FC<RubrikPenilaianProps> = ({
  quizTitle,
  questions,
}) => {
  const [copied, setCopied] = React.useState(false);

  // Determine present question types
  const hasPg = questions.some((q) => q.type === 'pg');
  const hasIsian = questions.some((q) => q.type === 'isian');
  const hasEssai = questions.some((q) => q.type === 'essai');
  const hasTf = questions.some((q) => q.type === 'tf');

  const totalSkor = questions.reduce((acc, q) => acc + (q.points || (q.type === 'essai' ? 20 : 10)), 0);

  const handleCopyRubrik = () => {
    let t = `RUBRIK DAN PEDOMAN PENILAIAN SOAL\nJudul: ${quizTitle}\nTotal Skor Maksimal: ${totalSkor}\n\n`;
    t += `1. PEDOMAN PENGHITUNGAN NILAI AKHIR:\nFormula: Nilai = (Total Skor Perolehan / Total Skor Maksimal) x 100\n\n`;
    t += `2. KRITERIA PENILAIAN PER BENTUK SOAL:\n`;

    if (hasPg) {
      t += `[Pilihan Ganda]\n- Menjawab opsi tepat: Skor Penuh (10 Poin / Soal)\n- Menjawab salah atau tidak menjawab: 0 Poin\n\n`;
    }
    if (hasTf) {
      t += `[Benar / Salah]\n- Menjawab tepat: Skor Penuh (5 Poin / Soal)\n- Menjawab salah: 0 Poin\n\n`;
    }
    if (hasIsian) {
      t += `[Isian Singkat]\n- Tepat & Persis Sesuai Kunci: 10 Poin\n- Sebagian Tepat / Ada Kesalahan Ejaan Kecil: 5 Poin\n- Salah / Tidak Menjawab: 0 Poin\n\n`;
    }
    if (hasEssai) {
      t += `[Essai / Uraian]\n- Skor 20 (Sempurna): Perhitungan/analisis ditulis sangat lengkap, runtut, konsep dan hasil akhir 100% benar.\n- Skor 15 (Sangat Baik): Menggunakan rumus & alur benar, terdapat kesalahan kecil pada hasil akhir angka.\n- Skor 10 (Cukup): Menuliskan rumus dasar & konsep awal dengan benar, langkah belum lengkap.\n- Skor 5 (Kurang): Hanya mencantumkan informasi yang diketahui tanpa analisis/perhitungan lanjut.\n- Skor 0: Tidak menjawab atau jawaban tidak relevan.\n\n`;
    }

    navigator.clipboard.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-6">
      {/* Header Bar */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-600 text-white rounded-xl shadow-xs">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Rubrik & Pedoman Penilaian Soal</h2>
            <p className="text-xs text-slate-500">
              Kriteria penskoran dan norma kelulusan untuk penilaian objektif & subjektif
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyRubrik}
          className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
          <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Rubrik Penilaian'}</span>
        </button>
      </div>

      {/* Formula Box */}
      <div className="mx-5 p-4 bg-purple-50/60 border border-purple-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 text-purple-700 rounded-xl shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-purple-950 uppercase tracking-wider">Formula Rumus Nilai Akhir (Skala 0 - 100)</h3>
            <p className="text-xs text-purple-800 mt-0.5">
              Nilai Akhir Siswa dikalkulasikan berdasarkan akumulasi perolehan skor objektif & uraian.
            </p>
          </div>
        </div>

        <div className="bg-white px-4 py-2 rounded-xl border border-purple-200 font-mono text-xs font-bold text-purple-900 shadow-2xs whitespace-nowrap">
          Nilai = ( Skor Perolehan / {totalSkor || 100} ) × 100
        </div>
      </div>

      {/* Scoring Rubric Cards */}
      <div className="px-5 space-y-5 pb-5">
        {/* Pilihan Ganda */}
        {hasPg && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-indigo-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900">1. Rubrik Pilihan Ganda (PG)</span>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                10 Poin / Soal
              </span>
            </div>
            <div className="p-4 text-xs text-slate-700 space-y-2">
              <div className="grid grid-cols-12 gap-2 font-semibold text-slate-500 pb-1 border-b border-slate-100">
                <div className="col-span-3">Kriteria Jawaban</div>
                <div className="col-span-2 text-center">Skor</div>
                <div className="col-span-7">Keterangan / Deskripsi Penilaian</div>
              </div>
              <div className="grid grid-cols-12 gap-2 items-center py-1">
                <div className="col-span-3 font-semibold text-emerald-700">Jawaban Tepat</div>
                <div className="col-span-2 text-center font-bold text-emerald-600 bg-emerald-50 py-1 rounded">10</div>
                <div className="col-span-7 text-slate-600">Siswa memilih opsi alfabet yang sesuai dengan kunci jawaban.</div>
              </div>
              <div className="grid grid-cols-12 gap-2 items-center py-1">
                <div className="col-span-3 font-semibold text-rose-700">Jawaban Salah / Kosong</div>
                <div className="col-span-2 text-center font-bold text-rose-600 bg-rose-50 py-1 rounded">0</div>
                <div className="col-span-7 text-slate-600">Siswa memilih opsi yang salah atau tidak menjawab.</div>
              </div>
            </div>
          </div>
        )}

        {/* Benar / Salah */}
        {hasTf && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-teal-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-teal-900">2. Rubrik Benar / Salah (TF)</span>
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-md">
                5 Poin / Soal
              </span>
            </div>
            <div className="p-4 text-xs text-slate-700 space-y-2">
              <div className="grid grid-cols-12 gap-2 font-semibold text-slate-500 pb-1 border-b border-slate-100">
                <div className="col-span-3">Kriteria Jawaban</div>
                <div className="col-span-2 text-center">Skor</div>
                <div className="col-span-7">Keterangan / Deskripsi Penilaian</div>
              </div>
              <div className="grid grid-cols-12 gap-2 items-center py-1">
                <div className="col-span-3 font-semibold text-emerald-700">Jawaban Tepat</div>
                <div className="col-span-2 text-center font-bold text-emerald-600 bg-emerald-50 py-1 rounded">5</div>
                <div className="col-span-7 text-slate-600">Siswa menentukan opsi Benar/Salah secara presisi sesuai kunci.</div>
              </div>
              <div className="grid grid-cols-12 gap-2 items-center py-1">
                <div className="col-span-3 font-semibold text-rose-700">Jawaban Salah / Kosong</div>
                <div className="col-span-2 text-center font-bold text-rose-600 bg-rose-50 py-1 rounded">0</div>
                <div className="col-span-7 text-slate-600">Pilihan bernilai salah atau tidak diisi.</div>
              </div>
            </div>
          </div>
        )}

        {/* Isian Singkat */}
        {hasIsian && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-amber-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">3. Rubrik Isian Singkat</span>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                10 Poin / Soal
              </span>
            </div>
            <div className="p-4 text-xs text-slate-700 space-y-2">
              <div className="grid grid-cols-12 gap-2 font-semibold text-slate-500 pb-1 border-b border-slate-100">
                <div className="col-span-3">Kriteria Jawaban</div>
                <div className="col-span-2 text-center">Skor</div>
                <div className="col-span-7">Keterangan / Deskripsi Penilaian</div>
              </div>
              <div className="grid grid-cols-12 gap-2 items-center py-1">
                <div className="col-span-3 font-semibold text-emerald-700">Tepat & Persis Kunci</div>
                <div className="col-span-2 text-center font-bold text-emerald-600 bg-emerald-50 py-1 rounded">10</div>
                <div className="col-span-7 text-slate-600">Siswa menuliskan frasa/angka tepat sesuai dengan kunci jawaban.</div>
              </div>
              <div className="grid grid-cols-12 gap-2 items-center py-1">
                <div className="col-span-3 font-semibold text-amber-700">Mendekati / Ejaan Sedikit Berbeda</div>
                <div className="col-span-2 text-center font-bold text-amber-600 bg-amber-50 py-1 rounded">5</div>
                <div className="col-span-7 text-slate-600">Jawaban memiliki makna sama meskipun sintaks/ejaan berbeda tipis.</div>
              </div>
              <div className="grid grid-cols-12 gap-2 items-center py-1">
                <div className="col-span-3 font-semibold text-rose-700">Salah / Kosong</div>
                <div className="col-span-2 text-center font-bold text-rose-600 bg-rose-50 py-1 rounded">0</div>
                <div className="col-span-7 text-slate-600">Jawaban tidak relevan atau tidak diisi.</div>
              </div>
            </div>
          </div>
        )}

        {/* Essai / Uraian */}
        {hasEssai && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-purple-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900">4. Rubrik Essai / Uraian Berjenjang</span>
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-md">
                20 Poin / Soal
              </span>
            </div>
            <div className="p-4 text-xs text-slate-700 space-y-2">
              <div className="grid grid-cols-12 gap-2 font-semibold text-slate-500 pb-1 border-b border-slate-100">
                <div className="col-span-3">Tingkat Capaian</div>
                <div className="col-span-2 text-center">Skor</div>
                <div className="col-span-7">Deskripsi Kriteria Perhitungan & Penjelasan</div>
              </div>

              <div className="grid grid-cols-12 gap-2 items-center py-1">
                <div className="col-span-3 font-semibold text-emerald-700">Sempurna (Sangat Baik)</div>
                <div className="col-span-2 text-center font-bold text-emerald-600 bg-emerald-50 py-1 rounded">20</div>
                <div className="col-span-7 text-slate-600">Langkah penyelesaian/hitung ditulis lengkap, runtut, konsep dan hasil akhir 100% benar.</div>
              </div>

              <div className="grid grid-cols-12 gap-2 items-center py-1">
                <div className="col-span-3 font-semibold text-indigo-700">Baik</div>
                <div className="col-span-2 text-center font-bold text-indigo-600 bg-indigo-50 py-1 rounded">15</div>
                <div className="col-span-7 text-slate-600">Menggunakan rumus & alur aljabar yang benar, terdapat kesalahan kecil pada perhitungan angka akhir.</div>
              </div>

              <div className="grid grid-cols-12 gap-2 items-center py-1">
                <div className="col-span-3 font-semibold text-amber-700">Cukup</div>
                <div className="col-span-2 text-center font-bold text-amber-600 bg-amber-50 py-1 rounded">10</div>
                <div className="col-span-7 text-slate-600">Menuliskan rumus dasar & pemahaman konsep awal dengan benar, namun alur langkah belum selesai.</div>
              </div>

              <div className="grid grid-cols-12 gap-2 items-center py-1">
                <div className="col-span-3 font-semibold text-orange-700">Kurang</div>
                <div className="col-span-2 text-center font-bold text-orange-600 bg-orange-50 py-1 rounded">5</div>
                <div className="col-span-7 text-slate-600">Hanya mencantumkan variabel/informasi awal yang diketahui dari soal tanpa perhitungan lanjut.</div>
              </div>

              <div className="grid grid-cols-12 gap-2 items-center py-1">
                <div className="col-span-3 font-semibold text-rose-700">Tidak Ada Jawaban</div>
                <div className="col-span-2 text-center font-bold text-rose-600 bg-rose-50 py-1 rounded">0</div>
                <div className="col-span-7 text-slate-600">Lembar jawaban dikosongkan atau jawaban tidak berhubungan sama sekali.</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center space-x-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>Rubrik ini dapat dicetak dan digunakan sebagai pedoman resmi koreksi bagi guru atau penguji ujian.</span>
      </div>
    </div>
  );
};
