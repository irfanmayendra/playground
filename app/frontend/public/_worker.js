export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const CSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://playground.lostinvirtual.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://playground.lostinvirtual.com https://*.tile.openstreetmap.org",
      "connect-src 'self' https://api.lostinvirtual.com https://auth.lostinvirtual.com https://nominatim.openstreetmap.org",
      "frame-src 'self' https://auth.lostinvirtual.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests"
    ].join('; ');

    const securityHeaders = {
      'Content-Security-Policy': CSP,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=(), usb=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    };

    // Service Worker & manifest: no CSP restrictions
    if (url.pathname === '/sw.js' || url.pathname === '/manifest.json') {
      const res = await env.ASSETS.fetch(request);
      const newRes = new Response(res.body, res);
      newRes.headers.set('Content-Type', url.pathname === '/sw.js' ? 'application/javascript' : 'application/json');
      newRes.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      Object.entries(securityHeaders).forEach(([k, v]) => newRes.headers.set(k, v));
      return newRes;
    }

    const response = await env.ASSETS.fetch(request);
    const newResponse = new Response(response.body, response);

    Object.entries(securityHeaders).forEach(([k, v]) => {
      newResponse.headers.set(k, v);
    });

    return newResponse;
  },
};
