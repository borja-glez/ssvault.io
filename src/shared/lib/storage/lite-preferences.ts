import type { LiteLocalPreferences } from '../../types/lite';
import {
  LITE_PREFERENCES_STORAGE_KEY,
  sanitizeLitePreferences,
} from './lite-storage-contract';

export function loadLitePreferences(): LiteLocalPreferences | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(LITE_PREFERENCES_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    return sanitizeLitePreferences(parsed);
  } catch {
    return null;
  }
}

export function saveLitePreferences(preferences: LiteLocalPreferences) {
  if (typeof window === 'undefined') {
    return;
  }

  const sanitized = sanitizeLitePreferences(preferences);

  if (!sanitized) {
    return;
  }

  window.localStorage.setItem(
    LITE_PREFERENCES_STORAGE_KEY,
    JSON.stringify(sanitized),
  );
}
