// ─────────────────────────────────────────────────────────────────────
// Cloudflare Worker: barefootbaltic.lv-proxy
// Deploy on route: barefootbaltic.lv/*
// ─────────────────────────────────────────────────────────────────────
//
// STEP 5 LIVE (2026-04-24, revised) — LATVIAN LAUNCH + DIAGNOSTICS
// ────────────────────────────────────────────────────────────────
// Reverse-proxies barefootbaltic.lv/* to the origin Latvian bundle at
// barefootbaltic.com/lv/*. Shared assets (https://barefootbaltic.com/images/, /fonts/, /css/,
// /js/, /_assets/, /visit/) and locale-independent files (/sitemap.xml,
// /robots.txt, /favicon.ico, /llms.txt) are served straight from the
// .com root without the /lv/ prefix. Everything else is prefixed with
// /lv/ so that the Latvian content bundle is what the user sees.
//
// NOTE: /privacy-policy.html, /thank-you.html, /404.html are NOT in
// ROOT_FILES — they have Latvian translations at /lv/privacy-policy.html
// etc. and the auto-prefix branch serves them correctly.
//
// /blog/ is NOT in ROOT_PREFIXES for the same reason — the entire blog
// (hub + 11 posts) is translated and lives at /lv/blog/.
//
// ─── CHANGES IN THIS REVISION ────────────────────────────────────────
//
// 1. DEBUG logging toggle (DEBUG=true). Enable Observability on the
//    worker in Cloudflare Dashboard, then tail logs while hitting
//    barefootbaltic.lv/_assets/js/bk-i18n.js in incognito. The logs
//    will show the path, the rewritten origin URL, the origin status,
//    and the content-type — which definitively resolves whether Bug A
//    is a worker issue or an origin issue. Once Bug A is diagnosed,
//    flip DEBUG=false and redeploy.
//
// 2. Host header override on the origin fetch. Some CDNs (including
//    Cloudflare Pages' origin) will refuse a request whose Host header
//    says `barefootbaltic.lv` when the routing expects
//    `barefootbaltic.com`. We now explicitly set Host to the origin
//    domain. This is the most likely root cause of Bug A and is
//    defensive either way.
//
// 3. Canonical rewrite is generalised. The old catch-all only caught
//    the homepage; this catches any `barefootbaltic.com/lv/…` canonical
//    and rewrites the locale prefix away, giving `barefootbaltic.lv/…`.
//    This is belt-and-braces — the build pipeline already emits
//    `barefootbaltic.lv` canonicals in the HTML for all pages.
//
// 4. An `x-bfb-proxy` response header documents that the request
//    transited this worker. Useful for smoke tests.
// ─────────────────────────────────────────────────────────────────────

const ORIGIN        = 'https://barefootbaltic.com';
const ORIGIN_HOST   = 'barefootbaltic.com';
const LOCALE_PREFIX = '/lv';

// Bug A (bk-i18n.js 404 on .lv) was confirmed fixed on 2026-04-24 —
// root cause was Host header mismatch on the origin fetch, now
// overridden to ORIGIN_HOST. DEBUG disabled for production to keep
// the Workers Logs stream quiet. Flip back to true temporarily if
// anything odd comes up and you need to tail live traffic.
const DEBUG = false;

// Paths that live at the .com ROOT (locale-independent: shared static
// assets, and a small set of single-source files).
const ROOT_PREFIXES = ['https://barefootbaltic.com/images/', '/fonts/', '/css/', '/js/', '/visit/', '/_assets/'];
const ROOT_FILES    = ['/robots.txt', '/favicon.ico', '/sitemap.xml', '/llms.txt', '/CNAME'];

export default {
  async fetch(request) {
    const url  = new URL(request.url);
    const path = url.pathname;

    // ── Decide origin path ──────────────────────────────────
    let originPath;
    let routedVia;

    if (path.startsWith(LOCALE_PREFIX + '/') || path === LOCALE_PREFIX) {
      // Already has /lv/ — pass through (defensive; shouldn't normally happen
      // on public traffic but can happen if an internal link is wrong).
      originPath = path;
      routedVia  = 'already-prefixed';
    } else if (ROOT_PREFIXES.some(p => path.startsWith(p)) || ROOT_FILES.includes(path)) {
      // Shared, locale-independent asset — serve from .com root.
      originPath = path;
      routedVia  = 'root-passthrough';
    } else {
      // Everything else — prefix with /lv so the Latvian bundle is served.
      originPath = LOCALE_PREFIX + (path === '/' ? '/' : path);
      routedVia  = 'locale-prefixed';
    }

    const originUrl = ORIGIN + originPath + url.search;

    // ── Build forwarded headers ─────────────────────────────
    // IMPORTANT: rewrite Host so the origin CDN accepts the request
    // under its own hostname. Cloudflare Pages' origin can be sensitive
    // to a mismatched Host header and may return a 404 that looks like
    // an asset-not-found but is really a host-routing miss.
    const forwardedHeaders = new Headers(request.headers);
    forwardedHeaders.set('Host', ORIGIN_HOST);
    // Preserve the original host for logging/analytics on the origin.
    forwardedHeaders.set('X-Forwarded-Host', 'barefootbaltic.lv');

    // ── Fetch from origin ───────────────────────────────────
    const originResponse = await fetch(originUrl, {
      method:   request.method,
      headers:  forwardedHeaders,
      body:     request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      redirect: 'follow',
    });

    const contentType = originResponse.headers.get('content-type') || '';

    if (DEBUG) {
      console.log(
        JSON.stringify({
          msg:        'bfb-lv-proxy',
          path,
          routedVia,
          originUrl,
          status:     originResponse.status,
          contentType,
        })
      );
    }

    // ── Non-HTML → pass through as-is ───────────────────────
    if (!contentType.includes('text/html')) {
      const headers = new Headers(originResponse.headers);
      if (ROOT_PREFIXES.some(p => path.startsWith(p))) {
        headers.set('Cache-Control', 'public, max-age=86400');
      }
      headers.set('x-bfb-proxy', `lv:${routedVia}`);
      return new Response(originResponse.body, {
        status:  originResponse.status,
        headers,
      });
    }

    // ── HTML → rewrite ──────────────────────────────────────
    let html = await originResponse.text();

    // Mark the session so the language-suggestion banner on the .com
    // site doesn't re-suggest a redirect the user has already accepted.
    html = html.replace(
      '</head>',
      '<script>try{sessionStorage.setItem("lang_redirected","1");}catch(e){}</script>\n</head>'
    );

    // Rewrite canonical URLs so Latvian pages canonicalise to
    // barefootbaltic.lv/… instead of barefootbaltic.com/lv/… (the
    // build pipeline already emits the right canonicals; this is
    // defence in depth).
    //
    // Pattern: rewrite any http(s)://barefootbaltic.com/lv/... to
    // https://barefootbaltic.lv/... regardless of attribute context.
    html = html.replace(
      /https?:\/\/barefootbaltic\.com\/lv(\/[^"'\s<>]*)?/g,
      (_, rest) => 'https://barefootbaltic.lv' + (rest || '/')
    );

    const headers = new Headers(originResponse.headers);
    headers.set('Content-Type',  'text/html; charset=utf-8');
    headers.set('Cache-Control', 'no-cache');
    headers.set('x-bfb-proxy',   `lv:${routedVia}`);

    return new Response(html, {
      status:  originResponse.status,
      headers,
    });
  }
};
