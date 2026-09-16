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
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState<string | null>(null);
  const [connectionStalled, setConnectionStalled] = useState(false);

  const title = media.title || media.name || 'Untitled';
  const isTV = media.media_type === 'tv';

  // Compute actual embed URL from provider
  const playbackUrl = selectedProvider.generateUrl ? selectedProvider.generateUrl({
    tmdbId: media.id,
    mediaType: media.media_type,
    season: isTV ? currentSeason : undefined,
    episode: isTV ? currentEpisode : undefined,
  }) : null;

  // Reset loading state and start timeout when provider or episode changes
  useEffect(() => {
    setIframeLoading(true);
    setIframeError(null);
    setConnectionStalled(false);

    // If an embed is refused (e.g. X-Frame-Options or network block), browsers often won't fire onError.
    // Display a clean fallback prompt after 5 seconds if still loading.
    const timer = setTimeout(() => {
      setConnectionStalled(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [selectedProvider.id, media.id, currentSeason, currentEpisode]);

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
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div id="veyra-watch-page" className="min-h-screen bg-[#07080c] text-white pb-20 pt-16">
      {/* Top Bar Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between border-b border-white/5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Details</span>
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-400 hidden sm:inline">Now Playing:</span>
          <span className="font-bold text-amber-300 truncate max-w-xs sm:max-w-md">
            {title} {isTV && `(S${currentSeason} : E${currentEpisode})`}
          </span>
        </div>

        {isTV && (
          <button
            onClick={() => setShowEpisodesDrawer(!showEpisodesDrawer)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 border border-white/10"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Episodes</span>
          </button>
        )}
      </div>

      {/* Quick Server Switcher Tabs Strip */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 mt-3">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-2 flex-nowrap">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mr-1 flex-none">
              <Server className="w-3.5 h-3.5 text-amber-400" />
              Servers:
            </span>
            {PLAYBACK_PROVIDERS.filter((p) => p.metadata.availability === 'available').map((prov, index) => {
              const isSelected = selectedProvider.id === prov.id;
              return (
                <button
                  key={prov.id}
                  onClick={() => setSelectedProvider(prov)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-400/20'
                      : 'bg-[#11131c] hover:bg-[#191c28] text-zinc-300 border-white/5 hover:border-white/10'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-black animate-pulse' : 'bg-emerald-400'
                    }`}
                  />
                  <span>
                    {prov.id === 'vidcore'
                      ? 'VidCore'
                      : prov.id === 'official-trailer-feed'
                      ? 'Trailer Feed'
                      : `Server ${index}`}
                  </span>
                  {prov.metadata.pingMs && (
                    <span
                      className={`text-[10px] font-mono ${
                        isSelected ? 'text-black/70' : 'text-zinc-500'
                      }`}
                    >
                      {prov.metadata.pingMs}ms
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Active Mirror: {selectedProvider.name}</span>
            {playbackUrl && (
              <a
                href={playbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 hover:text-amber-300 border border-white/10 text-xs font-semibold transition-colors"
                title="Open stream in a dedicated tab if your browser blocks or displays 'refused to connect'"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Tab</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Video Cinema Theater Container */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 mt-1">
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 flex items-center justify-center group">
          {/* Loading Indicator Overlay */}
          {iframeLoading && playbackUrl && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs pointer-events-none transition-opacity duration-300">
              <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
              <p className="mt-3 text-xs font-mono text-zinc-400 tracking-wider">
                Connecting to {selectedProvider.name}...
              </p>
            </div>
          )}

          {/* Connection stalled or blocked notification */}
          {connectionStalled && iframeLoading && playbackUrl && (
            <div className="absolute bottom-4 left-4 right-4 z-30 flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#0f1118]/95 border border-amber-500/30 text-amber-200 text-xs backdrop-blur-md shadow-xl">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-none" />
                <span>Seeing a blank screen or 'refused to connect'? Some browser privacy rules block embedded players.</span>
              </div>
              <div className="flex items-center gap-2 flex-none">
                <a
                  href={playbackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Direct Tab</span>
                </a>
                <button
                  onClick={() => {
                    const fallback = PLAYBACK_PROVIDERS.find(
                      (p) => p.id !== selectedProvider.id && p.metadata.availability === 'available'
                    );
                    if (fallback) setSelectedProvider(fallback);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
                >
                  Switch Server
                </button>
              </div>
            </div>
          )}

          {/* Error Message Overlay if playback failed */}
          {iframeError && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-[#0d0f17]">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">Playback / Connection Issue</h4>
              <p className="text-xs text-zinc-300 max-w-sm mb-4 leading-relaxed">{iframeError}</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {playbackUrl && (
                  <a
                    href={playbackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 border border-white/10"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Direct Tab</span>
                  </a>
                )}
                <button
                  onClick={() => {
                    const fallback = PLAYBACK_PROVIDERS.find(
                      (p) => p.id !== selectedProvider.id && p.metadata.availability === 'available'
                    );
                    if (fallback) setSelectedProvider(fallback);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors"
                >
                  Switch to Alternative Mirror
                </button>
              </div>
            </div>
          )}

          {/* 1. Direct Embed Streaming Server (VidCore, Multi-CDN, and Mirrors) */}
          {playbackUrl ? (
            <iframe
              key={`${selectedProvider.id}-${media.id}-${currentSeason}-${currentEpisode}`}
              src={playbackUrl}
              title={`${title} Playback Stream`}
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="no-referrer"
              onLoad={() => {
                setIframeLoading(false);
                setConnectionStalled(false);
              }}
              onError={() => {
                setIframeLoading(false);
                setIframeError(
                  `Playback was refused or blocked by security settings for ${selectedProvider.name}. You can open this stream directly in a new tab or switch mirrors.`
                );
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
            /* 3. Provider is offline or VIP DRM is required */
            <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#10121a] to-[#08090e]">
              {/* Subtle background art */}
              {media.backdrop_path && (
                <img
                  src={tmdbImages.backdrop(media.backdrop_path, 'original') || ''}
                  alt={title}
                  className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-sm pointer-events-none"
                />
              )}

              <div className="relative z-10 max-w-md space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
                  <Server className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white font-serif">
                    Select an Active Stream Server
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
                    Selected provider "{selectedProvider.name}" is currently reserved. Switch to one of the 4 live streaming servers above for instant playback.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setSelectedProvider(PLAYBACK_PROVIDERS[0])}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-400/20"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Switch to Server Alpha (Fast HD)</span>
                  </button>
                  {media.trailer_key && (
                    <button
                      onClick={() =>
                        setSelectedProvider(
                          PLAYBACK_PROVIDERS.find((p) => p.id === 'official-trailer-feed') ||
                            PLAYBACK_PROVIDERS[0]
                        )
                      }
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-white/10 flex items-center justify-center gap-2"
                    >
                      <Clapperboard className="w-3.5 h-3.5" />
                      <span>Watch Studio Trailer</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Video Controls Bar Under Theater */}
        <div className="mt-3 p-3 rounded-xl bg-[#0f1118] border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-zinc-200">
              Provider: {selectedProvider.name}
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono font-bold text-amber-400 border border-white/5">
              {quality}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* TV Show Next Episode */}
            {isTV && (
              <button
                onClick={handleNextEpisode}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold transition-colors cursor-pointer"
              >
                <span>Next Episode</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Quality Selector */}
            <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-white/10">
              {(['720p', '1080p', '4K'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                    quality === q
                      ? 'bg-amber-400 text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Subtitles toggle */}
            <button
              onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
              className={`p-1.5 rounded-lg border transition-colors ${
                subtitlesEnabled
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                  : 'bg-zinc-900 text-zinc-500 border-white/5'
              }`}
              title="Toggle Subtitles"
            >
              <Subtitles className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10"
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
