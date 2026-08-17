# MWG website clone (starter)

A close visual copy of [mwg.co.com/home/about](https://www.mwg.co.com/home/about), built so you can restyle and rebrand it.

This repo is still a Laravel app. The marketing site lives in plain HTML so you can edit it immediately.

## What’s included

- Home / About (hero, stats, latest work, about tabs, case studies, clients, lead form)
- Big Bang, Services (and sub-pages), Portfolio, Case Studies, Blog, Contact
- Project, case study, and article templates

## Edit the copy

| What | Where |
| --- | --- |
| Header / footer | `resources/site/layout.html` |
| Home, listing pages | `resources/site/pages/*.html` |
| Services, projects, posts | `resources/site/content.js` |
| Look and feel | `public/assets/css/site.css` |
| Images | `public/assets/images/` |

## Preview (no PHP required)

```bash
node server.cjs
```

Opens on port `4173`.

## Laravel

When PHP is available:

```bash
cp .env.example .env
php artisan key:generate
php artisan serve
```

Routes in `routes/web.php` wrap the same HTML through `App\Http\Controllers\SiteController`.
