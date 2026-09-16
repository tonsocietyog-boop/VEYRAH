import { MediaRequest, PlaybackSource, VideoProvider } from '../types';

export const embedsuAdapter: VideoProvider = {
  id: 'server-beta-embedsu',
  name: 'Server Beta (4K Enhanced Stream)',
  metadata: {
    type: 'licensed',
    availability: 'available',
    description: 'High-definition 1080p/4K master pipeline with premium surround audio and clean UI.',
    badge: 'Server 2 • 4K HDR',
    supportsSubtitles: true,
    supportsEpisodes: true,
    supports4K: true,
    pingMs: 38,
  },
  async getSource(request: MediaRequest): Promise<PlaybackSource | null> {
    const { tmdbId, mediaType, season, episode } = request;
    
    let url = '';
    if (mediaType === 'tv' && season && episode) {
      url = `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`;
    } else {
      url = `https://embed.su/embed/movie/${tmdbId}`;
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
      return `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`;
    }
    return `https://embed.su/embed/movie/${tmdbId}`;
  }
};
