import React, { useState } from 'react';
import { Calendar, Clock, Play } from 'lucide-react';
import { tmdbImages } from '../services/tmdbService';
import { Episode, Season } from '../types';

interface SeasonEpisodeSelectorProps {
  seasons: Season[];
  onPlayEpisode: (seasonNumber: number, episode: Episode) => void;
  activeSeasonNumber?: number;
}

export const SeasonEpisodeSelector: React.FC<SeasonEpisodeSelectorProps> = ({
  seasons,
  onPlayEpisode,
  activeSeasonNumber,
}) => {
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(
    activeSeasonNumber || (seasons[0]?.season_number ?? 1)
  );

  if (!seasons || seasons.length === 0) return null;

  const currentSeason =
    seasons.find((s) => s.season_number === selectedSeasonNumber) || seasons[0];

  return (
    <div className="space-y-6">
      {/* Header & Season Selector Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white">Episodes</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            {currentSeason.name} — {currentSeason.episodes?.length || 0} Episodes
          </p>
        </div>

        {/* Season Switcher Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {seasons.map((season) => {
            const isSelected = season.season_number === selectedSeasonNumber;
            return (
              <button
                key={season.id}
                onClick={() => setSelectedSeasonNumber(season.season_number)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/5'
                }`}
              >
                {season.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Episode Cards Grid / List */}
      <div className="space-y-3.5">
        {currentSeason.episodes?.map((episode) => {
          const stillUrl = tmdbImages.backdrop(episode.still_path, 'w780');

          return (
            <div
              key={episode.id}
              onClick={() => onPlayEpisode(selectedSeasonNumber, episode)}
              className="p-3 sm:p-4 rounded-xl bg-[#11131b] border border-white/5 hover:border-amber-400/40 transition-all flex flex-col md:flex-row items-start md:items-center gap-4 cursor-pointer group"
            >
              {/* Still Thumbnail */}
              <div className="relative aspect-video w-full md:w-56 rounded-lg overflow-hidden bg-zinc-800 flex-none">
                {stillUrl ? (
                  <img
                    src={stillUrl}
                    alt={episode.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-zinc-600 font-serif">
                    EPISODE {episode.episode_number}
                  </div>
                )}

                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg shadow-amber-400/30 transform group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>

                <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 text-white backdrop-blur-sm">
                  EP {episode.episode_number}
                </span>
              </div>

              {/* Episode Meta */}
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <span className="font-mono font-bold text-amber-400">
                    {episode.episode_number}.
                  </span>
                  <span className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                    {episode.name}
                  </span>
                  {episode.runtime && (
                    <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                      <Clock className="w-3 h-3" />
                      <span>{episode.runtime}m</span>
                    </div>
                  )}
                  {episode.air_date && (
                    <div className="hidden sm:flex items-center gap-1 text-[11px] text-zinc-500">
                      <Calendar className="w-3 h-3" />
                      <span>{episode.air_date}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                  {episode.overview || 'No synopsis provided for this episode.'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
