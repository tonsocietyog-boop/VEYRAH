import React, { useEffect, useState } from 'react';
import {
  Bookmark,
  Calendar,
  Check,
  Clapperboard,
  Clock,
  Film,
  MessageSquareText,
  Play,
  Share2,
  Star,
  Tv,
} from 'lucide-react';
import { CastCarousel } from '../components/CastCarousel';
import { MediaCarousel } from '../components/MediaCarousel';
import { MovieAIChat } from '../components/MovieAIChat';
import { SeasonEpisodeSelector } from '../components/SeasonEpisodeSelector';
import { useUser } from '../context/UserContext';
import { tmdbImages, tmdbService } from '../services/tmdbService';
import { Episode, MediaItem } from '../types';

interface DetailPageProps {
  media: MediaItem;
  onWatch: (item: MediaItem, season?: number, episode?: number) => void;
  onOpenTrailer: (trailerKey: string, title: string) => void;
  onSelectSimilar: (item: MediaItem) => void;
}

export const DetailPage: React.FC<DetailPageProps> = ({
  media,
  onWatch,
  onOpenTrailer,
  onSelectSimilar,
}) => {
  const { isInMyList, addToMyList, removeFromMyList } = useUser();
  const [detailedItem, setDetailedItem] = useState<MediaItem>(media);
  const [similarItems, setSimilarItems] = useState<MediaItem[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'episodes' | 'ai-chat'>(
    media.media_type === 'tv' && media.seasons?.length ? 'episodes' : 'overview'
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setDetailedItem(media);

    // Fetch full details and similar
    if (media.media_type === 'tv') {
      tmdbService.getTVDetails(media.id).then((full) => {
        if (full) setDetailedItem(full);
      });
    } else {
      tmdbService.getMovieDetails(media.id).then((full) => {
        if (full) setDetailedItem(full);
      });
    }

    tmdbService.getSimilar(media.media_type, media.id).then(setSimilarItems);
  }, [media.id, media.media_type]);

  const inList = isInMyList(detailedItem.id);
  const title = detailedItem.title || detailedItem.name || 'Untitled';
  const year = (detailedItem.release_date || detailedItem.first_air_date || '').slice(0, 4);
  const rating = detailedItem.vote_average ? detailedItem.vote_average.toFixed(1) : '8.0';

  const runtime = detailedItem.runtime
    ? `${Math.floor(detailedItem.runtime / 60)}h ${detailedItem.runtime % 60}m`
    : detailedItem.episode_run_time?.[0]
    ? `~${detailedItem.episode_run_time[0]}m / ep`
    : null;

  const backdropUrl = tmdbImages.backdrop(detailedItem.backdrop_path, 'original');
  const posterUrl = tmdbImages.poster(detailedItem.poster_path, 'w500');

  const handleToggleList = () => {
    if (inList) {
      removeFromMyList(detailedItem.id);
    } else {
      addToMyList(detailedItem);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePlayEpisode = (seasonNumber: number, episode: Episode) => {
    onWatch(detailedItem, seasonNumber, episode.episode_number);
  };

  return (
    <div id="media-detail-page" className="min-h-screen pb-24 bg-[#08090d]">
      {/* 1. Backdrop Hero Banner */}
      <div className="relative w-full h-[52vh] sm:h-[62vh] overflow-hidden bg-[#0a0b12]">
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover object-center scale-105 animate-fade-in"
          />
        ) : (
          <div className="w-full h-full bg-zinc-900" />
        )}

        {/* Readability Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-[#08090d]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090d] via-transparent to-[#08090d]/30" />
      </div>

      {/* 2. Main Title Content Container (Floating over backdrop) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 sm:-mt-56 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
          {/* Poster Card */}
          <div className="w-44 sm:w-60 md:w-72 aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl shadow-black border border-white/10 flex-none self-center md:self-start">
            {posterUrl ? (
              <img src={posterUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-serif text-2xl text-zinc-600">
                VEYRAH
              </div>
            )}
          </div>

          {/* Details & Overview */}
          <div className="flex-1 space-y-4 pt-2">
            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <span className="px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[11px] bg-amber-400 text-black">
                {detailedItem.media_type === 'tv' ? 'TV Series' : 'Feature Film'}
              </span>

              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-amber-500/30 text-amber-300 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{rating}</span>
                <span className="text-[11px] text-zinc-400 font-normal">
                  ({(detailedItem.vote_count || 1200).toLocaleString()})
                </span>
              </div>

              {year && (
                <span className="text-zinc-300 font-medium px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md border border-white/10">
                  {year}
                </span>
              )}

              {detailedItem.certification && (
                <span className="text-zinc-300 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md border border-white/10">
                  {detailedItem.certification}
                </span>
              )}

              {runtime && (
                <span className="text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{runtime}</span>
                </span>
              )}

              {detailedItem.seasons && (
                <span className="text-zinc-400">
                  {detailedItem.number_of_seasons || detailedItem.seasons.length} Season
                  {(detailedItem.number_of_seasons || detailedItem.seasons.length) > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight leading-tight">
              {title}
            </h1>

            {/* Tagline */}
            {detailedItem.tagline && (
              <p className="text-sm sm:text-base italic text-amber-300/90 font-serif">
                "{detailedItem.tagline}"
              </p>
            )}

            {/* Genres */}
            <div className="flex flex-wrap gap-2 pt-1">
              {detailedItem.genres?.map((g) => (
                <span
                  key={g.id}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-zinc-200 border border-white/5"
                >
                  {g.name}
                </span>
              ))}
              {detailedItem.mood_tags?.map((m) => (
                <span
                  key={m}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30"
                >
                  {m}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                id="btn-detail-watch-now"
                onClick={() => onWatch(detailedItem)}
                className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-400/20 active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>WATCH NOW</span>
                <span className="ml-1 px-1.5 py-0.5 rounded bg-black/20 text-[10px] font-mono font-extrabold uppercase">
                  Multi-Server
                </span>
              </button>

              {detailedItem.trailer_key && (
                <button
                  id="btn-detail-trailer"
                  onClick={() => onOpenTrailer(detailedItem.trailer_key!, title)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-white font-semibold text-sm border border-white/15 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                >
                  <Clapperboard className="w-4 h-4 text-amber-400" />
                  <span>TRAILER</span>
                </button>
              )}

              <button
                id="btn-detail-add-list"
                onClick={handleToggleList}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-semibold text-sm backdrop-blur-md transition-all active:scale-95 cursor-pointer ${
                  inList
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-zinc-900/70 hover:bg-zinc-800 border-white/10 text-zinc-300 hover:text-white'
                }`}
              >
                {inList ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>IN MY LIST</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>ADD TO LIST</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className="p-3 rounded-xl bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 backdrop-blur-md transition-all active:scale-95"
                title="Share Title"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {copied && <span className="text-xs text-amber-400">Link copied!</span>}
            </div>

            {/* Overview / Synopsis */}
            <div className="pt-3 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Synopsis
              </h3>
              <p className="text-sm sm:text-base text-zinc-200 leading-relaxed max-w-3xl">
                {detailedItem.overview}
              </p>
            </div>

            {/* Director & Creator Info */}
            <div className="pt-2 flex flex-wrap gap-6 text-xs text-zinc-400">
              {detailedItem.director && (
                <div>
                  <span className="font-semibold text-zinc-300">Director: </span>
                  <span className="text-white font-medium">{detailedItem.director}</span>
                </div>
              )}
              {detailedItem.creators && detailedItem.creators.length > 0 && (
                <div>
                  <span className="font-semibold text-zinc-300">Created by: </span>
                  <span className="text-white font-medium">
                    {detailedItem.creators.join(', ')}
                  </span>
                </div>
              )}
              {detailedItem.status && (
                <div>
                  <span className="font-semibold text-zinc-300">Status: </span>
                  <span className="text-white font-medium">{detailedItem.status}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Section Tabs: Overview & Cast | Episodes (TV) | AI Chat */}
        <div className="mt-12 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-6 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white text-black font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Cast & Crew
            </button>

            {detailedItem.media_type === 'tv' && detailedItem.seasons && (
              <button
                onClick={() => setActiveTab('episodes')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'episodes'
                    ? 'bg-white text-black font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Tv className="w-4 h-4" />
                <span>Seasons & Episodes</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('ai-chat')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ai-chat'
                  ? 'bg-amber-400 text-black font-bold'
                  : 'text-amber-300/80 hover:text-amber-200 hover:bg-amber-500/10 border border-amber-400/20'
              }`}
            >
              <MessageSquareText className="w-4 h-4" />
              <span>Film Analysis & Q&A</span>
            </button>
          </div>

          {/* Active Tab View */}
          <div className="py-2">
            {activeTab === 'overview' && (
              <CastCarousel cast={detailedItem.cast} crew={detailedItem.crew} />
            )}

            {activeTab === 'episodes' && detailedItem.seasons && (
              <SeasonEpisodeSelector
                seasons={detailedItem.seasons}
                onPlayEpisode={handlePlayEpisode}
              />
            )}

            {activeTab === 'ai-chat' && <MovieAIChat media={detailedItem} />}
          </div>
        </div>

        {/* 4. Similar Titles / Recommendations Carousel */}
        {similarItems.length > 0 && (
          <div className="mt-12 pt-6 border-t border-white/10">
            <MediaCarousel
              id={`similar-${detailedItem.id}`}
              title="More Like This"
              subtitle="Titles sharing tone, aesthetic, and narrative weight"
              items={similarItems}
              onSelect={onSelectSimilar}
              onWatch={onWatch}
              aspect="portrait"
            />
          </div>
        )}
      </div>
    </div>
  );
};
