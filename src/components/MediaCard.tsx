import React, { useState } from 'react';
import { Bookmark, Check, Info, Play, Star } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { tmdbImages } from '../services/tmdbService';
import { MediaItem } from '../types';

interface MediaCardProps {
  item: MediaItem;
  onSelect: (item: MediaItem) => void;
  onWatch: (item: MediaItem) => void;
  onWatchTrailer?: (item: MediaItem) => void;
  aspect?: 'portrait' | 'landscape';
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onSelect,
  onWatch,
  onWatchTrailer,
  aspect = 'portrait',
}) => {
  const { isInMyList, addToMyList, removeFromMyList } = useUser();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const inList = isInMyList(item.id);
  const title = item.title || item.name || 'Untitled';
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'NR';

  const posterUrl = aspect === 'landscape'
    ? tmdbImages.backdrop(item.backdrop_path || item.poster_path, 'w780')
    : tmdbImages.poster(item.poster_path, 'w500');

  const handleToggleList = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inList) {
      removeFromMyList(item.id);
    } else {
      addToMyList(item);
    }
  };

  return (
    <div
      id={`media-card-${item.id}`}
      onClick={() => onSelect(item)}
      className="group relative cursor-pointer select-none rounded-xl overflow-hidden bg-[#12141c] border border-white/[0.07] hover:border-amber-400/40 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/70 flex flex-col"
    >
      {/* Aspect Ratio Container */}
      <div
        className={`relative w-full overflow-hidden bg-zinc-900 ${
          aspect === 'landscape' ? 'aspect-video' : 'aspect-[2/3]'
        }`}
      >
        {/* Placeholder skeleton while loading */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-900 animate-pulse" />
        )}

        {posterUrl && !imageError ? (
          <img
            src={posterUrl}
            alt={title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-zinc-900 text-zinc-500">
            <span className="font-serif text-2xl text-zinc-600 mb-1">VEYRAH</span>
            <span className="text-xs text-zinc-400 font-medium line-clamp-2">{title}</span>
          </div>
        )}

        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c11] via-transparent to-black/30 opacity-70 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-black/60 backdrop-blur-md text-zinc-300 border border-white/10">
            {item.media_type === 'tv' ? 'TV' : 'Film'}
          </span>

          <button
            onClick={handleToggleList}
            aria-label={inList ? 'Remove from My List' : 'Add to My List'}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
              inList
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                : 'bg-black/60 text-zinc-300 hover:text-white hover:bg-black/80 border border-white/10'
            }`}
          >
            {inList ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40 backdrop-blur-[2px] z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWatch(item);
            }}
            className="w-11 h-11 rounded-full bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center shadow-xl shadow-amber-500/20 transform hover:scale-110 active:scale-95 transition-transform"
            title="Watch Title"
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item);
            }}
            className="w-9 h-9 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-white/20 flex items-center justify-center transform hover:scale-105 active:scale-95 transition-transform"
            title="Details & Cast"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Bar Info on Poster */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-amber-400 font-semibold bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded border border-amber-500/20">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{rating}</span>
            </div>
            {year && (
              <span className="text-zinc-400 text-[11px] font-medium bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm border border-white/5">
                {year}
              </span>
            )}
            {item.certification && (
              <span className="text-zinc-400 text-[10px] font-mono font-medium bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm border border-white/5">
                {item.certification}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Text Meta Footer */}
      <div className="p-3 bg-[#0d0e14] flex-1 flex flex-col justify-between border-t border-white/[0.04]">
        <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-amber-300 transition-colors line-clamp-1 leading-snug">
          {title}
        </h3>
        <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">
          {item.genres?.map((g) => g.name).slice(0, 2).join(' • ') ||
            (item.mood_tags ? item.mood_tags.slice(0, 2).join(' • ') : 'Cinematic')}
        </p>
      </div>
    </div>
  );
};
