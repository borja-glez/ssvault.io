export const navLinks = [
  { href: '/', label: 'Vault' },
  { href: '/docs', label: 'Docs' },
  { href: '/details', label: 'Details' },
] as const;

export const githubUrl = 'https://github.com/borja-glez/ssvault.io';

export const siteConfig = {
  name: 'ssvault Lite',
  siteName: 'ssvault.io',
  siteUrl: 'https://ssvault.io',
  locale: 'es_ES',
  language: 'es',
  themeColor: '#0C0E12',
  backgroundColor: '#0C0E12',
  title:
    'ssvault Lite — Stateless local password derivation with Argon2id + HKDF',
  description:
    'ssvault Lite ejecuta derivación local real con Argon2id + HKDF-SHA-256, prioriza Web Worker cuando existe y no persiste secretos ni depende de backend.',
  defaultCanonicalPath: '/',
  defaultOgImagePath: '/og/ssvault-lite-baseline.svg',
  manifestPath: '/manifest.webmanifest',
  robots:
    'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
} as const;

export function toAbsoluteSiteUrl(pathname: string) {
  return new URL(pathname, siteConfig.siteUrl).toString();
}
