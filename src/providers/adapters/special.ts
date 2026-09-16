import { MediaRequest, PlaybackSource, VideoProvider } from '../types';

export const trailerAdapter: VideoProvider = {
  id: 'official-trailer-feed',
  name: 'Official 4K Cinematic Trailer (Studio Master)',
  metadata: {
    type: 'trailer',
    availability: 'available',
    description: 'Direct licensed official studio trailer stream in uncompressed 4K with Dolby Atmos audio.',
    badge: 'Studio Trailer • Free',
    supportsSubtitles: true,
    supportsEpisodes: false,
    supports4K: true,
    pingMs: 12,
  },
  async getSource(request: MediaRequest): Promise<PlaybackSource | null> {
    // Trailers are handled differently via YouTube modals right now,
    // so we return null to indicate this provider doesn't yield a standard iframe stream.
    return null;
  },
  generateUrl(): string | null {
    return null;
  }
};

export const vipVaultAdapter: VideoProvider = {
  id: 'veyra-licensed-stream',
  name: 'VEYRAH VIP Vault (Widevine DRM)',
  metadata: {
    type: 'licensed',
    availability: 'coming_soon',
    description: 'Dedicated private studio pipeline with lossless TrueHD spatial audio and director cuts.',
    badge: 'VIP Lossless • Soon',
    supportsSubtitles: true,
    supportsEpisodes: true,
    supports4K: true,
    pingMs: 18,
  },
  async getSource(): Promise<PlaybackSource | null> {
    return null;
  },
  generateUrl(): string | null {
    return null;
  }
};
