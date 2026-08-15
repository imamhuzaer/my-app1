import { Question, SavedQuiz } from '../types';
import { renderMathStringToHtml } from '../components/MathRenderer';

/**
 * Printable HTML export for PDF printing
 */
export function printQuizPDF(quiz: { title: string; subject: string; grade: string; questions: Question[] }, showAnswerKey: boolean = false) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up terblokir. Harap izinkan pop-up untuk mencetak PDF.');
    return;
  }

  const dateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>${quiz.title}</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
      <style>
        @page { size: A4; margin: 20mm; }
        body { font-family: Arial, Helvetica, sans-serif; color: #111; line-height: 1.5; font-size: 11pt; padding: 10px; }
        .header { text-align: center; border-bottom: 2px solid #222; padding-bottom: 12px; margin-bottom: 20px; }
        .header h1 { margin: 0 0 6px 0; font-size: 16pt; font-weight: bold; text-transform: uppercase; }
        .header p { margin: 2px 0; font-size: 10pt; color: #444; }
        .meta-table { width: 100%; margin-bottom: 20px; font-size: 10pt; border-collapse: collapse; }
        .meta-table td { padding: 4px 0; vertical-align: top; }
        .question-item { margin-bottom: 18px; page-break-inside: avoid; }
        .q-number { font-weight: bold; float: left; margin-right: 6px; }
        .q-text { margin-left: 24px; font-size: 11pt; }
        .options-list { margin-top: 8px; margin-left: 24px; list-style: none; padding-left: 0; }
        .options-list li { margin-bottom: 4px; font-size: 10.5pt; }
        .essay-box { margin-top: 10px; margin-left: 24px; border: 1px dashed #aaa; height: 80px; border-radius: 4px; }
        .page-break { page-break-before: always; }
        .answer-key-section { margin-top: 30px; border-top: 2px dashed #444; padding-top: 15px; }
        .badge { display: inline-block; font-size: 8pt; border: 1px solid #666; padding: 1px 5px; border-radius: 3px; font-weight: normal; margin-left: 8px; }
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="background:#f3f4f6; padding:10px 15px; margin-bottom:20px; border-radius:6px; font-size:13px; font-family:sans-serif; text-align:right;">
        <button onclick="window.print()" style="background:#2563eb; color:white; border:none; padding:8px 16px; border-radius:4px; cursor:pointer; font-weight:bold;">🖨️ Cetak / Simpan sebagai PDF</button>
      </div>

      <div class="header">
        <h1>NASKAH SOAL UJIAN / KUIS</h1>
        <p><strong>${quiz.title}</strong></p>
      </div>

      <table class="meta-table">
        <tr>
          <td width="15%"><strong>Mata Pelajaran</strong></td>
          <td width="35%">: ${quiz.subject}</td>
          <td width="15%"><strong>Hari / Tanggal</strong></td>
          <td width="35%">: ${dateStr}</td>
        </tr>
        <tr>
          <td><strong>Kelas / Tingkat</strong></td>
          <td>: ${quiz.grade}</td>
          <td><strong>Waktu</strong></td>
          <td>: 60 - 90 Menit</td>
        </tr>
        <tr>
          <td><strong>Nama Siswa</strong></td>
          <td>: ___________________________</td>
          <td><strong>Nomor Absen</strong></td>
          <td>: __________</td>
        </tr>
      </table>

      <hr style="border: 0.5px solid #ccc; margin-bottom: 20px;" />

      <div class="questions-container">
        ${quiz.questions.map((q) => `
          <div class="question-item">
            <div class="q-number">${q.number}.</div>
            <div class="q-text">
              ${renderMathStringToHtml(q.questionText)}
              <span class="badge">[${q.type.toUpperCase()} | ${q.difficulty.toUpperCase()}]</span>
            </div>

            ${q.imageUrl ? `
              <div style="margin-top:10px; margin-left:24px; margin-bottom:10px;">
                <img src="${q.imageUrl}" style="max-width:320px; max-height:220px; border:1px solid #ddd; border-radius:4px; padding:4px;" alt="Gambar Soal" />
                ${q.imageCaption ? `<div style="font-size:9pt; color:#666; font-style:italic; margin-top:2px;">Gambar ${q.number}: ${q.imageCaption}</div>` : ''}
              </div>
            ` : ''}

            ${q.type === 'pg' || q.type === 'tf' ? `
              <ul class="options-list">
                ${(q.options || []).map(opt => `
                  <li><strong>${opt.key}.</strong> ${renderMathStringToHtml(opt.text)}</li>
                `).join('')}
              </ul>
            ` : ''}

            ${q.type === 'isian' ? `
              <div style="margin-left:24px; margin-top:8px; font-size:10pt; color:#555;">Jawaban: ...........................................................................................................</div>
            ` : ''}

            ${q.type === 'essai' ? `
              <div class="essay-box"></div>
            ` : ''}
          </div>
        `).join('')}
      </div>

      ${showAnswerKey ? `
        <div class="page-break"></div>
        <div class="answer-key-section">
          <h2 style="text-align:center; text-transform:uppercase; font-size:14pt;">KUNCI JAWABAN & PEMBAHASAN</h2>
          <p style="text-align:center; font-size:10pt; color:#555;">${quiz.title}</p>
          <hr/>
          <ol style="margin-top:20px; line-height:1.6;">
            ${quiz.questions.map((q) => `
              <li style="margin-bottom:12px; page-break-inside:avoid;">
                <strong>Kunci Jawaban: ${renderMathStringToHtml(q.correctAnswer)}</strong>
                ${q.bloomsTaxonomy ? `<span style="font-size:9pt; color:#666;"> (${q.bloomsTaxonomy})</span>` : ''}
                <div style="background:#f8fafc; padding:8px 12px; border-left:3px solid #2563eb; margin-top:4px; font-size:10pt;">
                  <strong>Pembahasan:</strong> ${renderMathStringToHtml(q.explanation)}
                </div>
              </li>
            `).join('')}
          </ol>
        </div>
      ` : ''}

    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

/**
 * Print Kisi-Kisi Table as PDF / Printable document
 */
export function printKisiKisiPDF(quiz: { title: string; subject: string; grade: string; questions: Question[] }) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up terblokir. Harap izinkan pop-up untuk mencetak PDF.');
    return;
  }

  const dateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalSkor = quiz.questions.reduce((acc, q) => acc + (q.points || (q.type === 'essai' ? 20 : 10)), 0);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Kisi-Kisi Soal - ${quiz.title}</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
      <style>
        @page { size: A4 landscape; margin: 15mm; }
        body { font-family: Arial, sans-serif; font-size: 10pt; color: #111; line-height: 1.4; padding: 10px; }
        .header { text-align: center; border-bottom: 2px solid #222; padding-bottom: 8px; margin-bottom: 15px; }
        .header h1 { margin: 0; font-size: 14pt; text-transform: uppercase; }
        .meta { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 9.5pt; }
        .meta td { padding: 3px 0; }
        table.grid { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table.grid th, table.grid td { border: 1px solid #333; padding: 6px 8px; text-align: left; vertical-align: top; }
        table.grid th { background-color: #f1f5f9; font-weight: bold; font-size: 9.5pt; }
        .text-center { text-align: center; }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="no-print" style="text-align:right; margin-bottom:15px;">
        <button onclick="window.print()" style="background:#2563eb; color:white; border:none; padding:8px 16px; border-radius:4px; font-weight:bold; cursor:pointer;">🖨️ Cetak / Simpan PDF</button>
      </div>

      <div class="header">
        <h1>TABEL KISI-KISI & SPESIFIKASI SOAL (BLUEPRINT)</h1>
        <p style="margin:2px 0; font-weight:bold;">${quiz.title}</p>
      </div>

      <table class="meta">
        <tr>
          <td width="15%"><strong>Mata Pelajaran</strong></td>
          <td width="35%">: ${quiz.subject || 'Umum'}</td>
          <td width="15%"><strong>Hari / Tanggal</strong></td>
          <td width="35%">: ${dateStr}</td>
        </tr>
        <tr>
          <td><strong>Kelas / Tingkat</strong></td>
          <td>: ${quiz.grade || 'Umum'}</td>
          <td><strong>Total Skor Maks</strong></td>
          <td>: ${totalSkor} Poin</td>
        </tr>
      </table>

      <table class="grid">
        <thead>
          <tr>
            <th width="5%" class="text-center">No</th>
            <th width="35%">Indikator Soal / Capaian Pembelajaran</th>
            <th width="20%">Materi / Sub-Topik</th>
            <th width="15%">Bentuk Soal</th>
            <th width="15%">Level Kognitif</th>
            <th width="10%" class="text-center">Skor Maks</th>
          </tr>
        </thead>
        <tbody>
          ${quiz.questions.map((q) => `
            <tr>
              <td class="text-center"><strong>${q.number}</strong></td>
              <td>${renderMathStringToHtml(q.indicator || `Disajikan masalah, siswa dapat menyelesaikan soal tentang ${q.topic || 'materi'}.`)}</td>
              <td>${renderMathStringToHtml(q.topic || 'Materi Utama')}</td>
              <td>${q.type === 'pg' ? 'Pilihan Ganda' : q.type === 'isian' ? 'Isian Singkat' : q.type === 'essai' ? 'Essai / Uraian' : 'Benar / Salah'}</td>
              <td>${q.bloomsTaxonomy || 'C3 Menerapkan'}</td>
              <td class="text-center"><strong>${q.points || (q.type === 'essai' ? 20 : 10)}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

/**
 * Print Rubrik Penilaian as PDF / Printable document
 */
export function printRubrikPDF(quiz: { title: string; questions: Question[] }) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up terblokir. Harap izinkan pop-up untuk mencetak PDF.');
    return;
  }

  const totalSkor = quiz.questions.reduce((acc, q) => acc + (q.points || (q.type === 'essai' ? 20 : 10)), 0);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Rubrik Penilaian - ${quiz.title}</title>
      <style>
        @page { size: A4 portrait; margin: 20mm; }
        body { font-family: Arial, sans-serif; font-size: 10.5pt; color: #111; line-height: 1.5; padding: 10px; }
        .header { text-align: center; border-bottom: 2px solid #222; padding-bottom: 8px; margin-bottom: 15px; }
        .header h1 { margin: 0; font-size: 14pt; text-transform: uppercase; }
        .formula-box { background: #f3e8ff; border: 1px solid #c084fc; padding: 10px 15px; border-radius: 6px; font-weight: bold; text-align: center; margin-bottom: 20px; }
        .rubrik-block { margin-bottom: 20px; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; page-break-inside: avoid; }
        .rubrik-title { background: #f1f5f9; padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #cbd5e1; font-size: 11pt; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #e2e8f0; padding: 6px 10px; text-align: left; font-size: 10pt; }
        th { background: #f8fafc; font-weight: bold; }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="no-print" style="text-align:right; margin-bottom:15px;">
        <button onclick="window.print()" style="background:#2563eb; color:white; border:none; padding:8px 16px; border-radius:4px; font-weight:bold; cursor:pointer;">🖨️ Cetak / Simpan PDF</button>
      </div>

      <div class="header">
        <h1>RUBRUK & PEDOMAN PENILAIAN UJIAN</h1>
        <p style="margin:2px 0; font-weight:bold;">${quiz.title}</p>
      </div>

      <div class="formula-box">
        RUMUS NILAI AKHIR (SKALA 0 - 100) = ( TOTAL SKOR PEROLEHAN / ${totalSkor} ) × 100
      </div>

      <div class="rubrik-block">
        <div class="rubrik-title">1. Rubrik Penilaian Pilihan Ganda & Benar-Salah</div>
        <table>
          <thead>
            <tr><th>Bentuk Soal</th><th>Jawaban Tepat</th><th>Jawaban Salah / Kosong</th></tr>
          </thead>
          <tbody>
            <tr><td>Pilihan Ganda</td><td>Skor Penuh (10 Poin)</td><td>0 Poin</td></tr>
            <tr><td>Benar / Salah</td><td>Skor Penuh (5 Poin)</td><td>0 Poin</td></tr>
            <tr><td>Isian Singkat</td><td>Skor Penuh (10 Poin - Tepat) / 5 Poin (Sebagian)</td><td>0 Poin</td></tr>
          </tbody>
        </table>
      </div>

      <div class="rubrik-block">
        <div class="rubrik-title">2. Rubrik Penilaian Uraian / Essai (Skor Maksimal 20 Poin per Soal)</div>
        <table>
          <thead>
            <tr><th width="20%">Kriteria Capaian</th><th width="15%">Skor</th><th>Deskripsi Kualitatif</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Sempurna</strong></td><td><strong>20</strong></td><td>Perhitungan & alur konsep ditulis sangat lengkap, runtut, dan hasil akhir 100% benar.</td></tr>
            <tr><td><strong>Sangat Baik</strong></td><td><strong>15</strong></td><td>Menggunakan rumus & alur benar, terdapat kesalahan kecil pada perhitungan angka akhir.</td></tr>
            <tr><td><strong>Cukup</strong></td><td><strong>10</strong></td><td>Menuliskan rumus dasar & fakta utama dengan benar, langkah belum lengkap.</td></tr>
            <tr><td><strong>Kurang</strong></td><td><strong>5</strong></td><td>Hanya mencantumkan variabel/informasi awal tanpa analisis lanjut.</td></tr>
            <tr><td><strong>Tidak Menjawab</strong></td><td><strong>0</strong></td><td>Jawaban dikosongkan atau salah total.</td></tr>
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

/**
 * Plain Text / Markdown Export
 */
export function exportToText(quiz: { title: string; subject: string; grade: string; questions: Question[] }, includeAnswers: boolean = true): string {
  let text = `==================================================\n`;
  text += `${quiz.title.toUpperCase()}\n`;
  text += `Mata Pelajaran: ${quiz.subject} | Tingkat: ${quiz.grade}\n`;
  text += `==================================================\n\n`;

  quiz.questions.forEach((q) => {
    text += `${q.number}. ${q.questionText}\n`;
    if (q.options && q.options.length > 0) {
      q.options.forEach((opt) => {
        text += `   ${opt.key}. ${opt.text}\n`;
      });
    }
    text += `\n`;
  });

  if (includeAnswers) {
    text += `\n==================================================\n`;
    text += `KUNCI JAWABAN & PEMBAHASAN\n`;
    text += `==================================================\n\n`;

    quiz.questions.forEach((q) => {
      text += `${q.number}. Kunci: ${q.correctAnswer}\n`;
      text += `   Pembahasan: ${q.explanation}\n\n`;
    });
  }

  return text;
}

/**
 * CSV Export for Google Forms / LMS
 */
export function exportToCSV(quiz: { title: string; questions: Question[] }) {
  let csv = 'No,Tipe Soal,Pertanyaan,Opsi A,Opsi B,Opsi C,Opsi D,Opsi E,Kunci Jawaban,Pembahasan\n';

  quiz.questions.forEach((q) => {
    const opts = { A: '', B: '', C: '', D: '', E: '' };
    if (q.options) {
      q.options.forEach((o) => {
        if (o.key in opts) {
          opts[o.key as keyof typeof opts] = o.text.replace(/"/g, '""');
        }
      });
    }

    const qText = `"${q.questionText.replace(/"/g, '""')}"`;
    const qAnswer = `"${q.correctAnswer.replace(/"/g, '""')}"`;
    const qExpl = `"${q.explanation.replace(/"/g, '""')}"`;

    csv += `${q.number},"${q.type}",${qText},"${opts.A}","${opts.B}","${opts.C}","${opts.D}","${opts.E}",${qAnswer},${qExpl}\n`;
  });

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${quiz.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_soal.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * JSON File Export
 */
export function exportToJSON(quiz: SavedQuiz) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(quiz, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${quiz.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Microsoft Word (.doc) Export with Equations & Images
 */
export function exportToWord(quiz: { title: string; subject: string; grade: string; questions: Question[] }, includeAnswerKey: boolean = true) {
  const dateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Helper to format equations for Word
  const formatWordText = (text: string) => {
    if (!text) return '';
    const renderedHtml = renderMathStringToHtml(text);
    return `<span style="font-family:'Cambria Math', 'Times New Roman', serif;">${renderedHtml}</span>`;
  };

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns:m='http://schemas.openxmlformats.org/officeDocument/2006/math'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${quiz.title}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page { size: 21cm 29.7cm; margin: 2.5cm 2cm 2.5cm 2cm; }
        body { font-family: 'Calibri', 'Times New Roman', serif; font-size: 11pt; color: #000000; line-height: 1.35; }
        h1 { font-size: 14pt; text-align: center; font-weight: bold; margin-bottom: 2pt; text-transform: uppercase; }
        h2 { font-size: 12pt; text-align: center; font-weight: bold; margin-top: 15pt; margin-bottom: 6pt; text-transform: uppercase; }
        p.subtitle { text-align: center; font-size: 11pt; font-weight: bold; margin-top: 0; margin-bottom: 12pt; }
        table.meta { width: 100%; border-collapse: collapse; margin-bottom: 12pt; font-size: 10.5pt; }
        table.meta td { padding: 3pt 0; vertical-align: top; }
        .divider { border-bottom: 1.5pt solid #000000; margin-bottom: 14pt; }
        .q-container { margin-bottom: 12pt; page-break-inside: avoid; }
        .q-number { font-weight: bold; float: left; width: 24pt; }
        .q-body { margin-left: 24pt; }
        .q-image { margin-top: 6pt; margin-bottom: 8pt; text-align: left; }
        .q-image img { max-width: 320px; max-height: 220px; border: 0.5pt solid #666; }
        .q-caption { font-size: 9pt; color: #444; font-style: italic; margin-top: 2pt; }
        .options-table { margin-top: 4pt; margin-left: 24pt; width: 100%; border-collapse: collapse; }
        .options-table td { padding: 2pt 4pt 2pt 0; vertical-align: top; font-size: 10.5pt; }
        .essay-space { border: 0.5pt dashed #888888; height: 60pt; margin-top: 6pt; margin-left: 24pt; border-radius: 4pt; }
        .answer-key-box { background-color: #f2f4f8; border-left: 3.5pt solid #1a56db; padding: 6pt 10pt; margin-top: 4pt; font-size: 10pt; }
        .badge-type { font-size: 8pt; color: #444; border: 0.5pt solid #888; padding: 1pt 3pt; border-radius: 2pt; }
      </style>
    </head>
    <body>
      <h1>NASKAH SOAL UJIAN / KUIS</h1>
      <p class="subtitle">${quiz.title}</p>

      <table class="meta">
        <tr>
          <td width="18%"><strong>Mata Pelajaran</strong></td>
          <td width="32%">: ${quiz.subject}</td>
          <td width="18%"><strong>Hari / Tanggal</strong></td>
          <td width="32%">: ${dateStr}</td>
        </tr>
        <tr>
          <td><strong>Kelas / Tingkat</strong></td>
          <td>: ${quiz.grade}</td>
          <td><strong>Alokasi Waktu</strong></td>
          <td>: 60 - 90 Menit</td>
        </tr>
        <tr>
          <td><strong>Nama Siswa</strong></td>
          <td>: ___________________________</td>
          <td><strong>Nomor Absen</strong></td>
          <td>: __________</td>
        </tr>
      </table>

      <div class="divider"></div>

      <!-- DAFTAR SOAL -->
      ${quiz.questions.map((q) => `
        <div class="q-container">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr>
              <td width="24" valign="top" style="font-weight:bold;">${q.number}.</td>
              <td valign="top">
                <div>
                  ${formatWordText(q.questionText)}
                  <span class="badge-type">[${q.type.toUpperCase()}]</span>
                </div>

                ${q.imageUrl ? `
                  <div class="q-image">
                    <img src="${q.imageUrl}" alt="Gambar Soal ${q.number}" />
                    ${q.imageCaption ? `<div class="q-caption">Gambar ${q.number}: ${q.imageCaption}</div>` : ''}
                  </div>
                ` : ''}

                ${q.type === 'pg' || q.type === 'tf' ? `
                  <table class="options-table">
                    ${(q.options || []).map((opt) => `
                      <tr>
                        <td width="20" style="font-weight:bold;">${opt.key}.</td>
                        <td>${formatWordText(opt.text)}</td>
                      </tr>
                    `).join('')}
                  </table>
                ` : ''}

                ${q.type === 'isian' ? `
                  <div style="margin-top:6pt; font-size:10pt; color:#444;">Jawaban: ............................................................................................................................</div>
                ` : ''}

                ${q.type === 'essai' ? `
                  <div class="essay-space"></div>
                ` : ''}
              </td>
            </tr>
          </table>
        </div>
      `).join('')}

      <!-- KUNCI JAWABAN & PEMBAHASAN -->
      ${includeAnswerKey ? `
        <br style="page-break-before:always;" />
        <h2>KUNCI JAWABAN & PEMBAHASAN DETAIL</h2>
        <p style="text-align:center; font-size:10pt; color:#444; margin-bottom:14pt;">${quiz.title}</p>
        <div class="divider"></div>

        ${quiz.questions.map((q) => `
          <div style="margin-bottom:12pt; page-break-inside:avoid;">
            <p style="margin:0; font-weight:bold; font-size:11pt;">
              ${q.number}. Kunci Jawaban: <span style="color:#0f766e;">${q.correctAnswer}</span>
              ${q.bloomsTaxonomy ? `<span style="font-size:9pt; font-weight:normal; color:#666;"> (${q.bloomsTaxonomy})</span>` : ''}
            </p>
            <div class="answer-key-box">
              <strong>Pembahasan:</strong><br/>
              ${formatWordText(q.explanation)}
            </div>
          </div>
        `).join('')}
      ` : ''}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + wordHtml], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = `${quiz.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_soal.doc`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

/**
 * Export Kisi-Kisi Table as Microsoft Word (.doc)
 */
export function exportKisiKisiWord(quiz: { title: string; subject: string; grade: string; questions: Question[] }) {
  const dateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalSkor = quiz.questions.reduce((acc, q) => acc + (q.points || (q.type === 'essai' ? 20 : 10)), 0);

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Kisi-Kisi Soal - ${quiz.title}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:Orientation>Landscape</w:Orientation>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page { size: 29.7cm 21cm; margin: 2cm 2cm 2cm 2cm; }
        body { font-family: 'Calibri', 'Times New Roman', serif; font-size: 11pt; color: #000; line-height: 1.3; }
        h1 { font-size: 14pt; text-align: center; font-weight: bold; margin-bottom: 4pt; text-transform: uppercase; }
        p.subtitle { text-align: center; font-size: 11pt; font-weight: bold; margin-top: 0; margin-bottom: 12pt; }
        table.meta { width: 100%; border-collapse: collapse; margin-bottom: 12pt; font-size: 10.5pt; }
        table.meta td { padding: 3pt 0; vertical-align: top; }
        table.grid { width: 100%; border-collapse: collapse; margin-top: 10pt; }
        table.grid th, table.grid td { border: 1pt solid #000; padding: 5pt 6pt; text-align: left; vertical-align: top; font-size: 10pt; }
        table.grid th { background-color: #f2f4f8; font-weight: bold; text-align: center; }
        .text-center { text-align: center; }
      </style>
    </head>
    <body>
      <h1>TABEL KISI-KISI & SPESIFIKASI SOAL (BLUEPRINT)</h1>
      <p class="subtitle">${quiz.title}</p>

      <table class="meta">
        <tr>
          <td width="18%"><strong>Mata Pelajaran</strong></td>
          <td width="32%">: ${quiz.subject || 'Umum'}</td>
          <td width="18%"><strong>Hari / Tanggal</strong></td>
          <td width="32%">: ${dateStr}</td>
        </tr>
        <tr>
          <td><strong>Kelas / Tingkat</strong></td>
          <td>: ${quiz.grade || 'Umum'}</td>
          <td><strong>Total Skor Maksimal</strong></td>
          <td>: ${totalSkor} Poin</td>
        </tr>
      </table>

      <table class="grid">
        <thead>
          <tr>
            <th width="5%">No</th>
            <th width="35%">Indikator Soal / Capaian Pembelajaran</th>
            <th width="20%">Materi / Sub-Topik</th>
            <th width="15%">Bentuk Soal</th>
            <th width="15%">Level Kognitif</th>
            <th width="10%">Skor Maks</th>
          </tr>
        </thead>
        <tbody>
          ${quiz.questions.map((q) => `
            <tr>
              <td class="text-center"><strong>${q.number}</strong></td>
              <td>${q.indicator || `Disajikan masalah, siswa dapat menyelesaikan soal tentang ${q.topic || 'materi'}.`}</td>
              <td>${q.topic || 'Materi Utama'}</td>
              <td>${q.type === 'pg' ? 'Pilihan Ganda' : q.type === 'isian' ? 'Isian Singkat' : q.type === 'essai' ? 'Essai / Uraian' : 'Benar / Salah'}</td>
              <td>${q.bloomsTaxonomy || 'C3 Menerapkan'}</td>
              <td class="text-center"><strong>${q.points || (q.type === 'essai' ? 20 : 10)}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + wordHtml], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = `${quiz.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_kisi_kisi.doc`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

/**
 * Export Rubrik Penilaian Table as Microsoft Word (.doc)
 */
export function exportRubrikWord(quiz: { title: string; questions: Question[] }) {
  const totalSkor = quiz.questions.reduce((acc, q) => acc + (q.points || (q.type === 'essai' ? 20 : 10)), 0);

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Rubrik Penilaian - ${quiz.title}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page { size: 21cm 29.7cm; margin: 2.5cm 2cm 2.5cm 2cm; }
        body { font-family: 'Calibri', 'Times New Roman', serif; font-size: 11pt; color: #000; line-height: 1.4; }
        h1 { font-size: 14pt; text-align: center; font-weight: bold; margin-bottom: 4pt; text-transform: uppercase; }
        p.subtitle { text-align: center; font-size: 11pt; font-weight: bold; margin-top: 0; margin-bottom: 12pt; }
        .formula-box { background-color: #f3e8ff; border: 1pt solid #a855f7; padding: 10pt; font-weight: bold; text-align: center; margin-bottom: 16pt; }
        .rubrik-title { background-color: #f1f5f9; padding: 6pt 10pt; font-weight: bold; border: 1pt solid #cbd5e1; font-size: 11pt; margin-top: 14pt; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 12pt; }
        th, td { border: 1pt solid #000; padding: 6pt 8pt; text-align: left; font-size: 10pt; }
        th { background-color: #f8fafc; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>RUBRIK & PEDOMAN PENILAIAN UJIAN</h1>
      <p class="subtitle">${quiz.title}</p>

      <div class="formula-box">
        RUMUS NILAI AKHIR (SKALA 0 - 100) = ( TOTAL SKOR PEROLEHAN / ${totalSkor} ) × 100
      </div>

      <div class="rubrik-title">1. Rubrik Penilaian Pilihan Ganda, Benar-Salah, & Isian</div>
      <table>
        <thead>
          <tr><th>Bentuk Soal</th><th>Jawaban Tepat</th><th>Jawaban Salah / Kosong</th></tr>
        </thead>
        <tbody>
          <tr><td>Pilihan Ganda</td><td>Skor Penuh (10 Poin)</td><td>0 Poin</td></tr>
          <tr><td>Benar / Salah</td><td>Skor Penuh (5 Poin)</td><td>0 Poin</td></tr>
          <tr><td>Isian Singkat</td><td>Skor Penuh (10 Poin - Tepat) / 5 Poin (Sebagian)</td><td>0 Poin</td></tr>
        </tbody>
      </table>

      <div class="rubrik-title">2. Rubrik Penilaian Uraian / Essai (Skor Maksimal 20 Poin per Soal)</div>
      <table>
        <thead>
          <tr><th width="20%">Kriteria Capaian</th><th width="15%">Skor</th><th>Deskripsi Kualitatif</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>Sempurna</strong></td><td><strong>20</strong></td><td>Perhitungan & alur konsep ditulis sangat lengkap, runtut, dan hasil akhir 100% benar.</td></tr>
          <tr><td><strong>Sangat Baik</strong></td><td><strong>15</strong></td><td>Menggunakan rumus & alur benar, terdapat kesalahan kecil pada perhitungan angka akhir.</td></tr>
          <tr><td><strong>Cukup</strong></td><td><strong>10</strong></td><td>Menuliskan rumus dasar & fakta utama dengan benar, langkah belum lengkap.</td></tr>
          <tr><td><strong>Kurang</strong></td><td><strong>5</strong></td><td>Hanya mencantumkan variabel/informasi awal tanpa analisis lanjut.</td></tr>
          <tr><td><strong>Tidak Menjawab</strong></td><td><strong>0</strong></td><td>Jawaban dikosongkan atau salah total.</td></tr>
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + wordHtml], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = `${quiz.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_rubrik.doc`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

/**
 * Generate Google Apps Script code to auto-create Google Form
 * Includes Section 1: Identitas Siswa (Nama & Kelas), Section 2: Soal, Section 3: Submit.
 * Adds userEmail as owner/editor!
 */
export function generateGoogleAppsScript(quiz: { title: string; subject: string; grade: string; questions: Question[] }, userEmail: string): string {
  const emailStr = userEmail.trim();

  let script = `/**
 * GOOGLE APPS SCRIPT - AUTO CREATE GOOGLE FORM KUIS
 * Judul: ${quiz.title}
 * Ditujukan untuk Email Editor: ${emailStr}
 * 
 * CARA MENGGUNAKAN:
 * 1. Buka https://script.new di browser Anda.
 * 2. Hapus semua kode lama, lalu Paste (Tempel) seluruh kode di bawah ini.
 * 3. Klik tombol "Run" (▶) di bagian atas script.
 * 4. Berikan izin akses Google Forms.
 * 5. Form Kuis akan otomatis dibuat di Google Drive Anda!
 */

function buatGoogleFormKuis() {
  var title = ${JSON.stringify(quiz.title)};
  var userEmail = ${JSON.stringify(emailStr)};

  // 1. Buat Google Form baru
  var form = FormApp.create(title);
  form.setDescription("Asesmen Pembelajaran " + ${JSON.stringify(quiz.subject || 'Mata Pelajaran')} + " - Kelas " + ${JSON.stringify(quiz.grade || 'Umum')} + "\\nHarap kerjakan dengan jujur dan teliti.");
  form.setIsQuiz(true); // Aktifkan mode kuis otomatis
  form.setAllowResponseEdits(false);
  form.setLimitToOneResponsePerUser(false);

  // SECTION 1: IDENTITAS SISWA
  form.setTitle(title);
  
  var nameItem = form.addTextItem();
  nameItem.setTitle("Nama Lengkap Siswa")
          .setHelpText("Masukkan nama lengkap sesuai presensi kelas")
          .setRequired(true);

  var classItem = form.addTextItem();
  classItem.setTitle("Kelas / Rombel")
          .setHelpText("Contoh: Kelas 10 IPA 1, Kelas 7B, dll.")
          .setRequired(true);

  var absNumItem = form.addTextItem();
  absNumItem.setTitle("Nomor Absen")
          .setRequired(false);

  // SECTION 2: NASKAH SOAL UJIAN
  form.addPageBreakItem()
      .setTitle("SECTION 2: NASKAH SOAL & PERTANYAAN")
      .setHelpText("Pilihlah jawaban yang paling benar atau ketikkan jawaban secara lengkap.");

`;

  quiz.questions.forEach((q, idx) => {
    const qNum = q.number || idx + 1;
    const cleanQText = (q.questionText || '').replace(/\n/g, '\\n');

    if (q.type === 'pg' || q.type === 'tf') {
      script += `  // Soal No ${qNum} (${q.type.toUpperCase()})\n`;
      script += `  var item${qNum} = form.addMultipleChoiceItem();\n`;
      script += `  item${qNum}.setTitle("${qNum}. ${cleanQText.replace(/"/g, '\\"')}")\n`;
      script += `          .setPoints(${q.points || 10})\n`;
      script += `          .setRequired(true);\n`;
      script += `  var choices${qNum} = [];\n`;

      if (q.options && q.options.length > 0) {
        q.options.forEach((opt) => {
          const isCorrect = (opt.key === q.correctAnswer) || (opt.text.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase());
          const cleanOptText = opt.text.replace(/"/g, '\\"').replace(/\n/g, ' ');
          script += `  choices${qNum}.push(item${qNum}.createChoice("${opt.key}. ${cleanOptText}", ${isCorrect}));\n`;
        });
      }
      script += `  item${qNum}.setChoices(choices${qNum});\n\n`;
    } else {
      // Isian / Essai
      script += `  // Soal No ${qNum} (${q.type.toUpperCase()})\n`;
      script += `  var item${qNum} = form.addParagraphTextItem();\n`;
      script += `  item${qNum}.setTitle("${qNum}. ${cleanQText.replace(/"/g, '\\"')}")\n`;
      script += `          .setHelpText("Kunci Jawaban Acuan: ${(q.correctAnswer || '').replace(/"/g, '\\"')}")\n`;
      script += `          .setPoints(${q.points || (q.type === 'essai' ? 20 : 10)})\n`;
      script += `          .setRequired(true);\n\n`;
    }
  });

  script += `  // SECTION 3: SUBMIT JAWABAN
  form.addPageBreakItem()
      .setTitle("SECTION 3: PENYERAHAN / SUBMIT JAWABAN")
      .setHelpText("Terima kasih telah menyelesaikan ujian ini. Periksa kembali jawaban Anda pada Section 2 sebelum mengklik tombol Submit di bawah.");

  // Tambahkan Email User sebagai Editor Utama
  if (userEmail && userEmail.indexOf("@") !== -1) {
    try {
      form.addEditor(userEmail);
      Logger.log("Akses Editor berhasil ditambahkan untuk email: " + userEmail);
    } catch (e) {
      Logger.log("Catatan penambahan editor: " + e.toString());
    }
  }

  var editUrl = form.getEditUrl();
  var pubUrl = form.getPublishedUrl();

  Logger.log("====================================================");
  Logger.log("BERHASIL! Google Form Kuis Telah Dibuat:");
  Logger.log("Link Edit Form (Editor): " + editUrl);
  Logger.log("Link Bagikan ke Siswa: " + pubUrl);
  Logger.log("====================================================");
}
`;

  return script;
}

export function downloadGoogleAppsScript(quiz: { title: string; subject: string; grade: string; questions: Question[] }, userEmail: string) {
  const scriptContent = generateGoogleAppsScript(quiz, userEmail);
  const blob = new Blob([scriptContent], { type: 'text/javascript;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = `buat_google_form_${quiz.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.gs`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}


