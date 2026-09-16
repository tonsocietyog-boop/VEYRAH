import { MediaRequest, PlaybackSource, VideoProvider } from './types';
import { vidcoreAdapter } from './adapters/vidcore';
import { vidsrcAdapter } from './adapters/vidsrc';
import { embedsuAdapter } from './adapters/embedsu';
import { autoembedAdapter } from './adapters/autoembed';
import { multiembedAdapter } from './adapters/multiembed';
import { trailerAdapter, vipVaultAdapter } from './adapters/special';

class ProviderRegistry {
  private providers: Map<string, VideoProvider> = new Map();

  constructor() {
    this.register(vidcoreAdapter);
    this.register(vidsrcAdapter);
    this.register(embedsuAdapter);
    this.register(autoembedAdapter);
    this.register(multiembedAdapter);
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
    return Array.from(this.providers.values());
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
