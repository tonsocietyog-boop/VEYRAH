import test from 'node:test';
import assert from 'node:assert/strict';
import { PLAYBACK_PROVIDERS } from '../src/services/playbackService';

test('should not advertise or auto-select ad-heavy mirror providers', () => {
  const providerIds = PLAYBACK_PROVIDERS.map((provider) => provider.id);

  assert.ok(!providerIds.includes('server-alpha-vidsrc'));
  assert.ok(!providerIds.includes('server-beta-embedsu'));
  assert.ok(!providerIds.includes('server-gamma-autoembed'));
  assert.ok(!providerIds.includes('server-delta-superembed'));
  assert.ok(providerIds.includes('vidcore'));
});

test('should keep a small trusted provider set for default playback', () => {
  const active = PLAYBACK_PROVIDERS.filter((provider) => provider.metadata.availability === 'available');

  assert.ok(active.length <= 2);
  assert.ok(active.some((provider) => provider.id === 'vidcore'));
});
