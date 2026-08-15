import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI client lazily with optional custom user API key
  function getGeminiClient(customKey?: string) {
    const apiKey = customKey || process.env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.trim()) return null;
    return new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // API Endpoint: Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // API Endpoint: Generate Questions
  app.post('/api/generate-questions', async (req, res) => {
    try {
      const {
        apiKey: clientApiKey,
        curriculum = 'Kurikulum Merdeka',
        subject = 'Matematika',
        customSubject,
        grade = 'SMA/SMK Kelas 10-12',
        topic = 'Persamaan Kuadrat',
        materialText,
        questionTypes = ['pg', 'isian', 'essai'],
        difficulty = 'hots',
        count = 5,
        language = 'Indonesian',
        includeExplanations = true,
        targetCompetence,
      } = req.body;

      const userApiKey = clientApiKey || (req.headers['x-gemini-api-key'] as string) || '';
      const activeSubject = subject === 'Lainnya / Custom' && customSubject ? customSubject : subject;
      const countNum = Math.min(Math.max(Number(count) || 5, 1), 50);

      const ai = getGeminiClient(userApiKey);

      if (!ai) {
        console.warn('No Gemini API key provided. Using smart fallback generator.');
        const fallbackQuestions = generateFallbackQuestions(activeSubject, grade, topic, questionTypes, difficulty, countNum);
        return res.json({
          success: true,
          source: 'fallback',
          title: `Kuis ${activeSubject}: ${topic}`,
          curriculum,
          questions: fallbackQuestions,
          message: 'Menggunakan generator standar. Untuk hasil kustom berbasis AI Gemini, masukkan API Key Gemini Anda.',
        });
      }

      // Curriculum specific instructions
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
- Bahasa: ${language === 'English' ? 'English' : 'Bahasa Indonesia'}

Aturan Wajib Pembuatan Soal:
1. Pastikan tata bahasa, ejaan, dan peristilahan sangat presisi, akademik, dan mudah dipahami sesuai jenjang ${grade}.
2. UNTUK SOAL MATEMATIKA & SAINS:
   - Perhitungan angka, substitusi rumus, dan hasil akhir WAJIB 100% AKURAT DAN BENAR secermat pakar matematika!
   - Semua rumus, ekspresi, variabel, dan simbol matematika (misal persamaan, pecahan, akar, eksponen, integral, limit, matriks, trigonometri) WAJIB ditulis dalam sintaks LaTeX standar dan DIAPIT tanda dollar $ ... $ untuk inline (contoh: $f(x) = -5x^2 + 40x + 10$, $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$, $\\int_0^2 (3x^2 + 1) dx$) atau $$ ... $$ untuk blok rumus terpisah.
   - Opsi pilihan ganda dan kunci jawaban yang memuat angka/rumus juga WAJIB diapit tanda $ ... $ (misal: $x = 2$ atau $x = 3$).
3. Untuk Pilihan Ganda ('pg'), sertakan tepat 4 atau 5 opsi pilihan (A, B, C, D, atau E) beserta kunci jawaban yang benar ('A', 'B', 'C', 'D', atau 'E').
4. Untuk Benar/Salah ('tf'), sertakan 2 opsi: A. Benar, B. Salah, dengan kunci jawaban 'Benar' atau 'Salah'.
5. Untuk Isian Singkat ('isian'), buat pertanyaan yang membutuhkan jawaban singkat berupa angka, istilah, atau frasa tepat.
6. Untuk Essai ('essai'), buat pertanyaan uraian mendalam yang melatih kemampuan berpikir kritis.
7. Berikan pembahasan (explanation) yang sangat detail, runtut, dan edukatif langkah demi langkah untuk setiap nomor soal.
8. Tentukan Taksonomi Bloom (misal: 'C1 Mengingat', 'C2 Memahami', 'C3 Menerapkan', 'C4 Menganalisis', 'C5 Mengevaluasi', 'C6 Mencipta') untuk setiap nomor.
9. Sertakan 'indicator' (Indikator Soal / Capaian Pembelajaran spesifik) untuk setiap nomor soal guna keperluan Tabel Kisi-Kisi Soal.
10. RASIO TIPE SOAL: Jika dipilih lebih dari satu jenis atau semua jenis tipe soal, WAJIB alokasikan PORSI PALING BANYAK / DOMINAN untuk Pilihan Ganda ('pg') (minimal 60%-70% dari total ${countNum} soal), dan sisa soal dibagi untuk Isian, Essai, atau Benar/Salah.
11. Jika soal memerlukan referensi visual/diagram (misalnya diagram grafik, sel, peta, atau bidang datar), sertakan imageUrl (opsional URL gambar diagram) dan imageCaption singkat.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Judul kuis yang menarik dan profesional' },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    number: { type: Type.INTEGER },
                    type: { type: Type.STRING, description: 'Satu dari: pg, isian, essai, tf' },
                    questionText: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          key: { type: Type.STRING },
                          text: { type: Type.STRING },
                        },
                        required: ['key', 'text'],
                      },
                    },
                    correctAnswer: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    difficulty: { type: Type.STRING },
                    topic: { type: Type.STRING },
                    indicator: { type: Type.STRING, description: 'Indikator ketercapaian soal untuk tabel kisi-kisi' },
                    bloomsTaxonomy: { type: Type.STRING },
                    points: { type: Type.INTEGER },
                    imageUrl: { type: Type.STRING, description: 'URL gambar pendukung soal jika ada' },
                    imageCaption: { type: Type.STRING, description: 'Judul/keterangan gambar' },
                  },
                  required: ['number', 'type', 'questionText', 'correctAnswer', 'explanation', 'difficulty'],
                },
              },
            },
            required: ['title', 'questions'],
          },
        },
      });

      const responseText = response.text || '{}';
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse Gemini JSON output:', e);
        parsedData = {
          title: `Soal ${activeSubject} - ${topic}`,
          questions: generateFallbackQuestions(activeSubject, grade, topic, questionTypes, difficulty, countNum),
        };
      }

      // Ensure question ids and numbers are sanitized
      const sanitizedQuestions = (parsedData.questions || []).map((q: any, idx: number) => ({
        ...q,
        id: q.id || `gen-q-${Date.now()}-${idx + 1}`,
        number: idx + 1,
        type: ['pg', 'isian', 'essai', 'tf'].includes(q.type) ? q.type : 'pg',
        difficulty: q.difficulty || difficulty,
        points: q.points || (q.type === 'essai' ? 20 : 10),
      }));

      return res.json({
        success: true,
        source: 'gemini',
        curriculum,
        title: parsedData.title || `Soal ${activeSubject} - ${topic}`,
        questions: sanitizedQuestions,
      });
    } catch (error: any) {
      console.error('Error generating questions with Gemini:', error);
      const errString = `${error?.message || ''} ${JSON.stringify(error || {})}`;
      const isAuthError = (
        errString.includes('API_KEY_INVALID') ||
        errString.includes('API key not valid') ||
        errString.includes('API key') ||
        errString.includes('INVALID_ARGUMENT') ||
        errString.includes('quota') ||
        errString.includes('403') ||
        errString.includes('401')
      );

      // Graceful fallback response
      const fallbackQuestions = generateFallbackQuestions(
        req.body.subject || 'Matematika',
        req.body.grade || 'SMA',
        req.body.topic || 'Umum',
        req.body.questionTypes || ['pg', 'isian'],
        req.body.difficulty || 'sedang',
        req.body.count || 5
      );
      return res.json({
        success: !isAuthError,
        source: isAuthError ? 'auth_error' : 'fallback_error',
        isAuthError,
        title: `Soal ${req.body.subject || 'Umum'} - ${req.body.topic || 'Kuis'}`,
        questions: fallbackQuestions,
        error: isAuthError 
          ? `Gagal autentikasi API Key Gemini: Kunci tidak valid. Silakan buat atau periksa API Key Anda di aistudio.google.com/app/apikey.`
          : error.message,
      });
    }
  });

  // API Endpoint: Validate Gemini API Key
  app.post('/api/validate-key', async (req, res) => {
    try {
      const { apiKey } = req.body;
      if (!apiKey || !apiKey.trim()) {
        return res.json({ valid: false, message: 'API Key kosong.' });
      }

      const client = new GoogleGenAI({
        apiKey: apiKey.trim(),
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const testRes = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: 'Test connection: reply with OK',
      });

      if (testRes && testRes.text) {
        return res.json({ valid: true, message: 'API Key valid dan siap digunakan!' });
      }
      return res.json({ valid: false, message: 'Respon tidak sesuai dari server AI.' });
    } catch (err: any) {
      console.error('Validation error:', err);
      const msg = err.message || 'API Key tidak valid.';
      return res.json({
        valid: false,
        message: msg.includes('API_KEY_INVALID') || msg.includes('API key')
          ? 'API Key tidak valid atau belum diaktifkan di Google AI Studio.'
          : `Gagal memvalidasi API Key: ${msg}`,
      });
    }
  });

  // API Endpoint: AI Tutor / Explanation Assistant
  app.post('/api/ai-explain', async (req, res) => {
    try {
      const { apiKey: clientApiKey, questionText, options, correctAnswer, explanation, userPrompt } = req.body;
      const userApiKey = clientApiKey || (req.headers['x-gemini-api-key'] as string) || '';
      const ai = getGeminiClient(userApiKey);

      if (!ai) {
        return res.json({
          reply: `**Tutor AI (Moda Standar):**
Pertanyaan ini berfokus pada pemahaman konsep dasar. Jawaban yang benar adalah **${correctAnswer}**. Pembahasan ringkas: ${explanation}. Masukkan API Key Gemini Anda pada menu utama untuk penjelasan interaktif tingkat lanjut.`,
        });
      }

      const prompt = `
Anda adalah seorang Tutor Pendidikan dan Guru Pendamping yang sangat bersahabat, sabar, dan ramah.
Siswa menanyakan tentang soal berikut:

SOAL: ${questionText}
${options && options.length > 0 ? `OPSI JAWABAN:\n${options.map((o: any) => `${o.key}. ${o.text}`).join('\n')}` : ''}
KUNCI JAWABAN: ${correctAnswer}
PEMBAHASAN ASLI: ${explanation}

PERTANYAAN SISWA:
"${userPrompt || 'Jelaskan soal ini dengan cara yang lebih sederhana dan mudah dipahami.'}"

Berikan jawaban yang jelas, menyemangati, mudah dipahami siswa, serta sertakan tips/trik cepat jika ada. Jika ada rumus matematika atau sains, tuliskan dalam format LaTeX yang diapit $ ... $. Gunakan format Markdown yang rapi.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
      });

      return res.json({
        reply: response.text || 'Maaf, tidak dapat memproses penjelasan saat ini.',
      });
    } catch (err: any) {
      console.error('AI Explain error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // Serve static assets or mount Vite dev middleware
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

/**
 * Fallback questions builder when API key is not configured or network drops
 */
function generateFallbackQuestions(
  subject: string,
  grade: string,
  topic: string,
  types: string[],
  difficulty: string,
  count: number
) {
  const result: any[] = [];
  const primaryType = types[0] || 'pg';

  for (let i = 1; i <= count; i++) {
    const type = types[(i - 1) % types.length] || primaryType;

    if (type === 'pg') {
      result.push({
        id: `fb-q-${i}`,
        number: i,
        type: 'pg',
        questionText: `[Soal ${subject} - ${topic}] Berdasarkan konsep utama dalam materi ${topic} untuk jenjang ${grade}, manakah pernyataan berikut yang paling tepat terkait indikator nomor ${i}?`,
        options: [
          { key: 'A', text: `Prinsip dasar ${topic} berlaku secara universal sesuai teori standar.` },
          { key: 'B', text: `Aplikasi konsep ${topic} tidak memerlukan analisis variabel pendukung.` },
          { key: 'C', text: `Hukum utama ${topic} hanya berlaku pada kondisi ruang terisolasi.` },
          { key: 'D', text: `Pendekatan matematis dan analitis dalam ${topic} dapat diabaikan.` },
          { key: 'E', text: `Semua jawaban di atas tidak ada yang benar.` },
        ],
        correctAnswer: 'A',
        explanation: `Pembahasan Soal ${i}: Pernyataan A merupakan opsi paling tepat karena sesuai dengan standar teori ${topic} tingkat ${grade}.`,
        difficulty: difficulty,
        topic: topic,
        bloomsTaxonomy: 'C3 Menerapkan',
        points: 10,
      });
    } else if (type === 'tf') {
      result.push({
        id: `fb-q-${i}`,
        number: i,
        type: 'tf',
        questionText: `[Benar/Salah] Dalam konsep ${topic} pada mata pelajaran ${subject}, prinsip keterhubungan antar variabel merupakan faktor penentu utama hasil analisis.`,
        options: [
          { key: 'A', text: 'Benar' },
          { key: 'B', text: 'Salah' },
        ],
        correctAnswer: 'Benar',
        explanation: `Pembahasan Soal ${i}: Pernyataan tersebut BENAR karena sesuai dengan asas dasar materi ${topic}.`,
        difficulty: difficulty,
        topic: topic,
        bloomsTaxonomy: 'C2 Memahami',
        points: 5,
      });
    } else if (type === 'isian') {
      result.push({
        id: `fb-q-${i}`,
        number: i,
        type: 'isian',
        questionText: `Tuliskan istilah penting atau nilai kunci yang menjadi hukum utama dalam pembahasan topik ${topic}!`,
        correctAnswer: `Konsep Utama ${topic}`,
        explanation: `Pembahasan Soal ${i}: Istilah kunci yang dimaksud merujuk pada elemen terpenting dalam materi ${topic}.`,
        difficulty: difficulty,
        topic: topic,
        bloomsTaxonomy: 'C1 Mengingat',
        points: 10,
      });
    } else {
      result.push({
        id: `fb-q-${i}`,
        number: i,
        type: 'essai',
        questionText: `Jelaskan secara komprehensif latar belakang, mekanisme kerja, serta contoh penerapan praktis dari konsep ${topic} dalam kehidupan sehari-hari!`,
        correctAnswer: `Uraian analisis lengkap mencakup pengertian, mekanisme, dan contoh penerapan ${topic}.`,
        explanation: `Pembahasan Soal ${i}: Jawaban essai harus mencakup 3 aspek utama: (1) Definisi formal, (2) Tahapan proses, dan (3) Contoh konkret di lapangan.`,
        difficulty: difficulty,
        topic: topic,
        bloomsTaxonomy: 'C4 Menganalisis',
        points: 20,
      });
    }
  }

  return result;
}

startServer();
