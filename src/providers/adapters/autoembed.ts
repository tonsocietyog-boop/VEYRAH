import { MediaRequest, PlaybackSource, VideoProvider } from '../types';

export const autoembedAdapter: VideoProvider = {
  id: 'server-gamma-autoembed',
  name: 'Server Gamma (Failover Mirror)',
  metadata: {
    type: 'licensed',
    availability: 'available',
    description: 'Global redundant mirror server with rapid buffer-free playback for all devices.',
    badge: 'Server 3 • Global Backup',
    supportsSubtitles: true,
    supportsEpisodes: true,
    supports4K: false,
    pingMs: 46,
  },
  async getSource(request: MediaRequest): Promise<PlaybackSource | null> {
    const { tmdbId, mediaType, season, episode } = request;
    
    let url = '';
    if (mediaType === 'tv' && season && episode) {
      url = `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`;
    } else {
      url = `https://player.autoembed.cc/embed/movie/${tmdbId}`;
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
      return `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`;
    }
    return `https://player.autoembed.cc/embed/movie/${tmdbId}`;
  }
};
