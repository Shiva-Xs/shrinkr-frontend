/**
 * Routing in front of the static assets.
 *
 * The project ran with not_found_handling: "single-page-application", which
 * answered EVERY unmatched path with index.html at HTTP 200. /vite/.env,
 * /wp-admin/install.php and every scraped typo became a 200-status duplicate of
 * the homepage: Google logs those as soft 404s and spends crawl budget on them,
 * and a scanner reads 200 as a probe worth repeating. app.shrinkr.in sat at
 * 0 of 6 pages indexed while that was true.
 *
 * The obvious fix - a _redirects file mapping the SPA routes to /index.html
 * with status 200 - does not work here. Workers Assets rejects rewrites:
 *
 *   Found 5 invalid redirect rules:
 *   Infinite loop detected in this rule and has been ignored.
 *     at _redirects:14 | /manage/*    /index.html   200
 *
 * Rewrites are a Pages feature, not a Workers Assets one. So the SPA routes are
 * matched here instead, and everything else falls through to the asset handler,
 * which now serves 404.html with a real 404 (not_found_handling: "404-page").
 *
 * A static asset that exists is served without invoking this Worker at all, so
 * this only runs for paths that would otherwise have 404ed.
 */

/**
 * Client-side routes owned by route() in index.html.
 *
 * These only reach this Worker because wrangler.json sets
 * assets.run_worker_first. Without it the asset layer answers first, and for a
 * NAVIGATION request (Sec-Fetch-Mode: navigate) that matches no file it serves
 * not_found_handling's 404.html without ever invoking this Worker - so every
 * /unlock/, /warning/, /gone/, /manage/, /result/ and /my-links URL 404'd for
 * real visitors: password links, the malware interstitial and the manage page
 * were all unreachable.
 *
 * It hid because it is navigation-only. The same URL fetched without that
 * header - curl, a health check, fetch() - ran the Worker and returned 200, so
 * the routes looked fine from every tool except a browser.
 */
const SPA_ROUTES = [
  /^\/manage\/[^/]+\/?$/,
  /^\/unlock\/[^/]+\/?$/,
  /^\/warning\/[^/]+\/?$/,
  /^\/gone\/[^/]+\/?$/,
  /^\/result\/[^/]+\/?$/,
  /^\/my-links\/?$/,
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (SPA_ROUTES.some((route) => route.test(url.pathname))) {
      // Ask for "/" rather than "/index.html". The asset handler normalises an
      // explicit /index.html back to / with a 307, so requesting the file by
      // name hands the browser a redirect instead of the app shell. Asking for
      // the directory returns the same bytes at 200.
      const shell = new URL('/', url);
      return env.ASSETS.fetch(new Request(shell, request));
    }

    // Anything else: a real asset, or 404.html with a 404.
    return env.ASSETS.fetch(request);
  },
};
