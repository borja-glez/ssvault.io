import { afterEach, describe, expect, it, vi } from 'vitest';
import { createResolvedRequest } from '../../../test/lite-fixtures';

const mockPreviewPayload = {
  preview: {
    value: 'derived-secret',
    summary: 'mock summary',
    placeholder: false,
    engine: 'argon2id-hkdf-sha256' as const,
    visualFingerprint: {
      label: 'amber-anchor',
      palette: ['#111111', '#222222', '#333333'] as [string, string, string],
      note: 'mock note',
    },
  },
  calibration: {
    profileId: 'balanced' as const,
    label: 'Balanced',
    source: 'safe-default' as const,
    parameters: {
      iterations: 3,
      memorySize: 64 * 1024,
      parallelism: 1,
      hashLength: 32,
    },
    signals: {},
    summary: 'mock calibration',
  },
};

async function loadEngineForTest() {
  vi.resetModules();
  vi.mock('./lite-derivation-core', () => ({
    deriveLiteSecretPreviewWithMetadata: vi.fn(async () => mockPreviewPayload),
  }));
  vi.mock('../workers/lite-derivation.worker?worker', () => ({
    default: class MockLiteDerivationWorker {},
  }));

  return import('./lite-derivation-engine');
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('liteDerivationEngine fallback', () => {
  it('cae al hilo principal en SSR porque no existe window', async () => {
    const { liteDerivationEngine } = await loadEngineForTest();

    const result = await liteDerivationEngine.derive(createResolvedRequest());

    expect(result.execution.runtime).toBe('main-thread');
    expect(result.execution.isolated).toBe(false);
    expect(result.execution.fallbackReason).toBe(
      'SSR no ejecuta la derivación en Web Worker.',
    );
  });

  it('cae al hilo principal cuando el navegador no expone Worker', async () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('Worker', undefined);

    const { liteDerivationEngine } = await loadEngineForTest();
    const result = await liteDerivationEngine.derive(createResolvedRequest());

    expect(result.execution.runtime).toBe('main-thread');
    expect(result.execution.fallbackReason).toBe(
      'Este navegador no expone la API de Web Worker.',
    );
  });
});
