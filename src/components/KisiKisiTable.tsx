import React from 'react';
import { Table, FileSpreadsheet, Copy, Check, Info } from 'lucide-react';
import { Question } from '../types';
import { MathRenderer } from './MathRenderer';

interface KisiKisiTableProps {
  quizTitle: string;
  subject?: string;
  grade?: string;
  topic?: string;
  questions: Question[];
}

export const KisiKisiTable: React.FC<KisiKisiTableProps> = ({
  quizTitle,
  subject,
  grade,
  topic,
  questions,
}) => {
  const [copied, setCopied] = React.useState(false);

  const getBentukText = (type: string) => {
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
        return 'Pilihan Ganda';
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'pg':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'isian':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'essai':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'tf':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleCopyTable = () => {
    let t = `TABEL KISI-KISI SOAL\nJudul: ${quizTitle}\nMata Pelajaran: ${subject || '-'}\nJenjang: ${grade || '-'}\nTopik: ${topic || '-'}\n\n`;
    t += `No\tIndikator Soal\tMateri\tBentuk Soal\tLevel Kognitif\tSkor Maks\n`;
    questions.forEach((q) => {
      const ind = q.indicator || `Dapat menyelesaikan soal mengenai ${q.topic || topic || 'materi'}`;
      t += `${q.number}\t${ind}\t${q.topic || topic || '-'}\t${getBentukText(q.type)}\t${q.bloomsTaxonomy || 'C3 Menerapkan'}\t${q.points || 10}\n`;
    });

    navigator.clipboard.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalSkor = questions.reduce((acc, q) => acc + (q.points || (q.type === 'essai' ? 20 : 10)), 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Header Bar */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Tabel Kisi-Kisi Soal (Blueprint)</h2>
            <p className="text-xs text-slate-500">
              Spesifikasi pemetaan indikator, materi, bentuk soal, & level kognitif
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyTable}
          className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
          <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Kisi-Kisi'}</span>
        </button>
      </div>

      {/* Info Metadata */}
      <div className="px-5 py-3 bg-indigo-50/40 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-700">
        <div>
          <span className="text-slate-400 block text-[11px]">Mata Pelajaran</span>
          <span className="font-semibold">{subject || 'Umum'}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Jenjang / Kelas</span>
          <span className="font-semibold">{grade || 'Umum'}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Jumlah Soal</span>
          <span className="font-semibold">{questions.length} Soal</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Total Skor Maksimal</span>
          <span className="font-semibold text-indigo-700">{totalSkor} Poin</span>
        </div>
      </div>

      {/* Table Content */}
      {questions.length === 0 ? (
        <div className="p-10 text-center text-slate-400 space-y-2">
          <Table className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-xs font-medium">Belum ada data kisi-kisi. Silakan generate soal terlebih dahulu.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 text-xs font-bold border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 min-w-[240px]">Indikator Soal / Capaian Pembelajaran</th>
                <th className="py-3 px-4 min-w-[150px]">Materi / Sub-Topik</th>
                <th className="py-3 px-4 min-w-[130px]">Bentuk Soal</th>
                <th className="py-3 px-4 min-w-[140px]">Level Kognitif</th>
                <th className="py-3 px-4 w-24 text-center">Skor Maks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs text-slate-800">
              {questions.map((q) => {
                const indicatorText = q.indicator || `Disajikan soal, siswa dapat menyelesaikan permasalahan terkait ${q.topic || topic || 'materi'}.`;
                const maxPoint = q.points || (q.type === 'essai' ? 20 : 10);

                return (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-slate-600">{q.number}</td>
                    <td className="py-3 px-4 leading-relaxed">
                      <MathRenderer text={indicatorText} />
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      <MathRenderer text={q.topic || topic || 'Materi Utama'} />
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-1 text-[11px] font-semibold border rounded-lg ${getBadgeColor(q.type)}`}>
                        {getBentukText(q.type)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-1 text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded-lg">
                        {q.bloomsTaxonomy || 'C3 Menerapkan'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-600">{maxPoint}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Info */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center space-x-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>Kisi-kisi disusun secara sistematis mengacu pada taksonomi Bloom (C1-C6) dan indikator kompetensi Kurikulum Merdeka.</span>
      </div>
    </div>
  );
};
