import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBrowserStorageFixture } from '../../../test/browser-storage-fixtures';
import { createResolvedRequest } from '../../../test/lite-fixtures';
import {
  listStoredLiteProfiles,
  replaceStoredLiteProfiles,
  upsertStoredLiteProfile,
} from './lite-profile-store';

function createStoredProfile() {
  const resolvedRequest = createResolvedRequest({
    profileId: 'web',
    mode: 'passphrase',
    passphrase: {
      wordCount: 6,
      separator: '.',
    },
  });

  return {
    id: resolvedRequest.canonicalService.canonicalId,
    label: 'Example Service / alice@example.com / Web generalista',
    canonicalService: resolvedRequest.canonicalService,
    profileId: resolvedRequest.profile.id,
    mode: resolvedRequest.options.mode,
    options: resolvedRequest.options,
    updatedAt: '2026-04-04T12:00:00.000Z',
  };
}

describe('lite-profile-store', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('guarda y lista perfiles Lite no secretos en IndexedDB', async () => {
    const browser = createBrowserStorageFixture();
    vi.stubGlobal('window', browser);

    const profile = createStoredProfile();
    await upsertStoredLiteProfile(profile);

    await expect(listStoredLiteProfiles()).resolves.toEqual([profile]);
  });

  it('reemplaza el store completo durante importaciones', async () => {
    const browser = createBrowserStorageFixture();
    vi.stubGlobal('window', browser);

    await upsertStoredLiteProfile(createStoredProfile());

    const resolvedReplacement = createResolvedRequest({
      service: 'Service Two',
      account: 'account-two',
      namespace: 'personal',
      profileId: 'web',
      mode: 'password',
      version: 2,
      password: {
        length: 24,
        includeSymbols: true,
      },
    });

    const replacement = {
      id: resolvedReplacement.canonicalService.canonicalId,
      label: 'Service Two / account-two / Web generalista',
      canonicalService: resolvedReplacement.canonicalService,
      profileId: resolvedReplacement.profile.id,
      mode: resolvedReplacement.options.mode,
      options: resolvedReplacement.options,
      updatedAt: '2026-04-05T12:00:00.000Z',
    };

    await replaceStoredLiteProfiles([replacement]);

    await expect(listStoredLiteProfiles()).resolves.toEqual([replacement]);
  });

  it('sanea campos secretos o efímeros antes de persistir', async () => {
    const browser = createBrowserStorageFixture();
    vi.stubGlobal('window', browser);

    const profile = createStoredProfile();
    await upsertStoredLiteProfile({
      ...profile,
      masterPassword: 'top-secret',
      result: 'derived-secret-preview',
      derivationExecution: {
        runtime: 'worker',
      },
    } as never);

    const [stored] = await listStoredLiteProfiles();

    expect(stored).toEqual(profile);
    expect(stored).not.toHaveProperty('masterPassword');
    expect(stored).not.toHaveProperty('result');
    expect(stored).not.toHaveProperty('derivationExecution');
  });

  it('falla si IndexedDB no está disponible', async () => {
    vi.stubGlobal('window', {
      localStorage: createBrowserStorageFixture().localStorage,
    });

    await expect(listStoredLiteProfiles()).rejects.toThrow(
      'IndexedDB no está disponible en este entorno.',
    );
  });
});
