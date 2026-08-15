import React, { useState } from 'react';
import { Sparkles, Send, X, Bot, User } from 'lucide-react';
import { Question } from '../types';

interface AiTutorModalProps {
  question: Question | null;
  onClose: () => void;
  apiKey?: string;
}

export const AiTutorModal: React.FC<AiTutorModalProps> = ({ question, onClose, apiKey }) => {
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: 'Halo! Saya AI Tutor Pendamping. Ada konsep atau langkah penyelesaian soal ini yang ingin dijelaskan lebih sederhana atau dengan metode cepat?',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!question) return null;

  const handleSendPrompt = async (promptText?: string) => {
    const activeText = promptText || inputPrompt;
    if (!activeText.trim() || isLoading) return;

    const userMessage = { sender: 'user' as const, text: activeText };
    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          userPrompt: activeText,
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.reply || 'Maaf, terjadi kesalahan saat menghubungi AI Tutor.',
        },
      ]);
    } catch (error) {
      console.error('Error in AI Tutor Chat:', error);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Maaf, gagal menghubungkan ke server AI. Silakan coba beberapa saat lagi.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/30 text-indigo-200 flex items-center justify-center border border-indigo-400/30">
              <Sparkles className="w-4 h-4 text-indigo-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold">Asisten AI Tutor Pembahasan</h2>
              <p className="text-[10px] text-slate-300">Tanya jawab konsep & cara cepat penyelesaian soal</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Question Preview Box */}
        <div className="bg-slate-50 p-3.5 border-b border-slate-200 text-xs">
          <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Soal Dipilih:</span>
          <p className="font-semibold text-slate-800 line-clamp-2">{question.questionText}</p>
          <div className="mt-1 flex items-center space-x-2 text-[11px]">
            <span className="font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
              Kunci: {question.correctAnswer}
            </span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-slate-100/50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-2xs font-medium'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-2xs'
                }`}
              >
                {msg.text}
              </div>

              {msg.sender === 'user' && (
                <div className="w-6 h-6 rounded-md bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-200 w-fit">
              <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>AI Tutor sedang merumuskan jawaban...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts Suggestions */}
        <div className="p-2 bg-white border-t border-slate-100 flex items-center space-x-1.5 overflow-x-auto text-[11px] no-scrollbar">
          <button
            type="button"
            onClick={() => handleSendPrompt('Jelaskan dengan istilah yang lebih mudah untuk anak-anak')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-full text-slate-600 shrink-0 font-medium transition-colors"
          >
            💡 Penjelasan lebih sederhana
          </button>
          <button
            type="button"
            onClick={() => handleSendPrompt('Apakah ada rumus atau trik cepat untuk menjawab soal ini?')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-full text-slate-600 shrink-0 font-medium transition-colors"
          >
            ⚡ Rumus / Trik Cepat
          </button>
          <button
            type="button"
            onClick={() => handleSendPrompt('Berikan 1 contoh soal lain yang serupa untuk latihan')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-full text-slate-600 shrink-0 font-medium transition-colors"
          >
            📝 Contoh Soal Serupa
          </button>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Tanyakan konsep atau cara pengerjaan..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
