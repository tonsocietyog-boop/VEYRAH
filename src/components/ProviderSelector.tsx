import React from 'react';
import { Activity, AlertCircle, CheckCircle2, Clapperboard, ExternalLink, Radio, Server, Wifi } from 'lucide-react';
import { PLAYBACK_PROVIDERS } from '../services/playbackService';
import { MediaItem, VideoProvider } from '../types';
import { VidcoreProvider } from './VidcoreProvider';

interface ProviderSelectorProps {
  selectedProvider: VideoProvider;
  onSelectProvider: (provider: VideoProvider) => void;
  onWatchTrailer: () => void;
  hasTrailer: boolean;
  media?: MediaItem;
  season?: number;
  episode?: number;
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  selectedProvider,
  onSelectProvider,
  onWatchTrailer,
  hasTrailer,
  media,
  season,
  episode,
}) => {
  const vidcoreProvider = PLAYBACK_PROVIDERS.find((p) => p.id === 'vidcore');
  const otherProviders = PLAYBACK_PROVIDERS.filter((p) => p.id !== 'vidcore');

  return (
    <div className="rounded-2xl bg-[#0f1118] border border-white/10 p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20">
            <Server className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-zinc-200">
            Playback route
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/50 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            {PLAYBACK_PROVIDERS.filter((p) => p.metadata.availability === 'available').length} safe routes
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-950/20 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-emerald-300">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>No ad redirects • no captcha prompts</span>
      </div>

      {/* Featured Vidcore Provider Card */}
      {media && vidcoreProvider && (
        <VidcoreProvider
          media={media}
          season={season}
          episode={episode}
          isSelected={selectedProvider.id === vidcoreProvider.id}
          onSelect={() => onSelectProvider(vidcoreProvider)}
        />
      )}

      {/* Other Provider Selector Buttons */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
          Trusted options
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {otherProviders.map((prov) => {
            const isSelected = selectedProvider.id === prov.id;
            const isLive = prov.metadata.availability === 'available';
            const isTV = media?.media_type === 'tv';
            const provUrl =
              media && prov.generateUrl
                ? prov.generateUrl({
                    tmdbId: media.id,
                    mediaType: media.media_type,
                    season: isTV ? season : undefined,
                    episode: isTV ? episode : undefined,
                  })
                : null;

            return (
              <div
                key={prov.id}
                onClick={() => onSelectProvider(prov)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2 relative overflow-hidden group/card ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-400/60 text-white shadow-md shadow-amber-500/10'
                    : 'bg-[#141620] hover:bg-[#181b26] border-white/5 text-zinc-300'
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Radio
                      className={`w-3.5 h-3.5 ${
                        isSelected ? 'text-amber-400' : 'text-zinc-500'
                      }`}
                    />
                    <span className="text-xs font-bold leading-tight line-clamp-1">
                      {prov.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2">
                    {prov.metadata.description}
                  </p>

                  <div className="pt-1 flex items-center justify-between gap-2 text-[10px] font-mono text-zinc-400">
                    <div className="flex items-center gap-2">
                      {prov.metadata.pingMs && (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Wifi className="w-2.5 h-2.5" />
                          {prov.metadata.pingMs}ms
                        </span>
                      )}
                      <span>•</span>
                      <span className="text-zinc-400">
                        {prov.metadata.supports4K ? '4K / 1080p' : '1080p Max'}
                      </span>
                    </div>

                    {provUrl && (
                      <a
                        href={provUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[10px] text-zinc-400 hover:text-amber-300 transition-colors font-sans"
                        title={`Open ${prov.name} in direct tab`}
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span>Open Tab</span>
                      </a>
                    )}
                  </div>
                </div>

                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex-none ${
                    isLive
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400 border border-white/5'
                  }`}
                >
                  {prov.metadata.badge}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Helper note */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-white/5">
        <span>💡 If a server buffers or fails to load, click another server above to switch streams instantly.</span>
      </div>

      {/* Provider Status Alert if unavailable */}
      {selectedProvider.metadata.availability !== 'available' && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 text-xs text-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-none mt-0.5" />
            <div>
              <p className="font-bold text-amber-300">
                Authorized Full-Length Stream Source Unavailable
              </p>
              <p className="text-amber-200/80 mt-0.5 leading-relaxed">
                This VIP vault server requires an active studio license. Switch to Vidcore or Server Alpha for instant playback.
              </p>
            </div>
          </div>

          {hasTrailer && (
            <button
              onClick={onWatchTrailer}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 self-end sm:self-auto cursor-pointer"
            >
              <Clapperboard className="w-3.5 h-3.5" />
              <span>Watch 4K Trailer</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
