export type PlaybackSourceType = 'iframe' | 'hls' | 'external' | 'trailer';

export interface MediaRequest {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  season?: number;
  episode?: number;
}

export interface PlaybackSource {
  providerId: string;
  type: PlaybackSourceType;
  url: string;
}

export interface VideoProviderMetadata {
  type: 'licensed' | 'trailer' | 'authorized_partner' | 'public_domain' | 'iframe';
  availability: 'available' | 'coming_soon' | 'partner_required';
  description: string;
  badge: string;
  supportsSubtitles: boolean;
  supportsEpisodes: boolean;
  supports4K: boolean;
  pingMs?: number;
  serverLocation?: string;
}

export interface VideoProvider {
  id: string;
  name: string;
  metadata: VideoProviderMetadata;
  
  /**
   * Translates a universal MediaRequest (TMDB ID) into a provider-specific PlaybackSource
   */
  getSource(request: MediaRequest): Promise<PlaybackSource | null>;

  /**
   * Generates a direct URL for external tabs (optional)
   */
  generateUrl?(request: MediaRequest): string | null;
}
