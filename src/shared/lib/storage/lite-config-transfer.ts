import type {
  LiteConfigurationExportEnvelope,
  LiteLocalPreferences,
  StoredLiteProfileConfiguration,
} from '../../types/lite';
import { loadLitePreferences, saveLitePreferences } from './lite-preferences';
import {
  listStoredLiteProfiles,
  replaceStoredLiteProfiles,
} from './lite-profile-store';
import {
  LITE_PREFERENCES_STORAGE_KEY,
  sanitizeLiteConfigurationExportEnvelope,
} from './lite-storage-contract';

export async function exportLiteConfiguration(): Promise<LiteConfigurationExportEnvelope> {
  const preferences = loadLitePreferences();
  const profiles = await listStoredLiteProfiles();

  return {
    format: 'ssvault-lite-config',
    version: 1,
    exportedAt: new Date().toISOString(),
    preferences,
    profiles,
  };
}

export function serializeLiteConfigurationExport(
  bundle: LiteConfigurationExportEnvelope,
) {
  return JSON.stringify(bundle, null, 2);
}

export function parseLiteConfigurationImport(
  rawValue: string,
): LiteConfigurationExportEnvelope {
  const parsed = JSON.parse(rawValue) as unknown;
  const sanitized = sanitizeLiteConfigurationExportEnvelope(parsed);

  if (!sanitized) {
    throw new Error('Formato de importación Lite no válido.');
  }

  return sanitized;
}

export async function applyLiteConfigurationImport(
  bundle: LiteConfigurationExportEnvelope,
) {
  const sanitizedBundle = sanitizeLiteConfigurationExportEnvelope(bundle);

  if (!sanitizedBundle) {
    throw new Error('Formato de importación Lite no válido.');
  }

  const profiles = (sanitizedBundle.profiles ??
    []) as StoredLiteProfileConfiguration[];
  await replaceStoredLiteProfiles(profiles);

  if (typeof window === 'undefined') {
    return;
  }

  if (sanitizedBundle.preferences) {
    saveLitePreferences(sanitizedBundle.preferences as LiteLocalPreferences);
    return;
  }

  window.localStorage.removeItem(LITE_PREFERENCES_STORAGE_KEY);
}
