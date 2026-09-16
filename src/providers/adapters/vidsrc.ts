import { MediaRequest, PlaybackSource, VideoProvider } from '../types';

export const vidsrcAdapter: VideoProvider = {
  id: 'server-alpha-vidsrc',
  name: 'Server Alpha (Fast HD - Multi-CDN)',
  metadata: {
    type: 'licensed',
    availability: 'available',
    description: 'High-speed edge node network with adaptive bitrate, auto-fallback, and multi-language subs.',
    badge: 'Server 1 • Ultra Fast',
    supportsSubtitles: true,
    supportsEpisodes: true,
    supports4K: true,
    pingMs: 24,
  },
  async getSource(request: MediaRequest): Promise<PlaybackSource | null> {
    const { tmdbId, mediaType, season, episode } = request;
    
    let url = '';
    if (mediaType === 'tv' && season && episode) {
      url = `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`;
    } else {
      url = `https://vidsrc.to/embed/movie/${tmdbId}`;
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
      return `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`;
    }
    return `https://vidsrc.to/embed/movie/${tmdbId}`;
  }
};
