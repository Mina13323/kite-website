# KITE Design Studio — public website

Public website for **KITE Design Studio** (AIM HIGH FLY HIGHER).

This is a Laravel app. The verified public + Studio runtime in this repository is `node server.cjs`, which reads the same CMS store Laravel now uses for Hostinger/PHP public pages.

MWG (`mwg.co.com`) was only an early information-architecture reference. It has no relationship with KITE and is not a runtime dependency, content source, or fallback.

## Official facts

- Company: KITE Design Studio
- Site: https://www.kiteagency-eg.com
- Phone / WhatsApp: +20 127 551 0701
- Services: Branding, Media Production, Web Development, Digital Content, Marketing Materials

Do not invent clients, metrics, campaign results, street address, or email. Empty official fields stay empty (`CONTENT_REQUIRED` in the CMS).

## Preview (verified runtime)

```bash
node server.cjs
```

Binds `0.0.0.0:4173`.

- Public site: `/`
- Studio CMS: `/studio` (not in public navigation)
- Studio email: `studio@kiteagency-eg.com`
- Studio password: `STUDIO_PASSWORD` (default in `.env.example`)

## Laravel / Hostinger

Document root is `public/` (standard Laravel `index.php` + `.htaccess`).

```bash
cp .env.example .env
# set APP_KEY, APP_URL=https://www.kiteagency-eg.com, APP_DEBUG=false, STUDIO_PASSWORD
php artisan key:generate
```

Public routes read `storage/app/website/cms.json` (seeded from `database/data/website-seed.json` if missing). They do **not** use any MWG service catalog.

Laravel `/studio` is the complete Hostinger-ready editor for projects, homepage content, services, clients, media uploads, and contact/company details. It uses file sessions by default and writes directly to the same JSON store as the public PHP site. The Node preview process also exposes its original Studio editor against that shared store.

Optional database seeders remain for a future Eloquent path:

```bash
php artisan migrate
php artisan db:seed --class=WebsiteContentSeeder
```

## Edit the site

| What | Where |
| --- | --- |
| Header / footer chrome | `resources/site/layout.html` |
| Homepage preloader + hero shell | `resources/site/pages/home.html` |
| Public HTML renderer | `resources/site/public-render.cjs` and `app/Support/Website/PublicRenderer.php` |
| CMS store | `database/data/cms-store.cjs` and `app/Support/Website/CmsStore.php` |
| Seed content | `database/data/website-seed.json` |
| Look and feel | `public/assets/css/site.css` |
| Hostinger PHP Studio | `app/Http/Controllers/Studio/ContentController.php` and `resources/views/studio/` |
| Node preview Studio | `resources/studio/` via `server.cjs` |

## Verify

```bash
npm run preview
node scripts/qa-production.cjs
```
