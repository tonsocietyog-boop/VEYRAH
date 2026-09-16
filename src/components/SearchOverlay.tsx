import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Film, Search, Star, Tv, User, X } from 'lucide-react';
import { tmdbImages, tmdbService } from '../services/tmdbService';
import { MediaItem } from '../types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (item: MediaItem) => void;
  onViewAllResults: (query: string) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  onSelectMedia,
  onViewAllResults,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle search handled at top level
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      const hits = await tmdbService.searchMulti(query);
      setResults(hits);
      setIsSearching(false);
    }, 220);

    return () => clearTimeout(handler);
  }, [query]);

  if (!isOpen) return null;

  const filteredResults = results.filter((item) => {
    if (filterType === 'all') return true;
    return item.media_type === filterType;
  });

  return (
    <div
      id="search-modal-overlay"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        id="search-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#0f1118] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Search Header Input */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-amber-400 flex-none" />
          <input
            ref={inputRef}
            id="global-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, TV shows, directors, actors..."
            className="w-full bg-transparent text-white placeholder-zinc-500 text-base sm:text-lg focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-xs text-zinc-400 hover:text-white uppercase font-mono px-2 py-1 rounded bg-zinc-800"
          >
            ESC
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 bg-[#0b0c12] border-b border-white/5 flex items-center gap-2 text-xs">
          <span className="text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">
            Filter:
          </span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              filterType === 'all'
                ? 'bg-amber-400 text-black font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            All Results
          </button>
          <button
            onClick={() => setFilterType('movie')}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              filterType === 'movie'
                ? 'bg-amber-400 text-black font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => setFilterType('tv')}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              filterType === 'tv'
                ? 'bg-amber-400 text-black font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            TV Series
          </button>
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1">
          {isSearching && (
            <div className="p-8 text-center text-xs text-zinc-400">
              Searching cinematic catalog...
            </div>
          )}

          {!isSearching && query.trim() && filteredResults.length === 0 && (
            <div className="p-8 text-center text-zinc-400 space-y-2">
              <p className="text-sm font-semibold text-zinc-300">No titles found for "{query}"</p>
              <p className="text-xs text-zinc-500">
                Try searching for a different director, actor, or genre keyword.
              </p>
            </div>
          )}

          {!isSearching &&
            filteredResults.map((item) => {
              const poster = tmdbImages.poster(item.poster_path, 'w185');
              const title = item.title || item.name || 'Untitled';
              const year = (item.release_date || item.first_air_date || '').slice(0, 4);
              const rating = item.vote_average ? item.vote_average.toFixed(1) : 'NR';

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectMedia(item);
                    onClose();
                  }}
                  className="p-2 sm:p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-14 rounded-lg bg-zinc-800 overflow-hidden flex-none">
                      {poster ? (
                        <img src={poster} alt={title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-500 font-serif">
                          VEYRAH
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase text-amber-400 tracking-wider">
                          {item.media_type === 'tv' ? 'TV' : 'Movie'}
                        </span>
                        {year && <span className="text-xs text-zinc-400">{year}</span>}
                        <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{rating}</span>
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {title}
                      </h4>
                      {item.director && (
                        <p className="text-[11px] text-zinc-400">Dir. {item.director}</p>
                      )}
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </div>
              );
            })}

          {!query.trim() && (
            <div className="p-6 text-center space-y-3">
              <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">
                Popular Searches
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Dune: Part Two', 'Christopher Nolan', 'Severance', 'Sci-Fi', 'Shōgun', 'Interstellar'].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-xs text-zinc-300 hover:text-white transition-colors"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {query.trim() && filteredResults.length > 0 && (
          <div className="p-3 bg-[#0a0b10] border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              Found {filteredResults.length} matching titles
            </span>
            <button
              onClick={() => {
                onViewAllResults(query);
                onClose();
              }}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>View full catalog results</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
