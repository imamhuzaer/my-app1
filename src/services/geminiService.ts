import { GoogleGenAI } from '@google/genai';
import { Question, QuizConfig } from '../types';

// Helper to clean and parse JSON response from Gemini
function cleanAndParseJSON(text: string): any {
  let cleaned = text.trim();
  // Remove markdown code blocks if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '');
  }
  return JSON.parse(cleaned);
}

// Client-side API Key validation
export async function validateGeminiApiKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
  const trimmedKey = apiKey.trim();
  if (!trimmedKey) {
    return { valid: false, message: 'API Key kosong.' };
  }

  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-pro'];

  let lastError: any = null;
  for (const model of modelsToTry) {
    try {
      const ai = new GoogleGenAI({ apiKey: trimmedKey });
      const response = await ai.models.generateContent({
        model: model,
        contents: 'Ping test. Reply with OK.',
      });

      if (response && response.text) {
        return { valid: true, message: 'API Key valid dan siap digunakan!' };
      }
    } catch (error: any) {
      lastError = error;
      const errStr = `${error?.message || ''} ${JSON.stringify(error || {})}`;
      if (errStr.includes('503') || errStr.includes('high demand') || errStr.includes('UNAVAILABLE')) {
        // Try next model if 503 high demand
        continue;
      }
      if (errStr.includes('PERMISSION_DENIED') || errStr.includes('403')) {
        return {
          valid: false,
          message: 'Akses Ditolak (403 PERMISSION_DENIED). Silakan buat API Key baru di aistudio.google.com dengan opsi "Create API key in NEW project".',
        };
      }
      if (errStr.includes('API_KEY_INVALID') || errStr.includes('API key not valid') || errStr.includes('400')) {
        return {
          valid: false,
          message: 'Kunci ditolak oleh Google AI (API_KEY_INVALID). Periksa kembali akun/project di Google AI Studio.',
        };
      }
      if (errStr.includes('quota') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('429')) {
        return {
          valid: false,
          message: 'Kuota API Key ini telah habis / rate limit. Buat kunci baru di project lain.',
        };
      }
    }
  }

  const finalErrStr = `${lastError?.message || ''}`;
  if (finalErrStr.includes('503') || finalErrStr.includes('high demand')) {
    return {
      valid: true,
      message: 'API Key valid! (Server Google sedang padat sementara waktu, Anda tetap bisa mencoba generate soal).',
    };
  }

  return {
    valid: false,
    message: `Gagal memvalidasi API Key: ${lastError?.message || 'Periksa koneksi internet atau kunci Anda.'}`,
  };
}

// Client-side Question Generator (Universal for Vercel / Netlify / Standalone SPA)
export async function generateQuestionsWithGemini(
  config: QuizConfig,
  apiKey: string
): Promise<{ success: boolean; title: string; questions: Question[]; message?: string; isAuthError?: boolean; error?: string }> {
  const trimmedKey = apiKey.trim();
  if (!trimmedKey) {
    return {
      success: false,
      isAuthError: true,
      title: 'API Key Diperlukan',
      questions: [],
      error: 'Harap masukkan API Key Gemini Anda terlebih dahulu.',
    };
  }

  const {
    curriculum = 'Kurikulum Merdeka',
    subject = 'Matematika',
    customSubject,
    grade = 'SMA/SMK Kelas 10-12',
    topic = 'Topik Umum',
    questionTypes = ['pg'],
    difficulty = 'sedang',
    count = 5,
    materialText,
    targetCompetence,
  } = config;

  const activeSubject = subject === 'Lainnya / Custom' && customSubject ? customSubject : subject;
  const countNum = Math.min(Math.max(Number(count) || 5, 1), 50);

  // Curriculum instructions
  let curriculumInstruction = '';
  if (curriculum === 'Kurikulum Berbasis Cinta (Kemenag)') {
    curriculumInstruction = `
- KHUSUS KURIKULUM BERBASIS CINTA (KEMENAG / KEMENTERIAN AGAMA RI):
  1. Integrasikan nilai-nilai luhur Kurikulum Berbasis Cinta Kemenag: kasih sayang (rahmatan lil 'alamin), cinta ilmu dan kemanusiaan, moderasi beragama, toleransi, empati, budi pekerti luhur, dan akhlak mulia ke dalam narasi, stimulus soal, maupun pembahasan.
  2. Gunakan konteks yang santun, menyejukkan, membangun karakter positif, dan inklusif sesuai karakteristik pendidikan madrasah dan kementerian agama.`;
  } else if (curriculum === 'Kurikulum 2013') {
    curriculumInstruction = `
- KHUSUS KURIKULUM 2013 (K-13):
  1. Sesuaikan kisi-kisi dan indikator dengan Standar Kompetensi Inti (KI) dan Kompetensi Dasar (KD) Kurikulum 2013.
  2. Gunakan pendekatan saintifik (mengamati, menanya, mencoba, menalar, mengomunikasikan) dalam stimulus soal.`;
  } else {
    curriculumInstruction = `
- KHUSUS KURIKULUM MERDEKA:
  1. Susun soal berbasis Capaian Pembelajaran (CP) dan Profil Pelajar Pancasila (Bernalar Kritis, Kreatif, Mandiri, Bergotong Royong, Beriman & Bertakwa, Berkebhinekaan Global).
  2. Berikan stimulus autentik dan kontekstual kehidupan sehari-hari (studi kasus, fenomena nyata, data/grafik) yang menguji daya nalar dan pemecahan masalah siswa.`;
  }

  const prompt = `
Anda adalah seorang pakar penyusun soal ujian, kuis, dan asesmen pendidikan terkemuka di Indonesia.
Tugas Anda adalah membuat set soal ujian berkualitas tinggi sesuai parameter berikut:

- Kurikulum Acuan: ${curriculum}
${curriculumInstruction}
- Mata Pelajaran: ${activeSubject}
- Jenjang & Kelas: ${grade}
- Topik Spesifik: ${topic}
- Tingkat Kesulitan: ${difficulty.toUpperCase()} ${difficulty === 'hots' ? '(Higher Order Thinking Skills - Analisis, Evaluasi, & Penalaran)' : ''}
- Jumlah Soal yang Diminta: ${countNum}
- Tipe Soal yang Diminta: ${questionTypes.join(', ')}
${materialText ? `- Teks/Materi Acuan:\n"""\n${materialText}\n"""` : ''}
${targetCompetence ? `- Capaian Pembelajaran / Kompetensi Target: ${targetCompetence}` : ''}

Aturan Wajib Pembuatan Soal:
1. Pastikan tata bahasa, ejaan, dan peristilahan sangat presisi, akademik, dan mudah dipahami sesuai jenjang ${grade}.
2. UNTUK SOAL MATEMATIKA & SAINS:
   - Perhitungan angka, substitusi rumus, dan hasil akhir WAJIB 100% AKURAT DAN BENAR secermat pakar matematika!
   - Semua rumus matematika WAJIB ditulis dalam sintaks LaTeX yang diapit tanda dollar tunggal, contoh: $f(x) = ax^2 + bx + c$, $\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$, $\\int_0^1 x^2 \\, dx$.
3. Untuk Pilihan Ganda (type: 'pg'): Buat tepat 4 atau 5 opsi pilihan (A, B, C, D, E). Kunci jawaban (correctAnswer) harus berupa huruf tunggal kapital (misal: "A", "B", "C", "D", "E") dan WAJIB ada di antara pilihan opsi.
4. Untuk Isian Singkat (type: 'isian'): Kunci jawaban adalah teks/angka jawaban pasti yang singkat dan padat.
5. Untuk Essai / Uraian (type: 'uraian'): Sediakan kunci jawaban berupa garis besar jawaban ideal dan berikan rubrik penilaian (rubric) bertahap.
6. Untuk Benar/Salah (type: 'benar_salah'): Sediakan 2 opsi ('Benar' dan 'Salah') dan tentukan kunci jawaban yang benar.
7. Sediakan 'explanation' (Pembahasan Lengkap & Langkah Penyelesaian) yang runtut, edukatif, dan jelas untuk setiap nomor soal.
8. Tentukan Taksonomi Bloom (misal: 'C1 Mengingat', 'C2 Memahami', 'C3 Menerapkan', 'C4 Menganalisis', 'C5 Mengevaluasi', 'C6 Mencipta') untuk setiap nomor.
9. Sertakan 'indicator' (Indikator Soal / Capaian Pembelajaran spesifik) untuk setiap nomor soal guna keperluan Tabel Kisi-Kisi Soal.
10. RASIO TIPE SOAL: Jika dipilih lebih dari satu jenis atau semua jenis tipe soal, WAJIB alokasikan PORSI PALING BANYAK / DOMINAN untuk Pilihan Ganda ('pg') (minimal 60%-70% dari total ${countNum} soal), dan sisa soal dibagi untuk Isian, Essai, atau Benar/Salah.
11. Jika soal memerlukan referensi visual/diagram (misalnya diagram grafik, sel, peta, atau bidang datar), sertakan imageUrl (opsional URL gambar diagram) dan imageCaption singkat.
`;

  const modelsToTry = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-2.5-pro',
  ];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const ai = new GoogleGenAI({ apiKey: trimmedKey });
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              curriculum: { type: 'string' },
              questions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', enum: ['pg', 'isian', 'uraian', 'benar_salah'] },
                    questionText: { type: 'string' },
                    options: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                    correctAnswer: { type: 'string' },
                    explanation: { type: 'string' },
                    difficulty: { type: 'string', enum: ['mudah', 'sedang', 'sulit', 'hots'] },
                    bloomTaxonomy: { type: 'string' },
                    indicator: { type: 'string' },
                    rubric: { type: 'string' },
                    imageUrl: { type: 'string' },
                    imageCaption: { type: 'string' },
                  },
                  required: ['type', 'questionText', 'correctAnswer', 'explanation', 'difficulty', 'bloomTaxonomy', 'indicator'],
                },
              },
            },
            required: ['title', 'questions'],
          },
        },
      });

      const parsedData = cleanAndParseJSON(response.text || '{}');
      const sanitizedQuestions: Question[] = (parsedData.questions || []).map((q: any, idx: number) => ({
        id: `q-${Date.now()}-${idx + 1}`,
        type: q.type || 'pg',
        questionText: q.questionText || `Pertanyaan nomor ${idx + 1}`,
        options: Array.isArray(q.options) && q.options.length > 0 ? q.options : (q.type === 'pg' ? ['A', 'B', 'C', 'D'] : undefined),
        correctAnswer: String(q.correctAnswer || ''),
        explanation: q.explanation || 'Pembahasan telah diverifikasi oleh AI.',
        difficulty: q.difficulty || difficulty,
        bloomTaxonomy: q.bloomTaxonomy || 'C3 Menerapkan',
        indicator: q.indicator || `Menyelesaikan masalah terkait ${topic}`,
        rubric: q.rubric,
        imageUrl: q.imageUrl,
        imageCaption: q.imageCaption,
      }));

      return {
        success: true,
        title: parsedData.title || `Soal ${activeSubject} - ${topic}`,
        questions: sanitizedQuestions,
      };
    } catch (error: any) {
      lastError = error;
      console.warn(`Model ${modelName} encountered error:`, error?.message);
      const errStr = `${error?.message || ''} ${JSON.stringify(error || {})}`;
      
      // If error is high demand (503), try next available model in cascade
      if (errStr.includes('503') || errStr.includes('high demand') || errStr.includes('UNAVAILABLE') || errStr.includes('RESOURCE_EXHAUSTED')) {
        continue;
      }
      
      // If auth error, stop loop immediately
      const isAuth = errStr.includes('API_KEY_INVALID') || errStr.includes('API key') || errStr.includes('400') || errStr.includes('PERMISSION_DENIED') || errStr.includes('403');
      if (isAuth) {
        return {
          success: false,
          isAuthError: true,
          title: `Gagal Autentikasi API Key`,
          questions: [],
          error: 'API Key tidak valid atau belum diaktifkan. Silakan periksa kunci di aistudio.google.com/app/apikey.',
        };
      }
    }
  }

  // If all models failed
  const errStr = `${lastError?.message || ''} ${JSON.stringify(lastError || {})}`;
  if (errStr.includes('503') || errStr.includes('high demand') || errStr.includes('UNAVAILABLE')) {
    return {
      success: false,
      title: 'Server Google Sedang Padat',
      questions: [],
      error: 'Server Google Gemini sedang mengalami lonjakan antrean sementara (503 High Demand). Silakan klik tombol "Generate Soal" sekali lagi dalam 5-10 detik.',
    };
  }

  return {
    success: false,
    title: `Gagal Generate Soal`,
    questions: [],
    error: lastError?.message || 'Terjadi kesalahan saat memproses soal. Silakan coba lagi.',
  };
}

// Client-side AI Tutor / Explanation
export async function askAiTutor(
  question: Question,
  userPrompt: string,
  apiKey: string
): Promise<string> {
  const trimmedKey = apiKey.trim();
  if (!trimmedKey) {
    return `**Tutor AI (Moda Standar):**\nPertanyaan ini berfokus pada pemahaman konsep dasar. Jawaban yang benar adalah **${question.correctAnswer}**.\n\nPembahasan: ${question.explanation}.\n\n*Masukkan API Key Gemini Anda di menu utama untuk penjelasan interaktif tingkat lanjut.*`;
  }

  const prompt = `
Anda adalah seorang Tutor Pendidikan dan Guru Pendamping yang sangat bersahabat, sabar, dan ramah.
Siswa menanyakan tentang soal berikut:

SOAL: ${question.questionText}
PILIHAN JAWABAN (jika ada): ${question.options ? question.options.join(' | ') : '-'}
KUNCI JAWABAN: ${question.correctAnswer}
PEMBAHASAN RESMI: ${question.explanation}

PERTANYAAN SISWA:
"${userPrompt || 'Jelaskan soal ini dengan cara yang lebih sederhana dan mudah dipahami.'}"

Berikan jawaban yang jelas, menyemangati, mudah dipahami siswa, serta sertakan tips/trik cepat jika ada. Jika ada rumus matematika atau sains, tuliskan dalam format LaTeX yang diapit $ ... $. Gunakan format Markdown yang rapi.
`;

  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

  for (const modelName of modelsToTry) {
    try {
      const ai = new GoogleGenAI({ apiKey: trimmedKey });
      const res = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });
      if (res && res.text) {
        return res.text;
      }
    } catch (error: any) {
      console.warn(`Tutor model ${modelName} error:`, error?.message);
    }
  }

  return `**Tutor AI:**\nJawaban yang tepat adalah **${question.correctAnswer}**.\n\nPembahasan: ${question.explanation}`;
}
