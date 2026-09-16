import { MediaRequest, PlaybackSource, VideoProvider } from '../types';

export const multiembedAdapter: VideoProvider = {
  id: 'server-delta-superembed',
  name: 'Server Delta (Low Latency Direct)',
  metadata: {
    type: 'licensed',
    availability: 'available',
    description: 'Optimized for mobile and tablet streaming with minimal data overhead and instant seek.',
    badge: 'Server 4 • Low Latency',
    supportsSubtitles: true,
    supportsEpisodes: true,
    supports4K: true,
    pingMs: 52,
  },
  async getSource(request: MediaRequest): Promise<PlaybackSource | null> {
    const { tmdbId, mediaType, season, episode } = request;
    
    let url = '';
    if (mediaType === 'tv' && season && episode) {
      url = `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;
    } else {
      url = `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
    }
    
    return {
      providerId: this.id,
      type: 'iframe',
      url,
    };
  },
  generateUrl(request: MediaRequest): string | null {
    const { tmdbId, mediaType, season, episode } = request;
    if (mediaType === 'tv' && season && episode) {
      return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;
    }
    return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
  }
};
