import React, { useEffect, useState } from 'react';
import { MediaCard } from '../components/MediaCard';
import { GENRES_LIST } from '../data/catalog';
import { tmdbService } from '../services/tmdbService';
import { MediaItem } from '../types';

interface TVShowsPageProps {
  onSelectMedia: (item: MediaItem) => void;
  onWatchMedia: (item: MediaItem) => void;
}

export const TVShowsPage: React.FC<TVShowsPageProps> = ({
  onSelectMedia,
  onWatchMedia,
}) => {
  const [shows, setShows] = useState<MediaItem[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | undefined>(undefined);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('popular');

  useEffect(() => {
    tmdbService
      .discover({
        mediaType: 'tv',
        genre: selectedGenre,
        rating: minRating || undefined,
        sortBy,
      })
      .then(setShows);
  }, [selectedGenre, minRating, sortBy]);

  const tvGenres = GENRES_LIST.filter((g) =>
    [18, 10765, 80, 16, 9648, 35, 10759].includes(g.id)
  );

  return (
    <div id="tv-shows-page" className="min-h-screen pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
            Television & Series
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-serif mt-1">
            Prestige TV Series
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Serial dramas, visionary sci-fi sagas, and limited event series
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedGenre || ''}
            onChange={(e) =>
              setSelectedGenre(e.target.value ? Number(e.target.value) : undefined)
            }
            className="bg-[#12141d] text-zinc-200 text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-amber-400"
          >
            <option value="">All TV Genres</option>
            {tvGenres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="bg-[#12141d] text-zinc-200 text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-amber-400"
          >
            <option value={0}>Any Rating</option>
            <option value={8.5}>★ 8.5+ Masterpiece</option>
            <option value={8}>★ 8.0+ Critical Acclaim</option>
            <option value={7.5}>★ 7.5+ High Rating</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#12141d] text-zinc-200 text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-amber-400"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Recently Released</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {shows.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {shows.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onSelect={onSelectMedia}
              onWatch={onWatchMedia}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-3">
          <p className="text-lg font-bold text-white">No series match your filters</p>
          <p className="text-xs text-zinc-400">Try adjusting your filters above.</p>
        </div>
      )}
    </div>
  );
};
