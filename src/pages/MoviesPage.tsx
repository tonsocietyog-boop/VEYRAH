import React, { useEffect, useState } from 'react';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { MediaCard } from '../components/MediaCard';
import { GENRES_LIST } from '../data/catalog';
import { tmdbService } from '../services/tmdbService';
import { MediaItem } from '../types';

interface MoviesPageProps {
  onSelectMedia: (item: MediaItem) => void;
  onWatchMedia: (item: MediaItem) => void;
}

export const MoviesPage: React.FC<MoviesPageProps> = ({
  onSelectMedia,
  onWatchMedia,
}) => {
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('popular');

  useEffect(() => {
    tmdbService
      .discover({
        mediaType: 'movie',
        genre: selectedGenre,
        year: selectedYear || undefined,
        rating: minRating || undefined,
        sortBy,
      })
      .then(setMovies);
  }, [selectedGenre, selectedYear, minRating, sortBy]);

  const movieGenres = GENRES_LIST.filter((g) =>
    [28, 12, 16, 35, 80, 18, 14, 27, 878, 53].includes(g.id)
  );

  return (
    <div id="movies-page" className="min-h-screen pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Title & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
            Feature Films
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-serif mt-1">
            Explore Movies
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Theatrical premieres, independent cinema, and remastered classics
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Genre Dropdown */}
          <select
            value={selectedGenre || ''}
            onChange={(e) =>
              setSelectedGenre(e.target.value ? Number(e.target.value) : undefined)
            }
            className="bg-[#12141d] text-zinc-200 text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-amber-400"
          >
            <option value="">All Genres</option>
            {movieGenres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Year Dropdown */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-[#12141d] text-zinc-200 text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-amber-400"
          >
            <option value="">All Years</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2014">Classic Remasters</option>
          </select>

          {/* Rating Dropdown */}
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="bg-[#12141d] text-zinc-200 text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-amber-400"
          >
            <option value={0}>Any Rating</option>
            <option value={8}>★ 8.0+ Critical Acclaim</option>
            <option value={7.5}>★ 7.5+ High Rating</option>
            <option value={7}>★ 7.0+ Recommended</option>
          </select>

          {/* Sort Dropdown */}
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

      {/* Active Filter Chips */}
      {(selectedGenre || selectedYear || minRating > 0) && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-zinc-500 font-medium">Active filters:</span>
          {selectedGenre && (
            <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
              {GENRES_LIST.find((g) => g.id === selectedGenre)?.name}
            </span>
          )}
          {selectedYear && (
            <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-white/10">
              {selectedYear}
            </span>
          )}
          {minRating > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-white/10">
              ★ {minRating}+
            </span>
          )}
          <button
            onClick={() => {
              setSelectedGenre(undefined);
              setSelectedYear('');
              setMinRating(0);
            }}
            className="text-amber-400 hover:underline ml-2"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Movies Grid */}
      {movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {movies.map((item) => (
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
          <p className="text-lg font-bold text-white">No movies match your filters</p>
          <p className="text-xs text-zinc-400">
            Try adjusting your genre, year, or rating thresholds.
          </p>
        </div>
      )}
    </div>
  );
};
