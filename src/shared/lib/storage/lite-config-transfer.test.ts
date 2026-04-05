import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBrowserStorageFixture } from '../../../test/browser-storage-fixtures';
import { createResolvedRequest } from '../../../test/lite-fixtures';
import {
  applyLiteConfigurationImport,
  exportLiteConfiguration,
  parseLiteConfigurationImport,
  serializeLiteConfigurationExport,
} from './lite-config-transfer';
import { saveLitePreferences } from './lite-preferences';
import {
  upsertStoredLiteProfile,
  listStoredLiteProfiles,
} from './lite-profile-store';
import { LITE_PREFERENCES_STORAGE_KEY } from './lite-storage-contract';

function createStoredProfile() {
  const resolvedRequest = createResolvedRequest({
    service: 'Imported Service',
    account: 'import@example.com',
    namespace: 'team',
    profileId: 'web',
    mode: 'password',
    version: 2,
    password: {
      length: 24,
      includeSymbols: true,
    },
  });

  return {
    id: resolvedRequest.canonicalService.canonicalId,
    label: 'Imported Service / import@example.com / Web generalista',
    canonicalService: resolvedRequest.canonicalService,
    profileId: resolvedRequest.profile.id,
    mode: resolvedRequest.options.mode,
    options: resolvedRequest.options,
    updatedAt: '2026-04-04T13:00:00.000Z',
  };
}

describe('lite-config-transfer', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('exporta solo configuración Lite persistible y excluye secretos', async () => {
    const browser = createBrowserStorageFixture();
    vi.stubGlobal('window', browser);

    saveLitePreferences({
      profileId: 'web',
      mode: 'password',
      password: {
        length: 20,
        includeSymbols: true,
      },
      passphrase: {
        wordCount: 4,
        separator: '-',
      },
      masterPassword: 'should-not-leak',
    } as never);

    await upsertStoredLiteProfile({
      ...createStoredProfile(),
      masterPassword: 'should-not-leak',
      result: 'derived-preview',
    } as never);

    const exported = await exportLiteConfiguration();
    const serialized = serializeLiteConfigurationExport(exported);

    expect(exported.preferences).toEqual({
      profileId: 'web',
      mode: 'password',
      password: {
        length: 20,
        includeSymbols: true,
      },
      passphrase: {
        wordCount: 4,
        separator: '-',
      },
    });
    expect(exported.profiles).toEqual([createStoredProfile()]);
    expect(serialized).not.toContain('masterPassword');
    expect(serialized).not.toContain('derived-preview');
  });

  it('parsea importaciones válidas saneando campos ajenos al contrato', () => {
    const profile = createStoredProfile();

    const parsed = parseLiteConfigurationImport(
      JSON.stringify({
        format: 'ssvault-lite-config',
        version: 1,
        exportedAt: '2026-04-04T13:30:00.000Z',
        preferences: {
          profileId: 'legacy',
          mode: 'password',
          password: {
            length: 16,
            includeSymbols: false,
          },
          passphrase: {
            wordCount: 4,
            separator: '-',
          },
          masterPassword: 'not-allowed',
        },
        profiles: [
          {
            ...profile,
            result: 'ephemeral',
          },
        ],
      }),
    );

    expect(parsed.preferences).toEqual({
      profileId: 'legacy',
      mode: 'password',
      password: {
        length: 16,
        includeSymbols: false,
      },
      passphrase: {
        wordCount: 4,
        separator: '-',
      },
    });
    expect(parsed.profiles).toEqual([profile]);
  });

  it('rechaza envelopes inválidos y aplica importaciones reemplazando preferencias y perfiles', async () => {
    const browser = createBrowserStorageFixture();
    vi.stubGlobal('window', browser);

    expect(() =>
      parseLiteConfigurationImport(
        JSON.stringify({ format: 'unknown', version: 1, profiles: [] }),
      ),
    ).toThrow('Formato de importación Lite no válido.');

    saveLitePreferences({
      profileId: 'web',
      mode: 'password',
      password: {
        length: 20,
        includeSymbols: true,
      },
      passphrase: {
        wordCount: 4,
        separator: '-',
      },
    });
    await upsertStoredLiteProfile(createStoredProfile());

    await applyLiteConfigurationImport({
      format: 'ssvault-lite-config',
      version: 1,
      exportedAt: '2026-04-04T14:00:00.000Z',
      preferences: null,
      profiles: [],
    });

    expect(
      browser.localStorage.getItem(LITE_PREFERENCES_STORAGE_KEY),
    ).toBeNull();
    await expect(listStoredLiteProfiles()).resolves.toEqual([]);
  });
});
