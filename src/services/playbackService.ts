import { providerRegistry } from '../providers/registry';
import { VideoProvider } from '../providers/types';

export const PLAYBACK_PROVIDERS: VideoProvider[] = providerRegistry.getAllProviders();

export function getProviderById(id: string): VideoProvider {
  return providerRegistry.getProvider(id) || PLAYBACK_PROVIDERS[0];
}

export { providerRegistry };
