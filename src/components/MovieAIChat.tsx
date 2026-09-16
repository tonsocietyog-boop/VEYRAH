import React, { useState } from 'react';
import { Loader2, MessageSquareText, Send } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { MediaItem } from '../types';

interface MovieAIChatProps {
  media: MediaItem;
}

const SAMPLE_QUESTIONS = [
  'What makes the cinematography special?',
  'Explain the core philosophical themes without major spoilers.',
  'What were the director’s key cinematic influences?',
  'Why is this title considered groundbreaking?',
];

export const MovieAIChat: React.FC<MovieAIChatProps> = ({ media }) => {
  const [messages, setMessages] = useState<
    Array<{ role: 'user' | 'assistant'; text: string }>
  >([
    {
      role: 'assistant',
      text: `I'm Veyrah AI. Ask me anything about ${
        media.title || media.name
      }—from directorial style, themes, and cinematography to trivia and spoiler-free interpretations.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const title = media.title || media.name || 'Title';

  const handleSend = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || isLoading) return;

    setInput('');
    const newMessages = [...messages, { role: 'user' as const, text: q }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const answer = await geminiService.askMovieQuestion(
        title,
        media.overview,
        media.media_type,
        q
      );
      setMessages([...newMessages, { role: 'assistant', text: answer }]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: `Unable to complete AI analysis. ${title} remains celebrated for its distinctive visual tone and strong performances.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-[#0f111a] border border-white/10 p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
            <MessageSquareText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Film Analysis & Insights</h3>
            <p className="text-[11px] text-zinc-400">
              Grounded cinema perspective on {title}
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="flex flex-wrap gap-2">
        {SAMPLE_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white border border-white/5 transition-all text-left disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2.5 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center flex-none mt-1 font-bold text-[10px]">
                V
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-amber-400 text-black font-medium'
                  : 'bg-zinc-800/80 text-zinc-200 border border-white/5'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-zinc-400 py-1">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Consulting cinema archive...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="pt-2 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          placeholder={`Ask a question about ${title}...`}
          disabled={isLoading}
          className="flex-1 bg-[#141724] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-amber-400/50"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black transition-colors disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
