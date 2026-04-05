import { defineMiddleware } from 'astro:middleware';
import { buildSecurityHeaders } from './shared/security/headers';
import {
  DEFAULT_LOCALE,
  resolveLocaleFromCookie,
  resolveLocaleFromAcceptLanguage,
} from './shared/i18n';

export const onRequest = defineMiddleware(async (context, next) => {
  const cookieHeader = context.request.headers.get('cookie');
  const locale =
    resolveLocaleFromCookie(cookieHeader) ??
    resolveLocaleFromAcceptLanguage(
      context.request.headers.get('accept-language'),
    ) ??
    DEFAULT_LOCALE;

  context.locals.locale = locale;

  const response = await next();

  for (const [headerName, headerValue] of Object.entries(
    buildSecurityHeaders(),
  )) {
    response.headers.set(headerName, headerValue);
  }

  return response;
});
