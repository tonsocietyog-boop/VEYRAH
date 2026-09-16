import { MediaRequest, PlaybackSource, VideoProvider } from './types';
import { vidcoreAdapter } from './adapters/vidcore';
import { trailerAdapter, vipVaultAdapter } from './adapters/special';

const TRUSTED_PROVIDER_IDS = new Set(['vidcore']);
const SAFE_FALLBACK_IDS = ['vidcore', 'official-trailer-feed'];

class ProviderRegistry {
  private providers: Map<string, VideoProvider> = new Map();

  constructor() {
    this.register(vidcoreAdapter);
    this.register(trailerAdapter);
    this.register(vipVaultAdapter);
  }

  public register(provider: VideoProvider) {
    this.providers.set(provider.id, provider);
  }

  public getProvider(id: string): VideoProvider | undefined {
    return this.providers.get(id);
  }

  public getAllProviders(): VideoProvider[] {
    return Array.from(this.providers.values()).filter((provider) => {
      if (provider.id === 'official-trailer-feed') return true;
      return TRUSTED_PROVIDER_IDS.has(provider.id);
    });
  }

  public getSafeFallbackProviders(currentProviderId?: string): VideoProvider[] {
    const safeProviders = this.getAllProviders();
    if (!currentProviderId) return safeProviders;

    return safeProviders.filter((provider) => provider.id !== currentProviderId);
  }

  /**
   * Fallback Engine (Chain of Responsibility pattern)
   * Attempts to resolve the media request starting with a specific provider,
   * then falling back to others if that provider fails or is unavailable.
   */
  public async getSource(
    request: MediaRequest,
    preferredProviderId?: string
  ): Promise<{ source: PlaybackSource; provider: VideoProvider } | null> {
    const activeProviders = this.getAllProviders().filter(
      p => p.metadata.availability === 'available' && p.metadata.type !== 'trailer'
    );

    // Order providers: Preferred first, then the rest
    let executionOrder = [...activeProviders];
    
    if (preferredProviderId) {
      const preferred = this.getProvider(preferredProviderId);
      if (preferred) {
        executionOrder = [
          preferred,
          ...activeProviders.filter((p) => p.id !== preferredProviderId),
        ];
      }
    }

    // Execute through the chain
    for (const provider of executionOrder) {
      try {
        const source = await provider.getSource(request);
        if (source && source.url) {
          return { source, provider }; // Return the first successful resolution
        }
      } catch (error) {
        console.warn(`[Registry] Provider ${provider.id} failed:`, error);
        // Silently continue to the next provider in the chain
      }
    }

    return null;
  }
}

export const providerRegistry = new ProviderRegistry();
