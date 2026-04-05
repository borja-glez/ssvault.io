const serverContentSecurityPolicyDirectives = {
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'object-src': ["'none'"],
} as const;

export function buildServerContentSecurityPolicy() {
  return Object.entries(serverContentSecurityPolicyDirectives)
    .map(([directive, values]) => `${directive} ${values.join(' ')}`)
    .join('; ');
}

export function buildSecurityHeaders() {
  return {
    // Astro injects the script/style CSP meta with per-page hashes. Middleware keeps the
    // server-only directives that do not depend on Astro's runtime-generated inline scripts.
    'Content-Security-Policy': buildServerContentSecurityPolicy(),
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Origin-Agent-Cluster': '?1',
    'Permissions-Policy':
      'accelerometer=(), autoplay=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), usb=()',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=15552000',
    'X-Content-Type-Options': 'nosniff',
    'X-DNS-Prefetch-Control': 'off',
    'X-Frame-Options': 'DENY',
    'X-Permitted-Cross-Domain-Policies': 'none',
  } as const;
}
