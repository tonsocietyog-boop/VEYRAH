import React, { useEffect, useState } from 'react';
import { MessageSquareText } from 'lucide-react';
import { ContinueWatchingRow } from '../components/ContinueWatchingRow';
import { HeroCarousel } from '../components/HeroCarousel';
import { MediaCarousel } from '../components/MediaCarousel';
import { MoodSelector } from '../components/MoodSelector';
import { useUser } from '../context/UserContext';
import { tmdbService } from '../services/tmdbService';
import { ContinueWatchingItem, MediaItem, Mood } from '../types';

interface HomePageProps {
  onSelectMedia: (item: MediaItem) => void;
  onWatchMedia: (item: MediaItem) => void;
  onOpenTrailer: (trailerKey: string, title: string) => void;
  onOpenAiDiscovery: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectMedia,
  onWatchMedia,
  onOpenTrailer,
  onOpenAiDiscovery,
}) => {
  const { lastWatchedMedia } = useUser();
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [popularTV, setPopularTV] = useState<MediaItem[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<MediaItem[]>([]);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [moodItems, setMoodItems] = useState<MediaItem[]>([]);
  const [personalizedItems, setPersonalizedItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    async function loadData() {
      const [trend, popM, popT, recent] = await Promise.all([
        tmdbService.getTrending(),
        tmdbService.getPopularMovies(),
        tmdbService.getPopularTV(),
        tmdbService.getRecentlyAdded(),
      ]);
      setTrending(trend);
      setPopularMovies(popM);
      setPopularTV(popT);
      setRecentlyAdded(recent);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (selectedMood) {
      tmdbService.getByMood(selectedMood).then(setMoodItems);
    } else {
      setMoodItems([]);
    }
  }, [selectedMood]);

  useEffect(() => {
    if (lastWatchedMedia) {
      tmdbService.getSimilar(lastWatchedMedia.mediaType, lastWatchedMedia.mediaId).then(setPersonalizedItems);
    }
  }, [lastWatchedMedia]);

  const handleResumeWatching = async (c: ContinueWatchingItem) => {
    const full =
      c.mediaType === 'tv'
        ? await tmdbService.getTVDetails(c.mediaId)
        : await tmdbService.getMovieDetails(c.mediaId);
    if (full) {
      onWatchMedia(full);
    }
  };

  return (
    <div id="home-page" className="min-h-screen pb-20 space-y-4">
      {/* 1. Cinematic Hero Carousel */}
      <HeroCarousel
        items={trending.length > 0 ? trending : popularMovies}
        onSelect={onSelectMedia}
        onWatch={onWatchMedia}
        onOpenTrailer={onOpenTrailer}
      />

      {/* 2. Natural Language AI Discovery Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#121520] to-[#0f1118] border border-amber-400/25 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-400 text-black">
                Gemini Cinema AI
              </span>
              <span className="text-xs text-zinc-400 font-medium">Grounded Natural Discovery</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white font-serif">
              Can't decide what to watch tonight?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
              Tell Veyrah your mood, favorite director, or exact vibe in everyday words.
            </p>
          </div>

          <button
            onClick={onOpenAiDiscovery}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-400/20 active:scale-95 self-start md:self-auto cursor-pointer"
          >
            <MessageSquareText className="w-4 h-4" />
            <span>Ask Veyrah</span>
          </button>
        </div>
      </div>

      {/* 3. Continue Watching */}
      <ContinueWatchingRow onPlay={handleResumeWatching} />

      {/* 4. Mood Selector */}
      <MoodSelector selectedMood={selectedMood} onSelectMood={setSelectedMood} />

      {/* If Mood is Selected -> Render Curated Mood Section First */}
      {selectedMood && moodItems.length > 0 && (
        <MediaCarousel
          id={`mood-${selectedMood.toLowerCase()}`}
          title={`${selectedMood} Cinema Selections`}
          subtitle={`Curated titles dialed specifically for a ${selectedMood.toLowerCase()} viewing experience`}
          items={moodItems}
          onSelect={onSelectMedia}
          onWatch={onWatchMedia}
        />
      )}

      {/* 5. Trending This Week */}
      <MediaCarousel
        id="trending-this-week"
        title="Trending This Week"
        subtitle="The most talked about films and television across international cinema"
        items={trending}
        onSelect={onSelectMedia}
        onWatch={onWatchMedia}
      />

      {/* 6. Personalized "Because You Watched" */}
      {lastWatchedMedia && personalizedItems.length > 0 && (
        <MediaCarousel
          id="personalized-recommendations"
          title={`Because You Watched ${lastWatchedMedia.title}`}
          subtitle="Selected based on thematic resonance, cinematic tone, and director style"
          items={personalizedItems}
          onSelect={onSelectMedia}
          onWatch={onWatchMedia}
          aspect="landscape"
        />
      )}

      {/* 7. Popular Movies */}
      <MediaCarousel
        id="popular-movies"
        title="Popular Movies"
        subtitle="Critically acclaimed and high-audience theatrical releases"
        items={popularMovies}
        onSelect={onSelectMedia}
        onWatch={onWatchMedia}
      />

      {/* 8. Popular TV Shows */}
      <MediaCarousel
        id="popular-tv-shows"
        title="Top-Rated Television Series"
        subtitle="Acclaimed drama, prestige sci-fi, and compelling serial storytelling"
        items={popularTV}
        onSelect={onSelectMedia}
        onWatch={onWatchMedia}
      />

      {/* 9. Recently Added / New Releases */}
      <MediaCarousel
        id="recently-added"
        title="Recently Added Releases"
        subtitle="Fresh additions to the VEYRAH cinema catalog"
        items={recentlyAdded}
        onSelect={onSelectMedia}
        onWatch={onWatchMedia}
        aspect="landscape"
      />
    </div>
  );
};
