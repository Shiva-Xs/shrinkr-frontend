export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Match short link slug pattern e.g. /Vpd16r
  if (path.match(/^\/[a-zA-Z0-9]{4,12}$/)) {
    const slug = path.substring(1);
    const backendApiUrl = `https://api.shrinkr.in${path}`;

    let response;
    try {
      response = await fetch(backendApiUrl, {
        method: request.method,
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': request.headers.get('User-Agent') || 'Cloudflare-Pages-Edge'
        },
        redirect: 'manual'
      });
    } catch (err) {
      return next();
    }

    // 1. Pass through HTTP redirects (301, 302, 307, 308) directly to browser
    if (response.status >= 300 && response.status < 400) {
      return response;
    }

    // 2. Extract machine-readable error payload if non-2xx/3xx
    let jsonBody = null;
    try {
      jsonBody = await response.json();
    } catch {
      jsonBody = {};
    }

    const errorCode = jsonBody.error || jsonBody.code || null;
    const message = jsonBody.message || null;

    // Map status & machine-readable codes to frontend SPA state
    let state = 'error';
    if (response.status === 401) {
      state = 'unlock';
    } else if (response.status === 404) {
      state = 'not-found';
    } else if (response.status === 410) {
      state = 'gone';
    } else if (response.status === 429) {
      state = 'rate-limit';
    } else if (response.status === 451) {
      state = 'blocked';
    } else if (response.status >= 500) {
      state = 'error';
    }

    const stateData = {
      state,
      slug,
      code: errorCode,
      message,
      status: response.status
    };

    // Fetch local static index.html asset from Cloudflare Pages storage
    const assetResponse = await env.ASSETS.fetch(new Request(new URL('/', request.url), request));

    // Inject window.__SHRINKR_STATE__ into <head> using HTMLRewriter
    return new HTMLRewriter()
      .on('head', {
        element(el) {
          el.append(
            `<script>window.__SHRINKR_STATE__ = ${JSON.stringify(stateData)};</script>`,
            { html: true }
          );
        }
      })
      .transform(assetResponse);
  }

  return next();
}
