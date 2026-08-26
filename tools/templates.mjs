/* Shared HTML fragments for the MWG clone static build. */

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const ICONS = {
  behance: '<svg viewBox="0 0 24 24"><path d="M9.1 10.5c.6-.3 1-1 1-1.8 0-1.7-1.3-2.4-2.9-2.4H2v11.4h5.4c1.8 0 3.5-.9 3.5-2.9 0-1.3-.6-2.2-1.8-2.5v-1.8Zm-4.6-2.2h2.3c.9 0 1.6.3 1.6 1.2 0 .9-.6 1.2-1.5 1.2H4.5V8.3Zm2.5 7.2H4.5v-2.9h2.6c1 0 1.8.4 1.8 1.5s-.9 1.4-1.9 1.4ZM14.3 7.3h5.6v1.4h-5.6V7.3Zm7.7 6.7c0-2.6-1.5-4.7-4.2-4.7-2.6 0-4.4 2-4.4 4.6 0 2.7 1.7 4.6 4.4 4.6 2.1 0 3.5-1 4.1-2.9h-2.1c-.2.7-1 1.1-1.9 1.1-1.3 0-2-.8-2.1-2.1H22c0-.2.1-.4.1-.6Zm-6.2-1c.1-1.1.8-1.9 2-1.9s1.9.8 1.9 1.9h-3.9Z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 3.2A6.6 6.6 0 1 0 18.6 12 6.6 6.6 0 0 0 12 5.4Zm0 10.9A4.3 4.3 0 1 1 16.3 12 4.3 4.3 0 0 1 12 16.3Zm6.9-11.1a1.5 1.5 0 1 1-1.5-1.6 1.6 1.6 0 0 1 1.5 1.6Z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24"><path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.3-1.5 1.6-1.5h1.7V4.6a23 23 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V14h2.8v8Z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24"><path d="M22.5 7.2a2.7 2.7 0 0 0-1.9-1.9C18.9 4.8 12 4.8 12 4.8s-6.9 0-8.6.5A2.7 2.7 0 0 0 1.5 7.2 28.4 28.4 0 0 0 1 12a28.4 28.4 0 0 0 .5 4.8 2.7 2.7 0 0 0 1.9 1.9c1.7.5 8.6.5 8.6.5s6.9 0 8.6-.5a2.7 2.7 0 0 0 1.9-1.9A28.4 28.4 0 0 0 23 12a28.4 28.4 0 0 0-.5-4.8ZM9.8 15.3V8.7l5.7 3.3Z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24"><path d="M13.2 5.4 11.8 6.8l4.2 4.2H4v2h12l-4.2 4.2 1.4 1.4 6.6-6.6Z"/></svg>',
  up: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="m12 6.8 6.6 6.6-1.4 1.4-4.2-4.2V19h-2v-8.4l-4.2 4.2-1.4-1.4Z"/></svg>',
  play: '<svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M8 5v14l11-7Z"/></svg>',
  link: '<svg viewBox="0 0 24 24"><path d="M10.6 13.4a1 1 0 0 1 0-1.4l1.4-1.4a3 3 0 1 1 4.2 4.2l-1.1 1.1-1.4-1.4 1.1-1.1a1 1 0 1 0-1.4-1.4L12 13.4a1 1 0 0 1-1.4 0Zm-1.2 5.1a3 3 0 0 1-4.2-4.2l1.1-1.1 1.4 1.4-1.1 1.1a1 1 0 1 0 1.4 1.4l1.4-1.4a1 1 0 0 1 1.4 1.4Z"/></svg>',
};

export const icon = (name) => ICONS[name] || '';

/* ---------- head / header / footer ---------- */

export function head(site, { title, description = '', bodyClass = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:image" content="${esc(site.brand.logo)}">
<link rel="icon" href="${esc(site.brand.logo)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="/assets/css/site.css">
</head>
<body class="${bodyClass}">
<div class="preloader"><div class="preloader__mark">mwg</div></div>`;
}

function navList(items, depth = 0) {
  return `<ul>${items
    .map((item) => {
      const kids = item.children
        ? `<ul class="submenu">${navList(item.children, depth + 1).replace(/^<ul>|<\/ul>$/g, '')}</ul>`
        : '';
      const cls = item.children ? ' class="has-children"' : '';
      return `<li${cls}><a href="${esc(item.href)}">${esc(item.label)}</a>${kids}</li>`;
    })
    .join('')}</ul>`;
}

function mobileList(items) {
  return `<ul>${items
    .map(
      (item) =>
        `<li><a href="${esc(item.href)}">${esc(item.label)}</a>${
          item.children ? mobileList(item.children) : ''
        }</li>`
    )
    .join('')}</ul>`;
}

export function header(site) {
  return `
<header class="site-header">
  <div class="header-inner">
    <a class="brand" href="/home" aria-label="${esc(site.brand.fullName)}">
      <img src="${esc(site.brand.logo)}" alt="MWG Logo" onerror="this.outerHTML='<span class=&quot;brand__fallback&quot;>MWG</span>'">
    </a>
    <nav class="main-nav" aria-label="Main">${navList(site.nav)}</nav>
    <div class="header-social">
      ${site.social
        .map(
          (s) =>
            `<a href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.name)}">${icon(s.name)}</a>`
        )
        .join('')}
      <button class="burger" type="button" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>
<div class="mobile-nav">${mobileList(site.nav)}</div>`;
}

/* ---------- shared blocks ---------- */

export function multiselect(site, id) {
  return `
<div class="multiselect">
  <button type="button" class="multiselect__toggle"><span class="multiselect__label">Select Services</span></button>
  <div class="multiselect__panel">
    <label class="check check--all"><input type="checkbox"> Select All</label>
    ${site.serviceOptions
      .map(
        (o, i) =>
          `<label class="check"><input type="checkbox" name="${id}-services" value="${esc(o)}"> ${esc(o)}</label>`
      )
      .join('')}
  </div>
</div>`;
}

export function touchForm(site, id = 'touch') {
  return `
<form class="lead-form" data-mock-form>
  <div class="form-grid">
    <div class="field"><label for="${id}-name">Name <span class="req">*</span></label><input id="${id}-name" name="name" type="text" required placeholder="Your name"></div>
    <div class="field"><label for="${id}-email">Email <span class="req">*</span></label><input id="${id}-email" name="email" type="email" required placeholder="you@company.com"></div>
    <div class="field"><label for="${id}-business">Type of business <span class="req">*</span></label><input id="${id}-business" name="business" type="text" required placeholder="Industry"></div>
    <div class="field"><label for="${id}-mobile">Mobile no. <span class="req">*</span></label><input id="${id}-mobile" name="mobile" type="tel" required placeholder="+20"></div>
    <div class="field field--full"><label>Services <span class="req">*</span></label>${multiselect(site, id)}</div>
    <div class="field field--full">
      <div class="captcha">
        <span class="captcha__box"><input type="checkbox" aria-label="I'm not a robot"><i></i></span>
        <span class="captcha__label">I'm not a robot</span>
        <span class="captcha__brand">reCAPTCHA<br>Privacy - Terms</span>
      </div>
    </div>
    <div class="field field--full"><button class="btn btn--solid" type="submit"><span>Submit</span></button></div>
  </div>
  <div class="form-success">Thanks — your message has been received. Our team will get back to you shortly.</div>
</form>`;
}

export function touchBand(site) {
  return `
<section class="touch">
  <div class="container touch__inner">
    <div data-reveal>
      <div class="touch__brand-mark">mwg</div>
      <ul class="touch__disciplines">
        ${site.disciplines.map((d) => `<li>${esc(d)}</li>`).join('')}
      </ul>
      <div class="touch__sig">MWG ADVERTISING</div>
    </div>
    <div data-reveal>
      <h2>Get in touch</h2>
      ${touchForm(site, 'band')}
    </div>
  </div>
</section>`;
}

export function footer(site) {
  return `
${touchBand(site)}
<footer class="site-footer">
  <div class="container footer-inner">
    <div>© ${new Date().getFullYear()} ${esc(site.brand.fullName)}. All rights reserved.</div>
    <nav class="footer-links">
      ${site.nav
        .filter((n) => !n.children)
        .map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`)
        .join('')}
    </nav>
    <div class="footer-links">
      ${site.social.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join('')}
    </div>
  </div>
</footer>
<button class="to-top" type="button" aria-label="Back to top">${icon('up')}</button>
<script src="/assets/js/site.js" defer></script>
</body>
</html>`;
}

export function breadcrumbs(trail) {
  return `<div class="breadcrumbs">${trail
    .map((t, i) =>
      (i ? '<span class="sep">/</span>' : '') +
      (t.href ? `<a href="${esc(t.href)}">${esc(t.label)}</a>` : `<span>${esc(t.label)}</span>`)
    )
    .join('')}</div>`;
}

export function pageHero(title, { intro = '', trail = null } = {}) {
  return `
<section class="page-hero">
  <div class="container">
    ${trail ? breadcrumbs(trail) : ''}
    <h1 data-reveal>${esc(title)}</h1>
    ${intro ? `<p data-reveal>${esc(intro)}</p>` : ''}
  </div>
</section>`;
}

export function workCard(item) {
  return `
<a class="work-card" href="/project/${esc(item.slug)}">
  <img class="work-card__bg" src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy">
  <span class="work-card__veil"></span>
  <span class="work-card__body">
    <span class="work-card__title">${esc(item.title)}</span>
    ${item.logo ? `<img class="work-card__logo" src="${esc(item.logo)}" alt="" loading="lazy">` : ''}
  </span>
</a>`;
}

export function projectCard(p, extraClass = '') {
  return `
<a class="project-card ${extraClass}" href="/project/${esc(p.slug)}" data-cat="${esc(p.category)}">
  <img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">
  <span class="project-card__body">
    <span class="project-card__cat">${esc(p.category)}</span>
    <span class="project-card__title">${esc(p.title)}</span>
    <span class="project-card__excerpt">${esc(p.excerpt || '')}</span>
  </span>
</a>`;
}

export function portfolioBlock(site, { limit = 9 } = {}) {
  const shown = site.projects.slice(0, limit);
  const rest = site.projects.slice(limit);
  return `
<div data-filterable>
  <div class="filters">
    ${site.portfolioFilters
      .map(
        (f, i) =>
          `<button class="filter-btn${i === 0 ? ' is-active' : ''}" type="button" data-filter="${esc(f)}">${esc(f)}</button>`
      )
      .join('')}
  </div>
  <div class="project-grid" id="project-grid">
    ${shown.map((p) => projectCard(p)).join('')}
    ${rest.map((p) => projectCard(p, 'js-more')).join('')}
  </div>
  ${rest.length ? `<div class="load-more"><button class="btn" type="button" data-load-more="project-grid"><span>Load More Projects</span></button></div>` : ''}
</div>
<style>#project-grid .js-more{display:none}</style>`;
}

export function clientsSection(site) {
  const rows = [0, 1, 2].map((r) => site.clientLogos.filter((_, i) => i % 3 === r));
  return `
<section class="section section--tight">
  <div class="container">
    <div class="section-head" data-reveal>
      <span class="section-kicker">Trusted by</span>
      <h2 class="section-title">Our Clients</h2>
    </div>
  </div>
  ${rows
    .map(
      (row) => `
  <div class="client-row">
    <div class="client-track">
      ${row.map((l) => `<div class="client-cell"><img src="${esc(l)}" alt="Client Logo" loading="lazy"></div>`).join('')}
    </div>
  </div>`
    )
    .join('')}
</section>`;
}
