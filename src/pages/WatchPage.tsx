import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronRight,
  Clapperboard,
  ExternalLink,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Server,
  Settings,
  SkipForward,
  Subtitles,
  Tv,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ProviderSelector } from '../components/ProviderSelector';
import { SeasonEpisodeSelector } from '../components/SeasonEpisodeSelector';
import { useUser } from '../context/UserContext';
import { PLAYBACK_PROVIDERS } from '../services/playbackService';
import { tmdbImages, tmdbService } from '../services/tmdbService';
import { Episode, MediaItem, VideoProvider } from '../types';

interface WatchPageProps {
  media: MediaItem;
  initialSeason?: number;
  initialEpisode?: number;
  onBack: () => void;
  onSelectSimilar: (item: MediaItem) => void;
  onOpenTrailer: (trailerKey: string, title: string) => void;
}

export const WatchPage: React.FC<WatchPageProps> = ({
  media,
  initialSeason = 1,
  initialEpisode = 1,
  onBack,
  onSelectSimilar,
  onOpenTrailer,
}) => {
  const { updateWatchProgress } = useUser();
  const [selectedProvider, setSelectedProvider] = useState<VideoProvider>(
    PLAYBACK_PROVIDERS[0]
  );
  const [currentSeason, setCurrentSeason] = useState(initialSeason);
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quality, setQuality] = useState<'4K' | '1080p' | '720p'>('4K');
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showEpisodesDrawer, setShowEpisodesDrawer] = useState(false);
  const [similarItems, setSimilarItems] = useState<MediaItem[]>([]);
  const [iframeLoading, setIframeLoading] = useState(false);
  const [iframeError, setIframeError] = useState<string | null>(null);
  const [connectionStalled, setConnectionStalled] = useState(false);
  const [userConfirmedPlayback, setUserConfirmedPlayback] = useState(false);

  const title = media.title || media.name || 'Untitled';
  const isTV = media.media_type === 'tv';
  const SAFE_FALLBACK_IDS = ['vidcore', 'official-trailer-feed'];

  // Compute actual embed URL from provider
  const playbackUrl = selectedProvider.generateUrl ? selectedProvider.generateUrl({
    tmdbId: media.id,
    mediaType: media.media_type,
    season: isTV ? currentSeason : undefined,
    episode: isTV ? currentEpisode : undefined,
  }) : null;

  // Reset loading state and start timeout when provider or episode changes
  useEffect(() => {
    if (!userConfirmedPlayback) return;

    setIframeLoading(true);
    setIframeError(null);
    setConnectionStalled(false);

    const timer = setTimeout(() => {
      setConnectionStalled(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [selectedProvider.id, media.id, currentSeason, currentEpisode, userConfirmedPlayback]);

  // Safe window postMessage listener for VidCore events
  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      // 1. Verify message origin before trusting
      if (!event.origin || !event.origin.includes('vidcore.org')) {
        return;
      }

      const data = event.data;
      if (!data) return;

      // Safe matching of documented VidCore events
      const eventType = typeof data === 'string' ? data : data.event || data.type;
      if (eventType === 'vidcore:play') {
        setIsPlaying(true);
      } else if (eventType === 'vidcore:pause') {
        setIsPlaying(false);
      } else if (eventType === 'vidcore:ended') {
        setIsPlaying(false);
        if (isTV) {
          handleNextEpisode();
        }
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => {
      window.removeEventListener('message', handleWindowMessage);
    };
  }, [isTV, currentSeason, currentEpisode]);

  // Get active episode details if TV
  const seasonObj = media.seasons?.find((s) => s.season_number === currentSeason);
  const episodeObj = seasonObj?.episodes?.find((e) => e.episode_number === currentEpisode);

  // Sync watch progress on mount and episode change
  useEffect(() => {
    updateWatchProgress({
      mediaId: media.id,
      mediaType: media.media_type,
      title: isTV
        ? `${title} — S${currentSeason}:E${currentEpisode} ${episodeObj?.name || ''}`
        : title,
      posterPath: media.poster_path,
      backdropPath: media.backdrop_path,
      progressPercent: 35,
      currentTimeSeconds: 1260,
      durationSeconds: (media.runtime || 60) * 60,
      season: isTV ? currentSeason : undefined,
      episode: isTV ? currentEpisode : undefined,
      episodeTitle: episodeObj?.name,
    });
  }, [media.id, currentSeason, currentEpisode]);

  useEffect(() => {
    tmdbService.getSimilar(media.media_type, media.id).then((items) => setSimilarItems(items.slice(0, 6)));
  }, [media.id]);

  const handleNextEpisode = () => {
    if (!seasonObj?.episodes) return;
    const nextEp = seasonObj.episodes.find((e) => e.episode_number === currentEpisode + 1);
    if (nextEp) {
      setCurrentEpisode(nextEp.episode_number);
    } else {
      // Check next season
      const nextSeason = media.seasons?.find((s) => s.season_number === currentSeason + 1);
      if (nextSeason && nextSeason.episodes?.[0]) {
        setCurrentSeason(nextSeason.season_number);
        setCurrentEpisode(nextSeason.episodes[0].episode_number);
      }
    }
  };

  const toggleFullscreen = () => {
    const playerFrame = document.getElementById('watch-stream-frame') as HTMLElement | null;
    const target = playerFrame || document.documentElement;

    if (!document.fullscreenElement) {
      target.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const switchToSafeFallback = () => {
    const fallback = PLAYBACK_PROVIDERS.find(
      (provider) => provider.id !== selectedProvider.id && SAFE_FALLBACK_IDS.includes(provider.id)
    );

    if (fallback) {
      setSelectedProvider(fallback);
      setUserConfirmedPlayback(true);
      setIframeLoading(true);
      setIframeError(null);
      setConnectionStalled(false);
    }
  };

  const handleStartPlayback = () => {
    setUserConfirmedPlayback(true);
    setIframeError(null);
    setConnectionStalled(false);
    setIframeLoading(true);
  };

  return (
    <div id="veyra-watch-page" className="min-h-screen bg-[#07080c] text-white pb-20 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between border-b border-white/5">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-amber-400/40 hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="flex min-w-0 items-center gap-2 px-3 py-1.5 text-center">
          <span className="hidden text-[10px] uppercase tracking-[0.2em] text-zinc-500 sm:inline">Now Playing</span>
          <span className="truncate text-sm font-semibold text-amber-300 sm:text-base">
            {title} {isTV && `(S${currentSeason}:E${currentEpisode})`}
          </span>
        </div>

        {isTV && (
          <button
            onClick={() => setShowEpisodesDrawer(!showEpisodesDrawer)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-amber-400/40 hover:text-white"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Episodes</span>
          </button>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 mt-4">
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/8 bg-[#10141c]/80 px-3 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
              <Server className="w-3.5 h-3.5 text-amber-400" />
              Trusted stream
            </span>
            {PLAYBACK_PROVIDERS.filter((p) => p.metadata.availability === 'available').map((prov) => {
              const isSelected = selectedProvider.id === prov.id;
              return (
                <button
                  key={prov.id}
                  onClick={() => setSelectedProvider(prov)}
                  className={`rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition ${
                    isSelected
                      ? 'border-amber-400/60 bg-amber-400 text-black shadow-sm shadow-amber-400/20'
                      : 'border-white/10 bg-white/3 text-zinc-300 hover:border-white/20 hover:bg-white/8'
                  }`}
                >
                  {prov.id === 'vidcore' ? 'VidCore' : prov.id === 'official-trailer-feed' ? 'Trailer' : 'Safe Mirror'}
                </button>
              );
            })}
          </div>

          {playbackUrl && (
            <a
              href={playbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1.5 text-[10px] font-semibold text-amber-300 transition hover:bg-amber-400/15"
              title="Open stream in a dedicated tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in tab</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Video Cinema Theater Container */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 mt-1">
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 flex items-center justify-center group">
          {!userConfirmedPlayback && playbackUrl && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="max-w-md rounded-3xl border border-white/10 bg-[#11161d]/90 p-7 text-center shadow-2xl shadow-black/50">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/30">
                  <Play className="ml-1 h-6 w-6 fill-current" />
                </div>
                <h3 className="text-xl font-semibold text-white">Play this title safely</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  We avoid public mirror embeds because they commonly trigger ad redirects and robot-check pages. Confirm once, then open the clean stream route.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    onClick={handleStartPlayback}
                    className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-300"
                  >
                    Play stream
                  </button>
                  {playbackUrl && (
                    <a
                      href={playbackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/10"
                    >
                      Open direct tab
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {iframeLoading && playbackUrl && userConfirmedPlayback && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs pointer-events-none transition-opacity duration-300">
              <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
              <p className="mt-3 text-xs font-mono text-zinc-400 tracking-wider">
                Connecting to {selectedProvider.name}...
              </p>
            </div>
          )}

          {/* Connection stalled or blocked notification */}
          {connectionStalled && iframeLoading && playbackUrl && (
            <div className="absolute bottom-4 left-4 right-4 z-30 rounded-2xl border border-amber-500/30 bg-[#10141d]/95 p-3 text-xs text-amber-100 backdrop-blur-md shadow-xl">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 w-4 h-4 text-amber-400" />
                <div className="flex-1">
                  <p className="font-medium text-amber-200">This stream is taking too long to connect.</p>
                  <p className="mt-1 text-zinc-300">Open it in a tab or switch to a safer route.</p>
                </div>
              </div>
            </div>
          )}

          {iframeError && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#0b0d12]/90 p-6">
              <div className="max-w-md rounded-2xl border border-white/10 bg-[#11161d]/90 p-6 text-center shadow-xl">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-300">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="text-base font-semibold text-white">Stream blocked</h4>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">{iframeError}</p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  {playbackUrl && (
                    <a
                      href={playbackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/10"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open direct tab
                    </a>
                  )}
                  <button
                    onClick={switchToSafeFallback}
                    className="rounded-full bg-amber-400 px-3 py-2 text-xs font-semibold text-black transition hover:bg-amber-300"
                  >
                    Try cleaner route
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 1. Direct Embed Streaming Server (VidCore, Multi-CDN, and Mirrors) */}
          {playbackUrl && userConfirmedPlayback ? (
            <iframe
              id="watch-stream-frame"
              key={`${selectedProvider.id}-${media.id}-${currentSeason}-${currentEpisode}`}
              src={playbackUrl}
              title={`${title} Playback Stream`}
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
              referrerPolicy="no-referrer"
              onLoad={() => {
                setIframeLoading(false);
                setConnectionStalled(false);
              }}
              onError={() => {
                setIframeLoading(false);
                setConnectionStalled(false);
                setIframeError(
                  `Playback was refused or blocked by security settings for ${selectedProvider.name}. Trying the next safe route.`
                );
                switchToSafeFallback();
              }}
              className="w-full h-full border-0 bg-black"
            />
          ) : selectedProvider.id === 'official-trailer-feed' && media.trailer_key ? (
            /* 2. Official YouTube Trailer Feed Provider */
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${media.trailer_key}?autoplay=1&controls=1&rel=0&modestbranding=1&enablejsapi=1`}
              title={`${title} Official Trailer`}
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; encrypted-media"
              onLoad={() => setIframeLoading(false)}
              className="w-full h-full border-0"
            />
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#121720] via-[#0a0d12] to-[#05070a]">
              {media.backdrop_path && (
                <img
                  src={tmdbImages.backdrop(media.backdrop_path, 'original') || ''}
                  alt={title}
                  className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm pointer-events-none"
                />
              )}

              <div className="relative z-10 max-w-md space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300 shadow-lg shadow-amber-500/10">
                  <Server className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white">No safe stream available</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                    The active provider is not accepting this stream. Switch to a cleaner route or open it in a separate tab.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
                  <button
                    onClick={() => setSelectedProvider(PLAYBACK_PROVIDERS[0])}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-xs font-semibold text-black transition hover:bg-amber-300 sm:w-auto"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Open trusted route
                  </button>
                  {media.trailer_key && (
                    <button
                      onClick={() => setSelectedProvider(PLAYBACK_PROVIDERS.find((p) => p.id === 'official-trailer-feed') || PLAYBACK_PROVIDERS[0])}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/10 sm:w-auto"
                    >
                      <Clapperboard className="w-3.5 h-3.5" />
                      Watch trailer
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-[#0d1118]/90 p-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-zinc-200">{selectedProvider.name}</span>
            <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-300">
              {quality}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isTV && (
              <button
                onClick={handleNextEpisode}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-zinc-200 transition hover:border-white/20 hover:text-white"
              >
                <span>Next Ep</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="flex items-center rounded-full border border-white/10 bg-zinc-900 p-0.5">
              {(['720p', '1080p', '4K'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
                    quality === q ? 'bg-amber-400 text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
              className={`rounded-full border p-1.5 transition ${
                subtitlesEnabled ? 'border-amber-400/30 bg-amber-400/10 text-amber-300' : 'border-white/10 bg-zinc-900 text-zinc-500'
              }`}
              title="Toggle Subtitles"
            >
              <Subtitles className="w-4 h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="rounded-full border border-white/10 bg-zinc-900 p-1.5 text-zinc-300 transition hover:border-white/20 hover:text-white"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Provider Abstraction & Episodes Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Server/Provider Selector & Info */}
        <div className="lg:col-span-2 space-y-6">
          <ProviderSelector
            selectedProvider={selectedProvider}
            onSelectProvider={setSelectedProvider}
            media={media}
            season={currentSeason}
            episode={currentEpisode}
            onWatchTrailer={() =>
              setSelectedProvider(
                PLAYBACK_PROVIDERS.find((p) => p.id === 'official-trailer-feed') ||
                  PLAYBACK_PROVIDERS[0]
              )
            }
            hasTrailer={Boolean(media.trailer_key)}
          />

          {/* Title Info Box */}
          <div className="rounded-2xl bg-[#0f1118] border border-white/5 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white font-serif">{title}</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                ★ {media.vote_average?.toFixed(1) || '8.0'}
              </span>
            </div>

            {isTV && episodeObj && (
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 space-y-1">
                <span className="text-xs font-bold text-amber-400">
                  Season {currentSeason}, Episode {currentEpisode}: {episodeObj.name}
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {episodeObj.overview}
                </p>
              </div>
            )}

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {media.overview}
            </p>
          </div>
        </div>

        {/* Right Column: TV Show Episode Drawer / Up Next / Recommendations */}
        <div className="space-y-6">
          {isTV && media.seasons ? (
            <div className="rounded-2xl bg-[#0f1118] border border-white/10 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Season Episodes
                </h3>
                <span className="text-xs text-zinc-400">
                  S{currentSeason} : {seasonObj?.episodes?.length || 0} eps
                </span>
              </div>

              {/* Episode list */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {seasonObj?.episodes?.map((ep) => {
                  const isActive = ep.episode_number === currentEpisode;
                  return (
                    <div
                      key={ep.id}
                      onClick={() => setCurrentEpisode(ep.episode_number)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isActive
                          ? 'bg-amber-400/20 border-amber-400/50 text-white'
                          : 'bg-[#141622] hover:bg-[#181b2a] border-white/5 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`font-mono text-xs font-bold ${
                            isActive ? 'text-amber-400' : 'text-zinc-500'
                          }`}
                        >
                          {ep.episode_number}.
                        </span>
                        <div className="truncate">
                          <p className="text-xs font-semibold truncate">{ep.name}</p>
                          {ep.runtime && (
                            <p className="text-[10px] text-zinc-500">{ep.runtime} min</p>
                          )}
                        </div>
                      </div>

                      {isActive && (
                        <div className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center flex-none">
                          <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Similar Titles Box for Movies */
            <div className="rounded-2xl bg-[#0f1118] border border-white/10 p-4 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Up Next In Cinema
              </h3>
              <div className="space-y-2.5">
                {similarItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectSimilar(item)}
                    className="p-2 rounded-xl bg-[#141622] hover:bg-[#181b2a] border border-white/5 transition-all cursor-pointer flex items-center gap-3 group"
                  >
                    <div className="w-12 aspect-[2/3] rounded bg-zinc-800 overflow-hidden flex-none">
                      <img
                        src={tmdbImages.poster(item.poster_path, 'w185') || ''}
                        alt={item.title || item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-white group-hover:text-amber-300 truncate">
                        {item.title || item.name}
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        ★ {item.vote_average.toFixed(1)} •{' '}
                        {(item.release_date || item.first_air_date || '').slice(0, 4)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
