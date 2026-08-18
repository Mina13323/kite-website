# Final website closure report

Verified 18 August 2026 against the live Node preview (`0.0.0.0:4173`).

## ROUTES

| | Count |
| --- | --- |
| Public routes crawled / requested | 15 unique HTML/XML/text destinations + 5 service details + aliases |
| Working (2xx/3xx as designed) | All requested public routes |
| Unexpected 4xx/5xx | **0** |
| Intended 404 | Draft `/project/{slug}` |

Automated crawler (`scripts/verify-public-site.cjs`): **15/15 pages OK**, **0 unexpected**, **0 broken assets**.

## PAGES

Homepage (preloader → hero → latest → about → services → cases → portfolio → clients → CTA → footer), Services, five service details, Portfolio, Case Studies, Contact, 404: **working**.

## LINKS

Header, mobile nav, footer services, socials, CTAs, service aliases: resolved.  
Client names without a URL are **not** linked (`#` removed).  
Studio is not in public nav.

## PROJECTS

| | Count |
| --- | --- |
| Seeded | 30 |
| Published | 0 (correct default) |
| Public `/project/{slug}` | 404 until publish |
| Publish → public 200 | Verified (Boulevard) |
| Unpublish → public 404 | Verified |
| Studio preview of draft | 200 with session |

## SERVICES

5 official published services. All official slugs **200**. Short aliases **200**.

## CASE STUDIES

0 published. Archive **200** with empty state. No orphan links.

## CLIENTS

30 official names published (no invented logos). Ticker **200**. External URL only when set.

## MEDIA

Homepage loads 17 `<img>` (preloader houses/clouds/logo). Error handler hides missing files. Crawler: **0 broken local assets**.

## JAVASCRIPT

No runtime exceptions on public pages in the Node crawl. Forms use `data-lead` plus POST `/contact-us` (200). Animations fail open if GSAP is absent.

## BUILD

`npm run build` (Vite / Laravel plugin) **FAIL in this sandbox** — TLS to Google Fonts / Laravel font CDN resets (`Client network socket disconnected before secure TLS connection`). The public site does **not** depend on Vite; it is served by `node server.cjs` + static `/assets`.

## TESTS

`php artisan test` **cannot run**: PHP is not installed in this environment.

## RESPONSIVE

CSS breakpoints at 980 / 800 / 640 exist. Horizontal services fall back on small screens. Full device lab not available in this sandbox (no headed browser). Structural CSS reviewed; no overflow-x on body.

## SEO

Title + description + canonical + OG on layout. `/robots.txt` disallows `/studio`. `/sitemap.xml` lists only public shells + published services (no drafts).

## SECURITY

Drafts 404. Studio redirects when unauthenticated. No AgencyOS links in public chrome.

## EXTERNAL BLOCKERS

1. **PHP missing** — cannot run `php artisan test` or Laravel HTTP kernel.  
2. **Sandbox TLS** — `npm run build` cannot fetch remote fonts.  
3. **No headed browser** — console/network QA is via HTTP crawl, not Chrome DevTools.

## Remaining issues

None on the Node public runtime that block publishing. Production Laravel still needs `composer install`, migrate, and `STUDIO_PASSWORD` when PHP is available.
