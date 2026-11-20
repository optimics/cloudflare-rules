# Cloudflare rules for a same-origin Google tag setup

Two Cloudflare Snippets that serve Google tags and collect tracking data on the website's own domain.

| Path on the website | Cloudflare sends it to | Code |
| --- | --- | --- |
| `/scripts/…` | Google tag gateway, `gtm-<container>.fps.goog` | [`snippets/google-tag-gateway.js`](snippets/google-tag-gateway.js) |
| `/metrics/…` | Server-side Tag Manager at `events.<domain>` | [`snippets/metrics-proxy.js`](snippets/metrics-proxy.js) |

The examples use `www.example.com`. Replace the domains and container IDs with your own.

## Cloudflare (each zone)

1. **Snippet `metrics-proxy`:** code [`snippets/metrics-proxy.js`](snippets/metrics-proxy.js), rule [`rules/metrics.txt`](rules/metrics.txt).
2. **Snippet `google-tag-gateway`:** code [`snippets/google-tag-gateway.js`](snippets/google-tag-gateway.js), with one `GATEWAY` line per website, and rule [`rules/scripts.txt`](rules/scripts.txt).
3. **Cache rule:** Bypass cache, expression [`rules/cache-and-waf.txt`](rules/cache-and-waf.txt).
4. **WAF custom rule:** Skip bot protection, rate limiting and managed rules, with the same expression. Tracking requests run in the background and can't answer a bot challenge, so a challenged request is a lost event.
5. **DNS:** keep the `events.<domain>` record proxied. It is the target of `/metrics`.

Snippets need the Pro plan or higher. On the Free plan, use a Worker with the same code.

## Website

- Replace the current Tag Manager snippet with [`website/gtm-snippet.html`](website/gtm-snippet.html), below the consent mode defaults.
- If `/scripts` fails, the snippet loads Tag Manager from googletagmanager.com.
- With consent mode, keep Cloudflare's automatic tag insertion off.
- If the site has a Content Security Policy, allow `'self'` in `script-src` and `connect-src`.

## Tag Manager

- **Server container:** in Admin > Container Settings, the server container URLs are `https://www.example.com/metrics`, one per domain, all with the same path.
- **Web container:**
    - Google tags that send to the server container use `server_container_url` = `https://www.example.com/metrics`.
    - Google Ads Google tags have no `server_container_url`, so their scripts load through `/scripts`.

## Health checks

Each URL returns `ok`:

- `https://www.example.com/metrics/healthy`
- `https://www.example.com/scripts/healthy`
- `https://www.example.com/scripts/?validate_geo=healthy`

The geo check fails with an error (500) when the request has no `X-Forwarded-Country` header. The gateway snippet sets it from Cloudflare.

## Notes

- The gateway snippet doesn't forward the site's cookies to Google.
- Both snippets set `X-Forwarded-For` from `CF-Connecting-IP`, so a value sent by the browser can't replace the visitor's IP.
- `/metrics` and `/scripts` must not overlap: Google tag gateway and the server container each need their own path.
