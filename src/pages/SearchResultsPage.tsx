import React, { useEffect, useState } from 'react';
import { Film, Search, Tv } from 'lucide-react';
import { MediaCard } from '../components/MediaCard';
import { tmdbService } from '../services/tmdbService';
import { MediaItem } from '../types';

interface SearchResultsPageProps {
  initialQuery: string;
  onSelectMedia: (item: MediaItem) => void;
  onWatchMedia: (item: MediaItem) => void;
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  initialQuery,
  onSelectMedia,
  onWatchMedia,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    tmdbService.searchMulti(query).then((items) => {
      setResults(items);
      setLoading(false);
    });
  }, [query]);

  const filtered = results.filter((item) => {
    if (filterType === 'all') return true;
    return item.media_type === filterType;
  });

  return (
    <div id="search-results-page" className="min-h-screen pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Search Header */}
      <div className="space-y-4 border-b border-white/10 pb-6">
        <div className="relative max-w-2xl">
          <Search className="w-5 h-5 text-amber-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, director, cast, or genre..."
            className="w-full bg-[#12141e] text-white text-base sm:text-lg pl-12 pr-4 py-3 rounded-2xl border border-white/10 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterType === 'all'
                  ? 'bg-amber-400 text-black font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              All Results ({results.length})
            </button>
            <button
              onClick={() => setFilterType('movie')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterType === 'movie'
                  ? 'bg-amber-400 text-black font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Movies</span>
            </button>
            <button
              onClick={() => setFilterType('tv')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterType === 'tv'
                  ? 'bg-amber-400 text-black font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>TV Series</span>
            </button>
          </div>

          <span className="text-xs text-zinc-400">
            {filtered.length} matching result{filtered.length === 1 ? '' : 's'} for "{query}"
          </span>
        </div>
      </div>

      {/* Grid or Empty */}
      {loading ? (
        <div className="py-20 text-center text-sm text-zinc-400">Searching VEYRAH catalog...</div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filtered.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onSelect={onSelectMedia}
              onWatch={onWatchMedia}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-2">
          <p className="text-base font-semibold text-white">No results found for "{query}"</p>
          <p className="text-xs text-zinc-400">
            Try checking for typos, searching by actor name, or exploring the Discover page.
          </p>
        </div>
      )}
    </div>
  );
};
