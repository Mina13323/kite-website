# MWG Advertising Agency — website clone

A full clone of [mwg.co.com](https://www.mwg.co.com/home/about) rebuilt from scratch, shipped in two
renderers that share **one content source**:

| Renderer | Path | Purpose |
| --- | --- | --- |
| **Static site** | `tools/build-static.mjs` → `static/` | Runs anywhere with Node, no PHP required. Used for preview. |
| **Laravel Blade** | `routes/web.php` + `resources/views/` | Native to this repo. Run with `php artisan serve`. |

Both read `resources/data/site.json`, so editing content once updates both.

---

## Quick start

### Static site (no PHP needed)

```bash
npm run site:build     # generate ./static
npm run site:serve     # http://localhost:4173
# or both at once
npm run site:dev
```

### Laravel app

```bash
composer install
cp .env.example .env && php artisan key:generate
php artisan serve      # http://localhost:8000
```

No database is required — all content is read from JSON.

---

## Routes

Every route below exists in both renderers (123 static pages total).

| Route | Description |
| --- | --- |
| `/`, `/home`, `/home/about` | Home: video hero, pillars, work marquees, About/Mission/Vision tabs, case studies, clients |
| `/big-bang` | 16 breakthrough campaign write-ups |
| `/services` | Service index (9 tiles) |
| `/services/{slug}` | 9 detail pages: digital-marketing, graphic-design, web-mobile-apps, btl, content-creation, social-media, seo, media-buying, media-production |
| `/portfolio` | Filterable project grid + load-more |
| `/project/{slug}` | 23 project pages (video frames, making-of, photoshoots, related work) |
| `/case-studies` | Featured case study + grid |
| `/case-study/{slug}` | Individual case studies |
| `/blog` | THE BIG BANG LOG — 79 posts, load-more |
| `/post/{slug}` | Article layout with related posts |
| `/contact-us` | Map, three offices, lead form |

Plus `404.html`, `sitemap.xml` and `robots.txt` in the static build.

---

## Structure

```
resources/data/site.json      ← all content (nav, services, projects, posts, offices…)
public/assets/css/site.css    ← full design system (no framework)
public/assets/js/site.js      ← nav, tabs, filters, marquees, multiselect, reveals
tools/templates.mjs           ← shared HTML fragments for the static build
tools/build-static.mjs        ← static site generator
tools/serve-static.mjs        ← clean-URL static server
app/Support/SiteData.php      ← JSON loader (cached in production)
app/Http/Controllers/PageController.php
resources/views/              ← layouts, partials, components, pages
```

## Features

- Sticky header with multi-level dropdowns and a mobile drawer
- Auto-scrolling work and client marquees (pause on hover)
- Tabbed About section (About MWG / Mission / Vision)
- Portfolio category filtering + progressive "load more"
- Lead form with a "Select Services" multiselect, select-all and mock reCAPTCHA
  (POSTs to a validated Laravel endpoint; static build handles it client-side)
- Scroll reveal animations, back-to-top, preloader
- Responsive down to 360px, SEO meta and Open Graph tags per page

## Notes

- Images and video are referenced from the original `mwg.co.com` CDN, so the layout matches the
  source exactly. To self-host, download them into `public/assets/` and update the URLs in
  `resources/data/site.json`.
- Article bodies for the 79 blog posts use a shared editorial template with each post's real title,
  date and excerpt; only the linked article was published in full on the source site.
- Content and trademarks belong to MWG Advertising Agency — this is a rebuild for reference.
