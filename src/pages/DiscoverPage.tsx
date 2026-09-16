import React, { useEffect, useState } from 'react';
import { Compass, MessageSquareText } from 'lucide-react';
import { MediaCard } from '../components/MediaCard';
import { MoodIcon } from '../components/MoodIcon';
import { GENRES_LIST, MOODS } from '../data/catalog';
import { tmdbService } from '../services/tmdbService';
import { MediaItem, Mood } from '../types';

interface DiscoverPageProps {
  onSelectMedia: (item: MediaItem) => void;
  onWatchMedia: (item: MediaItem) => void;
  onOpenAiDiscovery: () => void;
}

export const DiscoverPage: React.FC<DiscoverPageProps> = ({
  onSelectMedia,
  onWatchMedia,
  onOpenAiDiscovery,
}) => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [mediaType, setMediaType] = useState<'all' | 'movie' | 'tv'>('all');
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    tmdbService
      .discover({
        mediaType,
        genre: selectedGenre || undefined,
        mood: selectedMood || undefined,
        sortBy: 'popular',
      })
      .then(setItems);
  }, [selectedMood, selectedGenre, mediaType]);

  return (
    <div id="discover-page" className="min-h-screen pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Hero Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-widest uppercase">
            <Compass className="w-4 h-4" />
            <span>Cinematic Compass</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-serif mt-1">
            Discover by Mood & Genre
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Fine-tune atmosphere, genre codes, and storytelling rhythm
          </p>
        </div>

        <button
          onClick={onOpenAiDiscovery}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/40 text-amber-300 font-bold text-xs sm:text-sm transition-all shadow-lg active:scale-95 self-start md:self-auto cursor-pointer"
        >
          <MessageSquareText className="w-4 h-4 text-amber-400" />
          <span>Curator Dialogue</span>
        </button>
      </div>

      {/* Media Type Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mr-2">
          Format:
        </span>
        {(['all', 'movie', 'tv'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setMediaType(type)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
              mediaType === type
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            {type === 'all' ? 'All Formats' : type === 'movie' ? 'Movies Only' : 'TV Shows Only'}
          </button>
        ))}
      </div>

      {/* Mood Selector Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Step 1: Choose Your Mood
          </span>
          {selectedMood && (
            <button
              onClick={() => setSelectedMood(null)}
              className="text-xs text-amber-400 hover:underline"
            >
              Clear mood filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {MOODS.map((mood) => {
            const isSelected = selectedMood === mood.id;
            return (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(isSelected ? null : mood.id)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-amber-400 text-black border-amber-300 font-bold shadow-lg shadow-amber-400/20 scale-[1.02]'
                    : 'bg-[#12141c] hover:bg-[#181b26] border-white/5 hover:border-amber-400/30 text-zinc-300 hover:text-white'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center mb-1.5 transition-all ${
                    isSelected
                      ? 'bg-black/15 text-black'
                      : 'bg-white/5 text-amber-400 group-hover:bg-amber-400/15 group-hover:text-amber-300'
                  }`}
                >
                  <MoodIcon
                    mood={mood.id}
                    className="w-4 h-4 stroke-[2] group-hover:scale-110 transition-transform"
                  />
                </div>
                <div className="text-xs font-semibold">{mood.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Genre Chips */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Step 2: Choose Genre (Optional)
          </span>
          {selectedGenre && (
            <button
              onClick={() => setSelectedGenre(null)}
              className="text-xs text-amber-400 hover:underline"
            >
              Clear genre filter
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {GENRES_LIST.map((genre) => {
            const isSelected = selectedGenre === genre.id;
            return (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(isSelected ? null : genre.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-black font-bold'
                    : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-white/10'
                }`}
              >
                {genre.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtered Results */}
      <div className="pt-4 border-t border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Matching Titles ({items.length})
          </h2>
          <span className="text-xs text-zinc-400 font-mono">
            Updated dynamically
          </span>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {items.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onSelect={onSelectMedia}
                onWatch={onWatchMedia}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-2">
            <p className="text-base font-semibold text-zinc-300">
              No matching titles found for this combination
            </p>
            <p className="text-xs text-zinc-500">
              Try choosing a different mood or clearing the genre constraint.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
