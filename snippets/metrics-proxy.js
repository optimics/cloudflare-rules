// Cloudflare Snippet: metrics-proxy
// Forwards www.example.com/metrics/... to events.example.com/metrics/...,
// the hostname of the server-side Tag Manager container.
// Rule: rules/metrics.txt

export default {
  async fetch(request) {
    const url = new URL(request.url);
    // www.example.com/metrics/... -> events.example.com/metrics/...
    url.hostname = url.hostname.replace(/^www\./, "events.");
    const forwarded = new Request(url, request);
    // The server container reads the visitor IP from the first X-Forwarded-For entry.
    forwarded.headers.set("X-Forwarded-For", request.headers.get("CF-Connecting-IP"));
    return fetch(forwarded);
  },
};
