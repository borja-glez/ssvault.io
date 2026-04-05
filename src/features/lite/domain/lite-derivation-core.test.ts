import { afterEach, describe, expect, it, vi } from 'vitest';
import { createResolvedRequest } from '../../../test/lite-fixtures';

async function deriveInFreshSession(
  request: ReturnType<typeof createResolvedRequest>,
) {
  vi.resetModules();
  vi.stubGlobal('navigator', {
    hardwareConcurrency: 1,
    deviceMemory: 1,
  } as unknown as Navigator);
  const { deriveLiteSecretPreview } = await import('./lite-derivation-core');
  return deriveLiteSecretPreview(request);
}

describe('deriveLiteSecretPreview', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('deriva passwords de forma determinista para el mismo request', async () => {
    const request = createResolvedRequest({
      service: 'Github',
      account: 'alice@example.com',
      profileId: 'web',
      mode: 'password',
      password: {
        length: 16,
        includeSymbols: false,
      },
    });

    const first = await deriveInFreshSession(request);
    const second = await deriveInFreshSession(request);

    expect(first).toEqual(second);
    expect(first.engine).toBe('argon2id-hkdf-sha256');
    expect(first.value).toHaveLength(16);
    expect(first.value).toMatch(
      /^[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789]+$/,
    );
  }, 20000);

  it('mantiene las mismas palabras base en passphrase aunque cambie el separador', async () => {
    const dashed = createResolvedRequest({
      profileId: 'web',
      mode: 'passphrase',
      passphrase: {
        wordCount: 4,
        separator: '-',
      },
    });
    const dotted = createResolvedRequest({
      profileId: 'web',
      mode: 'passphrase',
      passphrase: {
        wordCount: 4,
        separator: '.',
      },
    });

    const dashedPreview = await deriveInFreshSession(dashed);
    const dottedPreview = await deriveInFreshSession(dotted);

    expect(dashedPreview.value.split('-')).toEqual(
      dottedPreview.value.split('.'),
    );
    expect(dashedPreview.visualFingerprint).toEqual(
      dottedPreview.visualFingerprint,
    );
  }, 20000);
});
