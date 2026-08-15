export type QuestionType = 'pg' | 'isian' | 'essai' | 'tf';
// pg: Pilihan Ganda, isian: Isian Singkat, essai: Essai/Uraian, tf: Benar/Salah

export type Difficulty = 'mudah' | 'sedang' | 'sulit' | 'hots';

export type EducationLevel = 'SD' | 'SMP' | 'SMA/SMK' | 'Perguruan Tinggi' | 'Umum';

export type GradeLevel = string;

export type Curriculum = 
  | 'Kurikulum Merdeka' 
  | 'Kurikulum 2013' 
  | 'Kurikulum Berbasis Cinta (Kemenag)';

export type Subject = 
  | 'Matematika' 
  | 'Bahasa Indonesia' 
  | 'Bahasa Inggris' 
  | 'IPA (Fisika, Kimia, Biologi)' 
  | 'IPS (Sejarah, Geografi, Ekonomi)' 
  | 'Informatika & Pemrograman' 
  | 'PPKn & Pancasila' 
  | 'Lainnya / Custom';

export interface QuestionOption {
  key: string; // 'A', 'B', 'C', 'D', 'E'
  text: string;
}

export interface Question {
  id: string;
  number: number;
  type: QuestionType;
  questionText: string;
  options?: QuestionOption[]; // Required for 'pg' and 'tf'
  correctAnswer: string; // Option key like 'A' or exact answer text or 'Benar'/'Salah'
  explanation: string; // Pembahasan detail
  difficulty: Difficulty;
  topic?: string;
  indicator?: string; // Indikator Soal untuk Kisi-Kisi
  bloomsTaxonomy?: string; // e.g. C1 Mengingat, C2 Memahami, C3 Menerapkan, C4 Menganalisis, C5 Mengevaluasi, C6 Mencipta
  points?: number;
  imageUrl?: string; // URL atau Base64 gambar pendukung soal
  imageCaption?: string; // Keterangan/caption gambar
}

export interface KisiKisiItem {
  number: number;
  indicator: string;
  material: string;
  questionType: QuestionType;
  cognitiveLevel: string;
  maxScore: number;
}

export interface RubrikCriterion {
  type: QuestionType | 'umum';
  title: string;
  maxScore: number;
  criteria: {
    scoreLabel: string;
    description: string;
  }[];
}

export interface QuizConfig {
  title: string;
  curriculum: Curriculum;
  subject: Subject;
  customSubject?: string;
  grade: GradeLevel;
  topic: string;
  materialText?: string;
  questionTypes: QuestionType[];
  difficulty: Difficulty;
  count: number;
  language: 'Indonesian' | 'English';
  includeExplanations: boolean;
  targetCompetence?: string;
}

export interface StudentAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect?: boolean;
  scoreGiven?: number;
  feedback?: string;
}

export interface QuizResult {
  id: string;
  quizTitle: string;
  timestamp: string;
  totalQuestions: number;
  correctCount: number;
  score: number; // 0 - 100
  timeSpentSeconds: number;
  answers: Record<string, StudentAnswer>;
}

export interface SavedQuiz {
  id: string;
  title: string;
  createdAt: string;
  curriculum?: Curriculum;
  subject: string;
  grade: string;
  topic: string;
  questions: Question[];
}

