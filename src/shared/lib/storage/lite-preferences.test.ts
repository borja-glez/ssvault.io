import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBrowserStorageFixture } from '../../../test/browser-storage-fixtures';
import { loadLitePreferences, saveLitePreferences } from './lite-preferences';
import { LITE_PREFERENCES_STORAGE_KEY } from './lite-storage-contract';

describe('lite-preferences storage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('persiste y recupera preferencias Lite válidas desde localStorage', () => {
    const browser = createBrowserStorageFixture();
    vi.stubGlobal('window', browser);

    saveLitePreferences({
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

    expect(loadLitePreferences()).toEqual({
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
  });

  it('ignora payloads corruptos o fuera de contrato', () => {
    const browser = createBrowserStorageFixture();
    vi.stubGlobal('window', browser);

    browser.localStorage.setItem(LITE_PREFERENCES_STORAGE_KEY, '{bad json');
    expect(loadLitePreferences()).toBeNull();

    browser.localStorage.setItem(
      LITE_PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        profileId: 'web',
        mode: 'password',
        password: {
          length: 0,
          includeSymbols: true,
        },
        passphrase: {
          wordCount: 4,
          separator: '-',
        },
      }),
    );

    expect(loadLitePreferences()).toBeNull();
  });

  it('serializa solo el contrato permitido y excluye secretos añadidos por error', () => {
    const browser = createBrowserStorageFixture();
    vi.stubGlobal('window', browser);

    saveLitePreferences({
      profileId: 'web',
      mode: 'passphrase',
      password: {
        length: 20,
        includeSymbols: true,
      },
      passphrase: {
        wordCount: 6,
        separator: '.',
      },
      masterPassword: 'should-not-persist',
      result: 'ephemeral-preview',
    } as never);

    const serialized = browser.localStorage.getItem(
      LITE_PREFERENCES_STORAGE_KEY,
    );

    expect(serialized).not.toContain('masterPassword');
    expect(serialized).not.toContain('ephemeral-preview');
    expect(loadLitePreferences()).toEqual({
      profileId: 'web',
      mode: 'passphrase',
      password: {
        length: 20,
        includeSymbols: true,
      },
      passphrase: {
        wordCount: 6,
        separator: '.',
      },
    });
  });
});
