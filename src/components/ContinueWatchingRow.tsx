import React from 'react';
import { Play, X } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { tmdbImages } from '../services/tmdbService';
import { ContinueWatchingItem } from '../types';

interface ContinueWatchingRowProps {
  onPlay: (item: ContinueWatchingItem) => void;
}

export const ContinueWatchingRow: React.FC<ContinueWatchingRowProps> = ({ onPlay }) => {
  const { continueWatching, clearWatchHistoryItem } = useUser();

  if (!continueWatching || continueWatching.length === 0) {
    return null;
  }

  return (
    <section id="continue-watching-section" className="py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-amber-400">
            Jump Back In
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
            Continue Watching
          </h2>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1 -mx-2 px-2">
          {continueWatching.map((item) => {
            const backdropUrl = tmdbImages.backdrop(item.backdropPath || item.posterPath, 'w780');

            return (
              <div
                key={`continue-${item.mediaId}`}
                id={`continue-card-${item.mediaId}`}
                onClick={() => onPlay(item)}
                className="flex-none w-[260px] sm:w-[320px] group relative cursor-pointer select-none rounded-xl overflow-hidden bg-[#12141c] border border-white/5 hover:border-amber-400/40 transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Image Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
                  {backdropUrl ? (
                    <img
                      src={backdropUrl}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600 font-serif">
                      VEYRAH
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Play Action Button on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <div className="w-12 h-12 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-xl shadow-amber-500/20 transform group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Top Dismiss Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearWatchHistoryItem(item.mediaId);
                    }}
                    title="Remove from Continue Watching"
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/70 hover:bg-black text-zinc-400 hover:text-white border border-white/10 z-10"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Media Type & Episode Tag */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-black/70 backdrop-blur-md text-zinc-300 border border-white/10">
                      {item.mediaType === 'tv' && item.season && item.episode
                        ? `S${item.season} : E${item.episode}`
                        : item.mediaType === 'tv'
                        ? 'Series'
                        : 'Movie'}
                    </span>
                  </div>

                  {/* Progress Bar Overlaid on Bottom of Video */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
                      style={{ width: `${Math.min(item.progressPercent, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Card Meta */}
                <div className="p-3 bg-[#0e1017]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <span className="text-[11px] font-medium text-amber-400 ml-2 whitespace-nowrap">
                      {item.progressPercent}%
                    </span>
                  </div>
                  {item.episodeTitle && (
                    <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                      {item.episodeTitle}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
