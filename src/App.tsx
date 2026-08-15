import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { GeneratorForm } from './components/GeneratorForm';
import { QuestionList } from './components/QuestionList';
import { SavedQuizzesModal } from './components/SavedQuizzesModal';
import { EditQuestionModal } from './components/EditQuestionModal';
import { AiTutorModal } from './components/AiTutorModal';
import { ApiKeyModal } from './components/ApiKeyModal';

import { QuizConfig, Question, SavedQuiz } from './types';
import { generateQuestionsWithGemini } from './services/geminiService';

// Author protection signature
const AUTHOR_SIGNATURE = 'imam huzaer';

export default function App() {
  // Anti-plagiarism guard state
  const [isPlagiarized, setIsPlagiarized] = useState(false);

  // User Manual API Key State
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('gemini_user_api_key') || '';
    } catch {
      return '';
    }
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Form Config State
  const [config, setConfig] = useState<QuizConfig>({
    title: 'Latihan Soal Matematika',
    curriculum: 'Kurikulum Merdeka',
    subject: 'Matematika',
    grade: 'SMA/SMK Kelas 10',
    topic: 'Persamaan & Fungsi Kuadrat',
    questionTypes: ['pg', 'isian', 'essai', 'tf'],
    difficulty: 'sedang',
    count: 10,
    language: 'Indonesian',
    includeExplanations: true,
  });

  // Current Generated Quiz State
  const [quizTitle, setQuizTitle] = useState('Soal Ujian / Kuis AI');
  const [quizCurriculum, setQuizCurriculum] = useState('Kurikulum Merdeka');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // LocalStorage Saved Quizzes / History
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>(() => {
    try {
      const stored = localStorage.getItem('generator_soal_saved');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse saved quizzes:', e);
    }
    return [];
  });

  // Modals state
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedQuestionForEdit, setSelectedQuestionForEdit] = useState<Question | null>(null);
  const [selectedQuestionForAi, setSelectedQuestionForAi] = useState<Question | null>(null);

  // Update hasApiKey whenever apiKey changes
  useEffect(() => {
    setHasApiKey(Boolean(apiKey && apiKey.trim()));
  }, [apiKey]);

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    try {
      if (newKey && newKey.trim()) {
        localStorage.setItem('gemini_user_api_key', newKey.trim());
      } else {
        localStorage.removeItem('gemini_user_api_key');
      }
    } catch (e) {
      console.error('Failed to save API key to localStorage', e);
    }
  };

  // Anti-plagiarism integrity check
  useEffect(() => {
    const checkIntegrity = () => {
      try {
        const footerEl = document.getElementById('author-footer');
        if (!AUTHOR_SIGNATURE || (footerEl && !footerEl.innerText.toLowerCase().includes('imam huzaer'))) {
          setIsPlagiarized(true);
        }
      } catch {
        setIsPlagiarized(true);
      }
    };
    checkIntegrity();
    const interval = setInterval(checkIntegrity, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sync savedQuizzes with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('generator_soal_saved', JSON.stringify(savedQuizzes));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }, [savedQuizzes]);

  // Generate Questions handler
  const handleGenerateQuestions = async () => {
    if (!apiKey || !apiKey.trim()) {
      setIsApiKeyModalOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      // First attempt client-side generation (100% works on Vercel SPA, Netlify, and standalone)
      const data = await generateQuestionsWithGemini(config, apiKey.trim());

      if (data.isAuthError) {
        alert(data.error || 'Autentikasi API Key Gemini gagal. Harap periksa kembali API Key Anda.');
        setIsApiKeyModalOpen(true);
      }

      if (data.success && data.questions && data.questions.length > 0) {
        const generatedTitle = data.title || `Soal ${config.subject} - ${config.topic}`;
        setQuizTitle(generatedTitle);
        setQuizCurriculum(config.curriculum || 'Kurikulum Merdeka');
        setQuestions(data.questions);

        // Auto Save to History (Riwayat Soal)
        const newHistoryItem: SavedQuiz = {
          id: `quiz-${Date.now()}`,
          title: generatedTitle,
          curriculum: config.curriculum,
          createdAt: new Date().toISOString(),
          subject: config.subject,
          grade: config.grade,
          topic: config.topic,
          questions: data.questions,
        };
        setSavedQuizzes((prev) => [newHistoryItem, ...prev]);
      } else if (!data.isAuthError) {
        alert(data.error || 'Gagal menghasilkan soal. Silakan pastikan topik diisi dengan benar dan coba lagi.');
      }
    } catch (error: any) {
      console.error('Error generating questions:', error);
      alert(`Terjadi kendala: ${error?.message || 'Silakan periksa koneksi internet Anda.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Save Quiz to Bank manually
  const handleSaveQuizToBank = () => {
    if (questions.length === 0) {
      alert('Belum ada soal untuk disimpan.');
      return;
    }

    const newSavedQuiz: SavedQuiz = {
      id: `quiz-${Date.now()}`,
      title: quizTitle,
      curriculum: quizCurriculum || config.curriculum,
      createdAt: new Date().toISOString(),
      subject: config.subject,
      grade: config.grade,
      topic: config.topic,
      questions: questions,
    };

    setSavedQuizzes((prev) => [newSavedQuiz, ...prev.filter((q) => q.id !== newSavedQuiz.id)]);
    alert('Bank soal berhasil disimpan ke riwayat!');
  };

  // Load Saved Quiz from History
  const handleLoadSavedQuiz = (quiz: SavedQuiz) => {
    setQuizTitle(quiz.title);
    setQuizCurriculum(quiz.curriculum || 'Kurikulum Merdeka');
    setQuestions(quiz.questions);
    setConfig((prev) => ({
      ...prev,
      curriculum: (quiz.curriculum as any) || prev.curriculum || 'Kurikulum Merdeka',
      subject: quiz.subject as any,
      grade: quiz.grade as any,
      topic: quiz.topic,
    }));
  };

  // Delete Single Saved Quiz from History
  const handleDeleteSavedQuiz = (id: string) => {
    setSavedQuizzes((prev) => prev.filter((q) => q.id !== id));
  };

  // Clear All History
  const handleClearAllHistory = () => {
    setSavedQuizzes([]);
    localStorage.removeItem('generator_soal_saved');
  };

  // Handle Add / Edit Question Save
  const handleSaveCustomQuestion = (q: Question) => {
    const exists = questions.some((item) => item.id === q.id);
    if (exists) {
      setQuestions((prev) => prev.map((item) => (item.id === q.id ? q : item)));
    } else {
      const newQuestion = {
        ...q,
        number: questions.length + 1,
      };
      setQuestions((prev) => [...prev, newQuestion]);
    }
  };

  // Blank white screen if anti-plagiarism check fails
  if (isPlagiarized) {
    return <div className="fixed inset-0 bg-white z-[9999]" />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased flex flex-col">
      {/* Navbar Header */}
      <Header
        savedCount={savedQuizzes.length}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        hasApiKey={hasApiKey}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Generator Form (5 cols on lg) */}
          <div className="lg:col-span-5 lg:sticky lg:top-20">
            <GeneratorForm
              config={config}
              onChange={setConfig}
              onGenerate={handleGenerateQuestions}
              isLoading={isLoading}
              apiKey={apiKey}
              onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
            />
          </div>

          {/* Right Column: Question Bank, Kisi-kisi, Rubrik (7 cols on lg) */}
          <div className="lg:col-span-7">
            <QuestionList
              title={quizTitle}
              curriculum={quizCurriculum}
              subject={config.subject}
              grade={config.grade}
              topic={config.topic}
              questions={questions}
              onQuestionsChange={setQuestions}
              onSaveQuiz={handleSaveQuizToBank}
              onAddQuestion={() => {
                setSelectedQuestionForEdit(null);
                setIsEditModalOpen(true);
              }}
              onEditQuestion={(q) => {
                setSelectedQuestionForEdit(q);
                setIsEditModalOpen(true);
              }}
              onAskAi={(q) => setSelectedQuestionForAi(q)}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

      <SavedQuizzesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedQuizzes={savedQuizzes}
        onLoadQuiz={handleLoadSavedQuiz}
        onDeleteQuiz={handleDeleteSavedQuiz}
        onClearAllHistory={handleClearAllHistory}
      />

      <EditQuestionModal
        isOpen={isEditModalOpen}
        question={selectedQuestionForEdit}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveCustomQuestion}
      />

      <AiTutorModal
        question={selectedQuestionForAi}
        apiKey={apiKey}
        onClose={() => setSelectedQuestionForAi(null)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p id="author-footer">@copy design by imam huzaer</p>
        </div>
      </footer>
    </div>
  );
}


