export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const CSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://playground.lostinvirtual.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://playground.lostinvirtual.com",
      "connect-src 'self' https://api.lostinvirtual.com https://auth.lostinvirtual.com",
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
      'X-XSS-Protection': '0',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'X-Permitted-Cross-Domain-Policies': 'none'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: Object.assign({}, securityHeaders, {
          'Access-Control-Allow-Origin': 'https://playground.lostinvirtual.com',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400'
        })
      });
    }

    if (url.pathname.startsWith('/api/') || url.pathname === '/health') {
      try {
        const apiUrl = 'http://43.134.5.138:8787' + url.pathname + url.search;
        const headers = new Headers();
        for (const [key, value] of request.headers) {
          var k = key.toLowerCase();
          if (!['host','cf-connecting-ip','cf-ipcountry','cf-ray','cf-visitor','cdn-loop','x-forwarded-for','x-forwarded-proto','x-real-ip','content-length'].includes(k)) {
            headers.set(key, value);
          }
        }

        const resp = await fetch(apiUrl, {
          method: request.method,
          headers: headers,
          body: (request.method !== 'GET' && request.method !== 'HEAD') ? request.body : undefined
        });

        const newResp = new Response(resp.body, resp);
        for (const [key, value] of Object.entries(securityHeaders)) {
          newResp.headers.set(key, value);
        }
        newResp.headers.set('Access-Control-Allow-Origin', 'https://playground.lostinvirtual.com');
        return newResp;
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Backend unavailable' }), {
          status: 502,
          headers: Object.assign({ 'Content-Type': 'application/json' }, securityHeaders)
        });
      }
    }

    const resp = await env.ASSETS.fetch(request);
    const newResp = new Response(resp.body, resp);
    for (const [key, value] of Object.entries(securityHeaders)) {
      newResp.headers.set(key, value);
    }
    return newResp;
  }
}
