// Cloudflare Snippet: google-tag-gateway
// Serves Google tags from www.example.com/scripts/... through the Google tag
// gateway endpoint of the site's web container (manual gateway setup).
// Rule: rules/scripts.txt
//
// The gateway host is the web container ID in lower case:
// GTM-XXXXXXX -> gtm-xxxxxxx.fps.goog

// One line per website: hostname -> gateway of its web container.
const GATEWAY = {
  'www.example.com': 'gtm-xxxxxxx.fps.goog',
  'www.example.net': 'gtm-yyyyyyy.fps.goog',
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const gateway = GATEWAY[url.hostname];
    if (!gateway) return fetch(request);

    const upstream = new URL(url);
    upstream.hostname = gateway;

    const headers = new Headers(request.headers);
    headers.delete('Host');
    headers.delete('Cookie'); // the site's cookies are not sent to Google
    headers.set('X-Forwarded-Host', url.hostname);
    headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP'));
    // Visitor country, needed by Google's geo check (?validate_geo=healthy)
    if (request.cf && request.cf.country) headers.set('X-Forwarded-Country', request.cf.country);

    const hasBody = !(request.method === 'GET' || request.method === 'HEAD');
    const init = { method: request.method, headers, redirect: 'manual' };
    if (hasBody) { init.body = request.body; init.duplex = 'half'; }

    return fetch(upstream.toString(), init);
  },
};
