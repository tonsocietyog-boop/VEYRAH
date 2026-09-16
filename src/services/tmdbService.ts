import { CATALOG_ITEMS, GENRES_LIST } from '../data/catalog';
import { MediaItem, MediaType, Mood, Season } from '../types';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const tmdbImages = {
  poster: (path: string | null | undefined, size: 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500') => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  },
  backdrop: (path: string | null | undefined, size: 'w780' | 'w1280' | 'original' = 'w1280') => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  },
  profile: (path: string | null | undefined, size: 'w185' | 'h632' = 'w185') => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  },
};

class TMDBService {
  private async fetchApi<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
    try {
      const searchParams = new URLSearchParams(params);
      const res = await fetch(`/api/tmdb/proxy?path=${encodeURIComponent(endpoint)}&${searchParams.toString()}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data && !data.fallback) {
        return data as T;
      }
    } catch {
      // Fallback
    }
    return null;
  }

  async getTrending(): Promise<MediaItem[]> {
    const live = await this.fetchApi<{ results: MediaItem[] }>('/trending/all/week');
    if (live?.results?.length) {
      return this.enrichItems(live.results);
    }
    return CATALOG_ITEMS.slice(0, 10);
  }

  async getPopularMovies(): Promise<MediaItem[]> {
    const live = await this.fetchApi<{ results: MediaItem[] }>('/movie/popular');
    if (live?.results?.length) {
      return this.enrichItems(live.results.map((m) => ({ ...m, media_type: 'movie' })));
    }
    return CATALOG_ITEMS.filter((i) => i.media_type === 'movie');
  }

  async getPopularTV(): Promise<MediaItem[]> {
    const live = await this.fetchApi<{ results: MediaItem[] }>('/tv/popular');
    if (live?.results?.length) {
      return this.enrichItems(live.results.map((t) => ({ ...t, media_type: 'tv' })));
    }
    return CATALOG_ITEMS.filter((i) => i.media_type === 'tv');
  }

  async getRecentlyAdded(): Promise<MediaItem[]> {
    // Top latest items sorted by release date
    return [...CATALOG_ITEMS].sort((a, b) => {
      const dateA = a.release_date || a.first_air_date || '2020-01-01';
      const dateB = b.release_date || b.first_air_date || '2020-01-01';
      return dateB.localeCompare(dateA);
    });
  }

  async searchMulti(query: string): Promise<MediaItem[]> {
    if (!query.trim()) return [];
    const live = await this.fetchApi<{ results: MediaItem[] }>('/search/multi', { query });
    if (live?.results?.length) {
      return this.enrichItems(live.results.filter((i) => i.media_type === 'movie' || i.media_type === 'tv'));
    }
    const clean = query.toLowerCase().trim();
    return CATALOG_ITEMS.filter((item) => {
      const title = (item.title || item.name || '').toLowerCase();
      const overview = (item.overview || '').toLowerCase();
      const director = (item.director || '').toLowerCase();
      const creators = (item.creators || []).join(' ').toLowerCase();
      const castMatch = (item.cast || []).some((c) => c.name.toLowerCase().includes(clean));
      const genreMatch = (item.genres || []).some((g) => g.name.toLowerCase().includes(clean));

      return (
        title.includes(clean) ||
        overview.includes(clean) ||
        director.includes(clean) ||
        creators.includes(clean) ||
        castMatch ||
        genreMatch
      );
    });
  }

  async getMovieDetails(id: number): Promise<MediaItem | null> {
    const live = await this.fetchApi<MediaItem>(`/movie/${id}`, { append_to_response: 'credits,videos,similar' });
    if (live && live.id) {
      return { ...live, media_type: 'movie' };
    }
    const found = CATALOG_ITEMS.find((i) => i.id === id && i.media_type === 'movie');
    if (found) return found;
    return CATALOG_ITEMS.find((i) => i.id === id) || null;
  }

  async getTVDetails(id: number): Promise<MediaItem | null> {
    const live = await this.fetchApi<MediaItem>(`/tv/${id}`, { append_to_response: 'credits,videos,similar' });
    if (live && live.id) {
      const hydrated = await this.hydrateTVSeasons(live, id);
      return { ...hydrated, media_type: 'tv' };
    }
    const found = CATALOG_ITEMS.find((i) => i.id === id && i.media_type === 'tv');
    if (found) return found;
    return CATALOG_ITEMS.find((i) => i.id === id) || null;
  }

  private async hydrateTVSeasons(show: MediaItem, tvId: number): Promise<MediaItem> {
    if (!show.seasons || show.seasons.length === 0) return show;

    const hydratedSeasons = await Promise.all(
      show.seasons.map(async (season) => {
        if (season.episodes && season.episodes.length > 0) return season;

        const seasonDetails = await this.fetchApi<Season>(`/tv/${tvId}/season/${season.season_number}`);
        if (!seasonDetails) return season;

        return {
          ...season,
          name: seasonDetails.name || season.name,
          overview: seasonDetails.overview || season.overview,
          poster_path: seasonDetails.poster_path || season.poster_path,
          episode_count: seasonDetails.episode_count || season.episode_count,
          air_date: seasonDetails.air_date || season.air_date,
          episodes: seasonDetails.episodes || season.episodes,
        };
      })
    );

    return {
      ...show,
      seasons: hydratedSeasons,
      number_of_seasons: hydratedSeasons.length,
    } as MediaItem;
  }

  async getSeasonDetails(tvId: number, seasonNumber: number): Promise<Season | null> {
    const live = await this.fetchApi<Season>(`/tv/${tvId}/season/${seasonNumber}`);
    if (live && live.season_number !== undefined) {
      return live;
    }
    const show = CATALOG_ITEMS.find((i) => i.id === tvId);
    return show?.seasons?.find((s) => s.season_number === seasonNumber) || null;
  }

  async getSimilar(mediaType: MediaType, id: number): Promise<MediaItem[]> {
    const target = CATALOG_ITEMS.find((i) => i.id === id);
    if (!target) return CATALOG_ITEMS.slice(0, 6);

    const targetGenres = new Set(target.genres?.map((g) => g.id) || target.genre_ids || []);
    return CATALOG_ITEMS.filter((i) => i.id !== id)
      .map((item) => {
        const itemGenres = item.genres?.map((g) => g.id) || item.genre_ids || [];
        const overlap = itemGenres.filter((g) => targetGenres.has(g)).length;
        return { item, overlap };
      })
      .sort((a, b) => b.overlap - a.overlap)
      .map((entry) => entry.item)
      .slice(0, 8);
  }

  async getByMood(mood: Mood): Promise<MediaItem[]> {
    return CATALOG_ITEMS.filter((item) => item.mood_tags?.includes(mood));
  }

  async getByGenre(genreId: number, mediaType?: MediaType): Promise<MediaItem[]> {
    return CATALOG_ITEMS.filter((item) => {
      const typeMatches = !mediaType || item.media_type === mediaType;
      const genreMatches =
        item.genre_ids?.includes(genreId) || item.genres?.some((g) => g.id === genreId);
      return typeMatches && genreMatches;
    });
  }

  async discover(filters: {
    genre?: number;
    year?: string;
    rating?: number;
    mediaType?: 'all' | 'movie' | 'tv';
    mood?: Mood;
    sortBy?: 'popular' | 'rating' | 'newest';
  }): Promise<MediaItem[]> {
    let list = [...CATALOG_ITEMS];

    if (filters.mediaType && filters.mediaType !== 'all') {
      list = list.filter((i) => i.media_type === filters.mediaType);
    }
    if (filters.genre) {
      list = list.filter((i) => i.genre_ids?.includes(filters.genre!) || i.genres?.some((g) => g.id === filters.genre));
    }
    if (filters.mood) {
      list = list.filter((i) => i.mood_tags?.includes(filters.mood!));
    }
    if (filters.rating) {
      list = list.filter((i) => i.vote_average >= filters.rating!);
    }
    if (filters.year) {
      list = list.filter((i) => {
        const d = i.release_date || i.first_air_date || '';
        return d.startsWith(filters.year!);
      });
    }

    if (filters.sortBy === 'rating') {
      list.sort((a, b) => b.vote_average - a.vote_average);
    } else if (filters.sortBy === 'newest') {
      list.sort((a, b) => {
        const dA = a.release_date || a.first_air_date || '';
        const dB = b.release_date || b.first_air_date || '';
        return dB.localeCompare(dA);
      });
    } else {
      list.sort((a, b) => (b.vote_count || 1000) - (a.vote_count || 1000));
    }

    return list;
  }

  getGenres() {
    return GENRES_LIST;
  }

  private enrichItems(items: MediaItem[]): MediaItem[] {
    return items.map((item) => {
      // If we have a local richer match, enhance it
      const local = CATALOG_ITEMS.find((c) => c.id === item.id);
      return {
        ...item,
        title: item.title || item.name || 'Untitled',
        media_type: item.media_type || (item.name ? 'tv' : 'movie'),
        trailer_key: local?.trailer_key || item.trailer_key,
        mood_tags: local?.mood_tags || ['Exciting', 'Deep'],
      };
    });
  }
}

export const tmdbService = new TMDBService();
