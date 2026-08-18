# KITE website — final production readiness report

Date: 18 August 2026  
Verified runtime: `node server.cjs` on `0.0.0.0:4173`  
Crawlers: `scripts/qa-production.cjs`, `scripts/verify-public-site.cjs`

## Verdict

**NOT READY** for an official Hostinger production cutover.

The Node public website is functionally closed (0 unexpected 4xx/5xx, 0 broken local assets, 0 production MWG references). Three external blockers remain: PHP is not installed here so Laravel was not HTTP-executed; there is no headed browser; the live `kiteagency-eg.com` origin could not be crawled from this sandbox (TLS reset).

## Architecture (verified from repo files, not guessed)

| Layer | What it is |
| --- | --- |
| Verified public + Studio runtime | Node `server.cjs` (Arena preview, `Procfile` `web: node server.cjs`) |
| Hostinger shared / Apache | Laravel `public/index.php` + `public/.htaccess` |
| Single content store | `storage/app/website/cms.json` seeded from `database/data/website-seed.json` |
| Public HTML | `resources/site/layout.html` + `public-render.cjs` **and** `App\Support\Website\PublicRenderer` |
| Studio builder | Node `/studio` (full). Laravel `/studio` is a login/dashboard gateway over the same JSON. |

Do not deploy Laravel expecting the old `resources/site/content.php` MWG catalog. That file is deleted.

## Routes

| | Count |
| --- | --- |
| Total requested (QA matrix + discovered) | 26 |
| Passed (expected 2xx / 3xx / intentional 404) | 26 |
| Failed | 0 |

Legacy crawler `verify-public-site.cjs`: **15/15 OK**, 0 unexpected, 0 broken assets.

## Pages

| | Count |
| --- | --- |
| Total | 26 |
| Passed | 26 |
| Failed | 0 |

Homepage order verified in HTML: preloader → hero → latest → about → services → case studies → portfolio → clients → CTA → footer.

## Internal links

| | Count |
| --- | --- |
| Total | 522 |
| Passed | 522 |
| Broken | 0 |

Header, mobile nav, footer services, socials, CTAs, service aliases, contact form action: resolved. Studio is not in public nav.

## Services

| | Count |
| --- | --- |
| Official published | 5 |
| Passed | 5 |
| Failed | 0 |

Slugs: `branding`, `media-production`, `web-development`, `digital-content`, `marketing-materials`.  
Aliases `media`, `web`, `digital`, `marketing` resolve to those slugs.  
Decorative studio stills (`/assets/kite/services/*.jpg`) are used when CMS `cover_image` is empty. These are not campaign photographs.

## Projects

| | Count |
| --- | --- |
| Seeded | 30 |
| Published (default) | 0 |
| Public `/project/{slug}` | 404 until publish |
| Publish → public 200 | PASS (`boulevard`) |
| Unpublish → public 404 | PASS |
| Studio preview of draft | PASS |

## Case studies

| | Count |
| --- | --- |
| Total | 0 |
| Published | 0 |
| Archive | 200 empty state |
| Failed | 0 |

## Clients

| | Count |
| --- | --- |
| Total | 30 |
| Published | 30 |
| Verified on homepage ticker | 30 |
| Failed | 0 |

Names only. No invented logos.

## Media

| | Count |
| --- | --- |
| Local assets checked from crawl | 22 |
| Broken | 0 |

MWG leftover campaign photos under `public/assets/images/` were removed so they cannot be served as KITE work.

## Animations

| | Count |
| --- | --- |
| Registered presets | 12 |
| Present in `kite-presets.js` | 12 |
| Failed | 0 |

Presets: `none`, `fade-up`, `fade-left`, `fade-right`, `scale-in`, `image-wipe`, `image-clip`, `image-parallax`, `text-stagger`, `text-highlight`, `horizontal-gallery`, `pin-scale`.  
Fail-open if GSAP is missing. Heavy presets skip under reduced motion. Headed desktop/tablet/mobile playback was **not** visually confirmed.

## CMS

| Action | Result |
| --- | --- |
| Create | PASS (temp draft created then deleted) |
| Edit | PASS |
| Preview | PASS |
| Publish | PASS |
| Unpublish | PASS |

Same `public-render.cjs` renderer is used for Studio preview and the public project page on Node.

## Forms

| | Result |
| --- | --- |
| Valid POST `/contact-us` | PASS (200 + thank-you, persisted to `leads.json`) |
| Invalid POST | PASS (200 + error, not silent) |
| Failed | 0 |

Footer and contact forms POST to `/contact-us`. Client JS still shows the thank-you after a successful persist.

## SEO

| Check | Result |
| --- | --- |
| Title / description / canonical / OG | PASS |
| Sitemap published-only | PASS |
| Robots disallow `/studio` | PASS |
| Failed | 0 |

## Security

| Check | Result |
| --- | --- |
| `/studio` unauthenticated → login | PASS |
| No AgencyOS / Client Login / Sign In in public chrome | PASS |
| Drafts 404 | PASS |
| Failed | 0 |

## Build

**PASS** — `npm run build` (Vite) succeeds after remote Bunny/Instrument Sans font fetch was removed. Public site does not depend on `/public/build`; it uses static `/assets`.

## Tests

| Suite | Result |
| --- | --- |
| `node scripts/qa-production.cjs` | PASS |
| `node scripts/verify-public-site.cjs` | PASS |
| `php artisan test` | BLOCKED — PHP not installed |
| `npm test` | not defined |

## Browser QA

**BLOCKED** — no headed browser / DevTools in this environment.

## Responsive QA

**BLOCKED** as a device-lab pass. CSS breakpoints at 980 / 640 exist; services fall back to stacked / native-x scroll on small screens. Not a substitute for real 320–1920 visual QA.

## MWG production references

**0** in application runtime (`app/`, `routes/`, `resources/site/`, `public/assets`, `database/`).

Removed this sprint:

- `SiteController` MWG titles and MWG `content.php` fallback
- `resources/site/content.php` (deleted)
- `public/assets/logo.svg` “mwg” mark (now KITE)
- leftover MWG campaign photos in `public/assets/images/`

Allowed documentation only: `README.md` states MWG was an early IA reference and is not a dependency.

## Unexpected errors

| Code | Count |
| --- | --- |
| 404 unexpected | 0 |
| 403 | 0 |
| 419 | 0 |
| 422 | 0 |
| 500 | 0 |
| Console errors | BLOCKED (no headed browser) |
| Broken assets | 0 |
| Broken links | 0 |

## Remaining issues

1. **PHP runtime not executed** — severity: high for Hostinger PHP deploy. Affected: all Laravel routes. Root cause: no `php` binary / no apt packages. Remediation: install PHP 8.3, `composer install`, `php artisan key:generate`, hit the same route matrix. Blocker for marking Hostinger PHP READY. Non-blocker for Node preview.
2. **Headed browser QA missing** — severity: medium. Affected: animations, overflow, console. Remediation: Chrome/Safari pass at 320–1920. Blocker for the written acceptance checkbox “no runtime JS errors”.
3. **Live domain not crawled** — severity: high for go-live. Affected: `https://www.kiteagency-eg.com`. Root cause: sandbox TLS to that host reset. Remediation: crawl production after deploy. Blocker for “production runtime verified” on the real domain.
4. **Laravel Studio builder incomplete** — severity: medium if Hostinger is PHP-only. Affected: `/studio/*` project builder. Root cause: Blade studio was never implemented; Node owns the builder. Remediation: run Node for Studio, or finish a PHP builder later. Documented, not silently different public HTML.
5. **Official email / street address** — severity: low. CONTENT_REQUIRED. Non-blocker.
6. **0 published projects / 0 case studies** — by design. Public pages show empty states. Non-blocker.
7. **House SVGs are large** (~49MB). Performance note only. Do not replace with invented photos.

## External blockers

- PHP 8.3 not installed in this sandbox (`apt` has no `php-cli` package).
- Headed browser / device lab not available.
- Outbound TLS to `kiteagency-eg.com` and previously to font CDNs resets here.
- Hostinger account, `public_html` mapping, and production `.env` are not in this repository.

## Hostinger checklist (when PHP/Node is available)

1. Document root = `public/`.
2. `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://www.kiteagency-eg.com`.
3. Set `STUDIO_PASSWORD`. Do not commit it.
4. Ensure `storage/app/website/` is writable (`cms.json`, `leads.json`).
5. If using Node hosting: `node server.cjs` (or `Procfile`).
6. If using PHP only: public pages work from `cms.json`; use Node Studio to publish, or edit JSON carefully.
7. Re-run `node scripts/qa-production.cjs` against the real origin (`VERIFY_ORIGIN=https://www.kiteagency-eg.com`).

## Acceptance checkboxes

- [x] Homepage works (Node)
- [x] Preloader / hero / services / about / cases / portfolio / clients / contact / footer (Node HTML)
- [x] All 5 official services
- [x] Published projects rule (none live; publish/unpublish verified)
- [x] Creative Project Builder on Node
- [x] Preview / publish / unpublish
- [x] Contact POST persists
- [x] Sitemap / robots / SEO
- [x] Public links and local assets
- [x] Drafts and Studio protected
- [x] No AgencyOS in public nav
- [x] No MWG production references
- [x] 0 unexpected 404 / 403 / 419 / 422 / 500 on Node crawl
- [x] Production Vite build passes
- [ ] Laravel HTTP kernel executed
- [ ] Headed browser QA
- [ ] Real-domain crawl
- [ ] Production Hostinger environment verified
