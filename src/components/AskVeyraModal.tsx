import React, { useState } from 'react';
import {
  ArrowRight,
  Compass,
  Loader2,
  MessageSquareText,
  Play,
  RotateCcw,
  X,
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { tmdbImages, tmdbService } from '../services/tmdbService';
import { AIRecommendationResult, MediaItem } from '../types';

interface AskVeyraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (item: MediaItem) => void;
  onWatchMedia: (item: MediaItem) => void;
}

const SUGGESTED_PROMPTS = [
  'Find me a funny movie under two hours.',
  'Something like Interstellar but less depressing.',
  'I want a dark psychological thriller with twists.',
  'Give me a good family movie for tonight.',
  'High-stakes cyberpunk or sci-fi with insane visuals.',
];

export const AskVeyraModal: React.FC<AskVeyraModalProps> = ({
  isOpen,
  onClose,
  onSelectMedia,
  onWatchMedia,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIRecommendationResult | null>(null);
  const [resolvedItems, setResolvedItems] = useState<Record<number, MediaItem>>({});

  if (!isOpen) return null;

  const handleAsk = async (userPrompt: string) => {
    const clean = userPrompt.trim();
    if (!clean) return;

    setQuery(clean);
    setIsLoading(true);
    setResult(null);

    try {
      const aiResult = await geminiService.askVeyra(clean);
      setResult(aiResult);

      // Resolve full catalog items for rendering
      const itemsMap: Record<number, MediaItem> = {};
      for (const m of aiResult.matchedMedia) {
        const full =
          m.media_type === 'tv'
            ? await tmdbService.getTVDetails(m.id)
            : await tmdbService.getMovieDetails(m.id);
        if (full) {
          itemsMap[m.id] = full;
        }
      }
      setResolvedItems(itemsMap);
    } catch (err) {
      console.error('AI Ask error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAsk(query);
    }
  };

  return (
    <div
      id="ask-veyra-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        id="ask-veyra-modal"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-[#0d0f16] border border-amber-400/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center shadow-lg shadow-amber-500/25">
              <MessageSquareText className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white font-serif tracking-wide">
                  Ask Veyrah
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-400/10 border border-amber-400/30 text-amber-300">
                  Gemini Flash
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Natural-language discovery grounded in cinema catalog data
              </p>
            </div>
          </div>

          <button
            id="btn-close-ask-veyra"
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-5 sm:p-6 border-b border-white/5 space-y-4">
          <div className="relative flex items-center">
            <input
              id="input-ask-veyra"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="E.g. Something like Interstellar but less depressing..."
              autoFocus
              className="w-full bg-[#141722] text-white placeholder-zinc-500 text-sm sm:text-base px-4 py-3.5 pr-24 rounded-xl border border-white/10 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 transition-all"
            />
            <button
              id="btn-submit-ask-veyra"
              onClick={() => handleAsk(query)}
              disabled={isLoading || !query.trim()}
              className="absolute right-2 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs sm:text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking</span>
                </>
              ) : (
                <>
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Prompt chips */}
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              Try asking:
            </span>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((promptText, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAsk(promptText)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white border border-white/5 transition-all text-left"
                >
                  "{promptText}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-sm text-zinc-300 font-medium">
                Veyrah is analyzing catalog themes, tone, and pacing...
              </p>
              <p className="text-xs text-zinc-500">
                Grounding recommendations in authentic TMDB titles
              </p>
            </div>
          )}

          {!isLoading && result && (
            <div className="space-y-4">
              {/* Interpretation Badge */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-200 leading-relaxed flex items-start gap-3">
                <Compass className="w-4 h-4 text-amber-400 flex-none mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-300">AI Curator Insight: </span>
                  {result.interpretation}
                </div>
              </div>

              {/* Matched Title Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {result.matchedMedia.map((m) => {
                  const media = resolvedItems[m.id];
                  const posterUrl = media
                    ? tmdbImages.poster(media.poster_path, 'w342')
                    : null;

                  return (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-xl bg-[#12151f] border border-white/5 hover:border-amber-400/40 transition-all flex gap-3.5 group"
                    >
                      {/* Poster */}
                      <div className="w-20 aspect-[2/3] rounded-lg bg-zinc-800 overflow-hidden flex-none relative">
                        {posterUrl ? (
                          <img
                            src={posterUrl}
                            alt={m.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-zinc-600 font-serif">
                            VEYRAH
                          </div>
                        )}
                      </div>

                      {/* Info & Reason */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                              {m.media_type === 'tv' ? 'Series' : 'Film'}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              {m.vibeScore}% Match
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                            {m.title}
                          </h4>

                          <p className="text-xs text-zinc-300 mt-1 line-clamp-3 leading-relaxed">
                            {m.reason}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                          <button
                            onClick={() => {
                              if (media) onWatchMedia(media);
                              onClose();
                            }}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Watch</span>
                          </button>
                          <button
                            onClick={() => {
                              if (media) onSelectMedia(media);
                              onClose();
                            }}
                            className="text-xs text-zinc-400 hover:text-white px-2 py-1 transition-colors"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!isLoading && !result && (
            <div className="py-8 text-center text-zinc-500 space-y-2">
              <p className="text-sm text-zinc-400 font-medium">
                Ask about moods, pacing, director vibes, or complex preferences.
              </p>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                VEYRAH AI references real catalog data and awards history to give you direct cinematic recommendations without hallucinations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
