import { describe, expect, it } from 'vitest';
import {
  buildSecurityHeaders,
  buildServerContentSecurityPolicy,
} from './headers';

describe('security headers baseline', () => {
  it('mantiene en servidor solo las directivas CSP que no interfieren con Astro', () => {
    const policy = buildServerContentSecurityPolicy();

    expect(policy).toContain("base-uri 'self'");
    expect(policy).toContain("form-action 'self'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).not.toContain('script-src');
    expect(policy).not.toContain('style-src');
  });

  it('expone los headers defensivos esperados para SSR', () => {
    const headers = buildSecurityHeaders();

    expect(headers['Content-Security-Policy']).toBe(
      buildServerContentSecurityPolicy(),
    );
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Strict-Transport-Security']).toContain('max-age=15552000');
  });
});
