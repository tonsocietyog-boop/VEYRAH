import React, { useState } from 'react';
import { Bookmark, Compass, Film, Trash2, Tv } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { tmdbImages, tmdbService } from '../services/tmdbService';
import { MediaItem } from '../types';

interface MyListPageProps {
  onSelectMedia: (item: MediaItem) => void;
  onWatchMedia: (item: MediaItem) => void;
  onExploreCatalog: () => void;
}

export const MyListPage: React.FC<MyListPageProps> = ({
  onSelectMedia,
  onWatchMedia,
  onExploreCatalog,
}) => {
  const { myList, removeFromMyList } = useUser();
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');

  const filtered = myList.filter((item) => {
    if (filterType === 'all') return true;
    return item.mediaType === filterType;
  });

  const handleOpenItem = async (mediaId: number, mediaType: 'movie' | 'tv') => {
    const full =
      mediaType === 'tv'
        ? await tmdbService.getTVDetails(mediaId)
        : await tmdbService.getMovieDetails(mediaId);
    if (full) {
      onSelectMedia(full);
    }
  };

  const handleWatchItem = async (mediaId: number, mediaType: 'movie' | 'tv') => {
    const full =
      mediaType === 'tv'
        ? await tmdbService.getTVDetails(mediaId)
        : await tmdbService.getMovieDetails(mediaId);
    if (full) {
      onWatchMedia(full);
    }
  };

  return (
    <div id="my-list-page" className="min-h-screen pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
            Personal Collection
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-serif mt-1">
            My List ({myList.length})
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Your saved movies, prestige series, and watch queue
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            All Saved ({myList.length})
          </button>
          <button
            onClick={() => setFilterType('movie')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterType === 'movie'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
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
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>TV Shows</span>
          </button>
        </div>
      </div>

      {/* Grid or Empty State */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filtered.map((item) => {
            const posterUrl = tmdbImages.poster(item.posterPath, 'w500');

            return (
              <div
                key={item.mediaId}
                onClick={() => handleOpenItem(item.mediaId, item.mediaType)}
                className="group relative cursor-pointer select-none rounded-xl overflow-hidden bg-[#12141c] border border-white/[0.07] hover:border-amber-400/40 transition-all transform hover:-translate-y-1.5 hover:shadow-2xl flex flex-col"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-serif text-zinc-600">
                      VEYRAH
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-black/70 text-zinc-300 border border-white/10">
                      {item.mediaType === 'tv' ? 'TV' : 'Film'}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromMyList(item.mediaId);
                      }}
                      title="Remove from My List"
                      className="p-1.5 rounded-full bg-black/70 hover:bg-red-500/80 text-zinc-300 hover:text-white transition-colors border border-white/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bottom Stats */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between text-xs">
                    <span className="text-amber-400 font-bold bg-black/70 px-1.5 py-0.5 rounded border border-amber-500/20">
                      ★ {item.voteAverage.toFixed(1)}
                    </span>
                    <span className="text-zinc-400 bg-black/60 px-1.5 py-0.5 rounded">
                      {item.releaseYear}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#0d0e14] flex-1 flex flex-col justify-between">
                  <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWatchItem(item.mediaId, item.mediaType);
                    }}
                    className="mt-2 w-full py-1.5 rounded-lg bg-amber-400/15 hover:bg-amber-400 text-amber-300 hover:text-black font-semibold text-xs transition-colors text-center"
                  >
                    Watch Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-24 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 text-zinc-500 border border-white/10 flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Your list is empty</h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Explore movies, television series, and recommendations, and click the bookmark button to build your personal cinema queue.
          </p>
          <button
            onClick={onExploreCatalog}
            className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs sm:text-sm transition-all inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-400/20"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Catalog</span>
          </button>
        </div>
      )}
    </div>
  );
};
