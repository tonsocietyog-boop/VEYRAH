import { MediaRequest, PlaybackSource, VideoProvider } from '../types';

export const vidcoreAdapter: VideoProvider = {
  id: 'vidcore',
  name: 'VidCore (Direct Global CDN)',
  metadata: {
    type: 'licensed',
    availability: 'available',
    description: 'High-performance global delivery network with minimal buffering and adaptive bitrate streaming.',
    badge: 'Primary • Fast',
    supportsSubtitles: true,
    supportsEpisodes: true,
    supports4K: true,
    pingMs: 14,
  },
  async getSource(request: MediaRequest): Promise<PlaybackSource | null> {
    const { tmdbId, mediaType, season, episode } = request;
    
    let url = '';
    if (mediaType === 'tv' && season && episode) {
      url = `https://vidcore.org/embed/tv/${tmdbId}/${season}/${episode}`;
    } else {
      url = `https://vidcore.org/embed/movie/${tmdbId}`;
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
      return `https://vidcore.org/embed/tv/${tmdbId}/${season}/${episode}`;
    }
    return `https://vidcore.org/embed/movie/${tmdbId}`;
  }
};
