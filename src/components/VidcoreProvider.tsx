import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  ExternalLink,
  Layers,
  Radio,
  RefreshCw,
  Server,
  ShieldCheck,
  Tv,
  Wifi,
  Zap,
} from 'lucide-react';
import { vidcoreAdapter } from '../providers/adapters/vidcore';
import { MediaItem } from '../types';

interface VidcoreProviderProps {
  media: MediaItem;
  season?: number;
  episode?: number;
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
}

export const VidcoreProvider: React.FC<VidcoreProviderProps> = ({
  media,
  season,
  episode,
  isSelected,
  onSelect,
  className = '',
}) => {
  const isTV = media.media_type === 'tv';
  const [copied, setCopied] = useState(false);
  const embedUrl = vidcoreAdapter.generateUrl ? vidcoreAdapter.generateUrl({
    tmdbId: media.id,
    mediaType: media.media_type,
    season: isTV ? season : undefined,
    episode: isTV ? episode : undefined,
  }) : null;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!embedUrl) return;
    navigator.clipboard?.writeText(embedUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      onClick={onSelect}
      className={`relative p-4 rounded-2xl border transition-all cursor-pointer overflow-hidden ${
        isSelected
          ? 'bg-gradient-to-br from-amber-500/15 via-[#161824] to-[#0f111a] border-amber-400/70 shadow-lg shadow-amber-500/10'
          : 'bg-[#11131c] hover:bg-[#161926] border-white/10 hover:border-white/20 text-zinc-300'
      } ${className}`}
    >
      {/* Glow highlight */}
      {isSelected && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
      )}

      <div className="relative z-10 space-y-3">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                isSelected
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/30'
                  : 'bg-zinc-800 text-amber-400 border border-white/5'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white tracking-wide">
                  VidCore
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  Aggregated Stream
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Direct TMDB routing with public third-party link indexing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              19ms
            </span>
            <Radio
              className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-zinc-600'}`}
            />
          </div>
        </div>

        {/* Stream Parameters & Details Pill Container */}
        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase">Routing ID</span>
            <span className="text-amber-300 font-semibold truncate">
              TMDB #{media.id}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase">Stream Target</span>
            <span className="text-zinc-300 truncate">
              {isTV
                ? `TV: S${season || 1} • Ep ${episode || 1}`
                : 'Movie (Full-Length)'}
            </span>
          </div>

          <div className="flex flex-col col-span-2 sm:col-span-1">
            <span className="text-[10px] text-zinc-500 uppercase">Features</span>
            <span className="text-zinc-300 truncate">4K UHD • Multi-Sub</span>
          </div>
        </div>

        {/* Action / Endpoint preview */}
        <div className="flex items-center justify-between text-[11px] pt-1 text-zinc-400 gap-2">
          <span className="truncate max-w-[200px] sm:max-w-xs text-[10px] font-mono text-zinc-500">
            {embedUrl}
          </span>
          <div className="flex items-center gap-3 flex-none">
            {embedUrl && (
              <a
                href={embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 font-semibold transition-colors"
                title="Direct Browser Tab"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open Tab</span>
              </a>
            )}
            <button
              type="button"
              onClick={handleCopyLink}
              className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <span>Copy Embed</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
