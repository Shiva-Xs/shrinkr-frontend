# Shrinkr Frontend

Frontend for [Shrinkr](https://app.shrinkr.in), a free URL shortener. No signup, no ads.

## Overview

Single-page application built with vanilla HTML, CSS, and JavaScript. No frameworks, no build step. Everything lives in one `index.html` (~210 KB) with a Three.js particle hero. Talks to the [backend API](https://github.com/Shiva-Xs/shrinkr-backend) over HTTPS.

**Live:** [app.shrinkr.in](https://app.shrinkr.in)

## Features

| Feature | Details |
| --- | --- |
| URL shortening | Paste a URL, get a 6-character short link |
| QR codes | Downloadable QR code for every link |
| Click analytics | Real-time click counts on the manage page |
| Password protection | Optional password gate before redirect |
| Expiry dates | Link stops working after a set date/time |
| Click limits | Link stops working after N clicks |
| My Links | Browser-stored link history with manage/delete |
| Link management | Edit expiry, click limit, password, or delete via token |
| Safe Browsing | Shows Google Safe Browsing scan status |
| 3D hero | Three.js particle sphere with text morphing |
| Responsive | Works on desktop, tablet, mobile |
| Accessible | ARIA labels, semantic HTML, noscript fallback |

## Tech Stack

| Layer | What |
| --- | --- |
| Markup | HTML5 with structured data and Open Graph |
| Styling | Vanilla CSS, custom properties, glassmorphism |
| Logic | Vanilla JS (ES6+), no deps |
| 3D | [Three.js r128](https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js) via CDN |
| Fonts | Cormorant Garamond, DM Sans, JetBrains Mono (Google Fonts) |
| Hosting | Cloudflare Pages |
| API | `https://api.shrinkr.in` ([source](https://github.com/Shiva-Xs/shrinkr-backend)) |

## Project Structure

```
shrinkr-frontend/
├── index.html               # Entire SPA: markup, styles, scripts
├── _headers                  # Cloudflare Pages headers (CSP, caching)
├── wrangler.json             # Cloudflare Wrangler config
├── staticwebapp.config.json  # Azure Static Web Apps config (alternative)
├── robots.txt                # Crawl rules
├── sitemap.xml               # Sitemap
├── favicon.svg               # SVG favicon
├── favicon-32.png            # 32x32 favicon
├── favicon-48.png            # 48x48 favicon
├── og-image.png              # OG image (1200x630)
├── .gitignore
├── .assetsignore              # Cloudflare asset ignore
├── dist/                      # Production deploy directory
└── README.md
```

## Architecture

Single-file SPA. Client-side routing handles three views:

| Route | What it shows |
| --- | --- |
| `/` | Hero, shortener input, features, how-it-works |
| `my-links` | All links stored in `localStorage` |
| `manage/:slug` | Analytics, edit settings, delete for one link |

```
index.html (styles + markup + scripts)
        |
        | HTTPS / JSON
        v
  api.shrinkr.in
  Spring Boot 3.3 / PostgreSQL / Redis
```

## Security Headers

Configured in `_headers` (Cloudflare) and `staticwebapp.config.json` (Azure):

- **Content-Security-Policy**: scripts, styles, fonts, images, and API connections locked to trusted origins
- **X-Content-Type-Options**: `nosniff`
- **X-Frame-Options**: `DENY`
- **Referrer-Policy**: `strict-origin-when-cross-origin`
- **Cache-Control**: static assets cached aggressively, HTML always revalidated

## SEO

- Meta tags: title, description, keywords, canonical, robots
- Open Graph and Twitter Card tags with image
- JSON-LD: `WebApplication`, `FAQPage` (7 questions), `HowTo` (4 steps)
- `sitemap.xml` and `robots.txt`
- Semantic HTML (`header`, `nav`, `main`, `section`, `footer`, single `h1`)
- Noscript fallback with full content for crawlers

## Local Development

No build step. Just serve the files.

**Python:**
```bash
cd shrinkr-frontend
python3 -m http.server 8080
```

**VS Code Live Server:**
Right-click `index.html` > Open with Live Server.

**npx:**
```bash
cd shrinkr-frontend
npx -y serve .
```

### Pointing to a local backend

The API URL is set around line 3446 in `index.html`:

```javascript
// production (default):
: 'https://api.shrinkr.in';

// local:
: 'http://localhost:8080';
```

## Deployment

### Cloudflare Pages

Current deployment target. Config in `wrangler.json`:

```json
{
  "name": "shrinkr-frontend",
  "assets": {
    "directory": ".",
    "not_found_handling": "single-page-application"
  }
}
```

Manual deploy:
```bash
npx wrangler pages deploy . --project-name=shrinkr-frontend
```

Or connect the repo to Cloudflare Pages for auto-deploy on push.

### Azure Static Web Apps

`staticwebapp.config.json` has equivalent header and SPA fallback rules for Azure SWA.

## Design

CSS custom properties define the color system:

| Token | Use |
| --- | --- |
| `--black` / `--white` | Base colors |
| `--w95` to `--w02` | White at varying opacity |

Fonts: Cormorant Garamond (headings), DM Sans (body), JetBrains Mono (code/URLs).

Effects: glassmorphism (`backdrop-filter: blur()`), Three.js particle sphere, text morphing on hover, scroll-triggered reveal animations.

## Related

- [shrinkr-backend](https://github.com/Shiva-Xs/shrinkr-backend): Spring Boot 3.3 API with PostgreSQL, Redis, Flyway, Google Safe Browsing

## License

Open source. See the backend repository for license details.
