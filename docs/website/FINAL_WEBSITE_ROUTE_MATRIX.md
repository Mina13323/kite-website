# Final website route matrix

Verified 18 August 2026 against `node server.cjs` on `0.0.0.0:4173`.

Laravel `routes/web.php` now mirrors the same public contract and reads the same `cms.json` store. PHP was not installed in this environment, so Laravel HTTP was not executed here.

| Page | Route | Class | Source | Status |
| --- | --- | --- | --- | --- |
| Home | `/`, `/home`, `/home/about` | PUBLIC | CMS + `home.html` preloader | 200 |
| About | `/about` | REDIRECT | — | 302 → `/home#about` |
| About hash | `/home#about` | PUBLIC | Homepage about | 200 |
| Services archive | `/services` | PUBLIC | CMS services | 200 |
| Service detail | `/services/{slug}` | PUBLIC | CMS published only | 200 official slugs |
| Service aliases | `/services/media`, `/web`, `/digital`, `/marketing`, `/graphic-design`, `/btl` | PUBLIC | Alias → official KITE slug | 200 |
| Unknown service | `/services/{other}` | INTENTIONALLY 404 | — | 404 |
| Portfolio | `/portfolio` | PUBLIC | Published projects | 200 |
| Projects alias | `/projects` | REDIRECT | Spec alias | 302 → `/portfolio` |
| Project detail | `/project/{slug}` | PUBLIC | Published only | 200 published / 404 draft |
| Draft / archived project | `/project/{unpublished}` | INTENTIONALLY 404 | CMS guard | 404 |
| Case studies archive | `/case-studies` | PUBLIC | Published cases | 200 (empty state OK) |
| Case study detail | `/case-study/{slug}`, `/case-studies/{slug}` | PUBLIC | Published only | 200 / 404 |
| Contact GET | `/contact-us` | PUBLIC | CMS settings + form | 200 |
| Contact POST | `/contact-us` | PUBLIC | `leads.json` | 200 valid / 200 invalid with error |
| Sitemap | `/sitemap.xml` | PUBLIC | Published URLs only | 200 |
| Robots | `/robots.txt` | PUBLIC | Disallow `/studio` | 200 |
| Favicon | `/favicon.ico` | PUBLIC | KITE logo icon | 200 |
| Big Bang legacy | `/big-bang` | REDIRECT | — | 302 → `/portfolio` |
| Blog legacy | `/blog`, `/post/{slug}` | REDIRECT | — | 302 → `/home` |
| Studio login | `/studio/login` | AUTHENTICATED | Studio CMS | 200 form / 302 after auth |
| Studio | `/studio`, `/studio/*` | AUTHENTICATED / INTERNAL | Not in public nav | 302 public → login |
| Studio preview | `/studio/preview/project/{slug}` | AUTHENTICATED | Same public renderer | 200 with session |

## Intentionally not public

- All `/studio/*` management URLs.
- Draft / archived projects, case studies, clients.
- AgencyOS (`our-kites.kiteagency-eg.com`) — not linked.

## Runtime

| Host | Public renderer | Studio |
| --- | --- | --- |
| Arena / Node | `server.cjs` + `public-render.cjs` | Full CMS + project builder |
| Hostinger PHP | `SiteController` + `App\Support\Website\PublicRenderer` reading the same `cms.json` | Login + dashboard gateway; full builder is Node |
