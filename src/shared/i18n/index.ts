import { es } from './es';
import { en } from './en';
import { LOCALE_COOKIE, isValidLocale } from './locales';
import type { Locale } from './locales';
import type { Translations } from './types';

export type { Locale, Translations };
export { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_LABELS } from './locales';
export { SUPPORTED_LOCALES, isValidLocale } from './locales';

const dictionaries: Record<Locale, Translations> = { es, en };

export function getTranslations(locale: Locale): Translations {
  return dictionaries[locale];
}

/** Resolve locale from cookie string (e.g. request header). */
export function resolveLocaleFromCookie(
  cookieHeader: string | null,
): Locale | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`),
  );
  if (match && isValidLocale(match[1])) return match[1];
  return null;
}

/** Resolve locale from Accept-Language header. */
export function resolveLocaleFromAcceptLanguage(
  header: string | null,
): Locale | null {
  if (!header) return null;
  const tags = header
    .split(',')
    .map((part) => part.split(';')[0].trim().toLowerCase());
  for (const tag of tags) {
    const primary = tag.split('-')[0];
    if (isValidLocale(primary)) return primary;
  }
  return null;
}
