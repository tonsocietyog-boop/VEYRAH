import React, { useEffect, useState } from 'react';
import {
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Info,
  Play,
  Star,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { tmdbImages } from '../services/tmdbService';
import { MediaItem } from '../types';

interface HeroCarouselProps {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
  onWatch: (item: MediaItem) => void;
  onOpenTrailer: (trailerKey: string, title: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  items,
  onSelect,
  onWatch,
  onOpenTrailer,
}) => {
  const { isInMyList, addToMyList, removeFromMyList } = useUser();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const featured = items.slice(0, 5);
  const current = featured[currentIndex] || featured[0];

  useEffect(() => {
    setVideoLoaded(false);
  }, [currentIndex]);

  // Auto advance every 9 seconds if video isn't being actively interacted with
  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 9500);
    return () => clearInterval(timer);
  }, [featured.length, currentIndex]);

  if (!current) return null;

  const inList = isInMyList(current.id);
  const title = current.title || current.name || 'Featured Title';
  const year = (current.release_date || current.first_air_date || '').slice(0, 4);
  const rating = current.vote_average ? current.vote_average.toFixed(1) : '8.5';
  const runtime = current.runtime
    ? `${Math.floor(current.runtime / 60)}h ${current.runtime % 60}m`
    : current.episode_run_time?.[0]
    ? `${current.episode_run_time[0]}m / ep`
    : null;

  const backdropUrl = tmdbImages.backdrop(current.backdrop_path, 'original');

  const handleToggleList = () => {
    if (inList) {
      removeFromMyList(current.id);
    } else {
      addToMyList(current);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  return (
    <div id="veyra-hero-carousel" className="relative w-full min-h-[580px] sm:min-h-[660px] lg:h-[82vh] overflow-hidden bg-[#08090d]">
      {/* Background Media: Backdrop Image or Ambient Trailer */}
      <div className="absolute inset-0">
        {/* Ambient Video Player if trailer available */}
        {current.trailer_key && isVideoPlaying ? (
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none scale-125 opacity-75 sm:opacity-85 transition-opacity duration-1000">
            <iframe
              id="hero-ambient-player"
              src={`https://www.youtube-nocookie.com/embed/${current.trailer_key}?autoplay=1&mute=${
                isMuted ? '1' : '0'
              }&controls=0&loop=1&playlist=${current.trailer_key}&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`}
              title={`${title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="w-full h-full object-cover pointer-events-none"
              onLoad={() => setVideoLoaded(true)}
            />
          </div>
        ) : null}

        {/* Fallback & Layered Backdrop Image */}
        {backdropUrl && (!videoLoaded || !isVideoPlaying) && (
          <img
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover object-center scale-105 animate-fade-in transition-transform duration-1000 ease-out"
          />
        )}

        {/* Cinematic Multi-stop Dark Gradients for legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090d] via-[#08090d]/80 to-transparent w-full md:w-3/4 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-[#08090d]/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#08090d]/70 via-transparent to-[#08090d] z-10" />
      </div>

      {/* Hero Content Layer */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 sm:pb-16 pt-24">
        <div className="max-w-2xl space-y-4">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <span className="px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[11px] bg-amber-400 text-black shadow-sm shadow-amber-400/20">
              {current.media_type === 'tv' ? 'Original Series' : 'Featured Premiere'}
            </span>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-amber-500/30 text-amber-300 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{rating}</span>
            </div>

            {year && (
              <span className="text-zinc-300 font-medium px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md border border-white/10">
                {year}
              </span>
            )}

            {current.certification && (
              <span className="text-zinc-300 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md border border-white/10">
                {current.certification}
              </span>
            )}

            {runtime && (
              <span className="hidden sm:inline text-zinc-400 text-xs">
                {runtime}
              </span>
            )}

            <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[10px] tracking-wider uppercase bg-white/10 text-zinc-300 border border-white/10 font-bold">
              4K Ultra HD
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-serif leading-[1.08] drop-shadow-xl">
            {title}
          </h1>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 text-xs text-zinc-300">
            {current.genres?.map((g) => (
              <span
                key={g.id}
                className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/5 font-medium"
              >
                {g.name}
              </span>
            ))}
          </div>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-zinc-300 line-clamp-3 leading-relaxed font-normal drop-shadow max-w-xl">
            {current.overview}
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {/* Play / Watch */}
            <button
              id="btn-hero-watch"
              onClick={() => onWatch(current)}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-black font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-400/25 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>WATCH NOW</span>
            </button>

            {/* Trailer */}
            {current.trailer_key && (
              <button
                id="btn-hero-trailer"
                onClick={() => onOpenTrailer(current.trailer_key!, title)}
                className="flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-white font-semibold text-sm border border-white/15 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
              >
                <Clapperboard className="w-4 h-4 text-amber-400" />
                <span>TRAILER</span>
              </button>
            )}

            {/* Add to List */}
            <button
              id="btn-hero-add-list"
              onClick={handleToggleList}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-semibold text-sm backdrop-blur-md transition-all active:scale-95 cursor-pointer ${
                inList
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-zinc-900/70 hover:bg-zinc-800 border-white/10 text-zinc-300 hover:text-white'
              }`}
              title={inList ? 'In Your List' : 'Add to List'}
            >
              {inList ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span className="hidden sm:inline">IN LIST</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline">MY LIST</span>
                </>
              )}
            </button>

            {/* More Info */}
            <button
              id="btn-hero-more-info"
              onClick={() => onSelect(current)}
              className="p-3 rounded-xl bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 backdrop-blur-md transition-all active:scale-95"
              title="More Details, Cast & Crew"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Bottom Row Controls: Mute toggle, Prev/Next & Dots */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
          {/* Dots Indicator */}
          <div className="flex items-center gap-2">
            {featured.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 transition-all rounded-full ${
                  idx === currentIndex ? 'w-8 bg-amber-400' : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Right Video / Nav Controls */}
          <div className="flex items-center gap-3">
            {/* Audio Toggle if trailer is playing */}
            {current.trailer_key && (
              <button
                id="btn-hero-audio-toggle"
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white border border-white/15 backdrop-blur-md text-xs transition-colors flex items-center gap-1.5"
                title={isMuted ? 'Unmute Ambient Trailer' : 'Mute Ambient Trailer'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                <span className="hidden sm:inline text-[11px] font-medium pr-1">
                  {isMuted ? 'Muted' : 'Audio On'}
                </span>
              </button>
            )}

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                aria-label="Previous Featured Slide"
                className="p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next Featured Slide"
                className="p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
