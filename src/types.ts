export type MediaType = 'movie' | 'tv';

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order?: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface VideoItem {
  id: string;
  key: string;
  name: string;
  site: string; // 'YouTube'
  type: string; // 'Trailer' | 'Teaser' | 'Clip'
  official: boolean;
}

export interface Episode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  air_date: string;
  runtime?: number;
  still_path: string | null;
  vote_average?: number;
}

export interface Season {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  poster_path: string | null;
  episode_count: number;
  air_date: string;
  episodes?: Episode[];
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface MediaItem {
  id: number;
  title: string; // Used for movies
  name?: string; // Used for TV shows
  media_type: MediaType;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string; // Movies
  first_air_date?: string; // TV
  vote_average: number;
  vote_count?: number;
  genre_ids?: number[];
  genres?: Genre[];
  runtime?: number; // Minutes
  episode_run_time?: number[];
  certification?: string; // e.g. "PG-13", "TV-MA", "R"
  tagline?: string;
  status?: string;
  director?: string;
  writers?: string[];
  creators?: string[];
  cast?: CastMember[];
  crew?: CrewMember[];
  budget?: number;
  revenue?: number;
  production_companies?: ProductionCompany[];
  seasons?: Season[];
  number_of_seasons?: number;
  videos?: VideoItem[];
  trailer_key?: string; // Primary YouTube trailer ID
  mood_tags?: Mood[];
  match_reason?: string; // Used in AI discovery
}

export type Mood =
  | 'Exciting'
  | 'Relaxing'
  | 'Dark'
  | 'Romantic'
  | 'Funny'
  | 'Scary'
  | 'Deep'
  | 'Inspiring';

import { PlaybackSourceType, MediaRequest, PlaybackSource, VideoProviderMetadata, VideoProvider } from './providers/types';

export type { PlaybackSourceType, MediaRequest, PlaybackSource, VideoProviderMetadata, VideoProvider };

export interface ContinueWatchingItem {
  mediaId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  progressPercent: number;
  currentTimeSeconds: number;
  durationSeconds: number;
  season?: number;
  episode?: number;
  episodeTitle?: string;
  lastWatched: string;
}

export interface UserListItem {
  mediaId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  releaseYear: string;
  addedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  isGuest: boolean;
  avatarSeed: string;
}

export interface AIRecommendationResult {
  query: string;
  interpretation: string;
  matchedMedia: {
    id: number;
    title: string;
    media_type: MediaType;
    reason: string;
    vibeScore: number;
  }[];
  suggestedMood?: Mood;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
