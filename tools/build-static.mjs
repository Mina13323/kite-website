#!/usr/bin/env node
/**
 * Builds the static MWG clone into ./static
 * Usage: node tools/build-static.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  esc, icon, head, header, footer, pageHero, breadcrumbs, touchForm,
  workCard, projectCard, portfolioBlock, clientsSection,
} from './templates.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const OUT = path.join(root, 'static');
const site = JSON.parse(fs.readFileSync(path.join(root, 'resources/data/site.json'), 'utf8'));

function write(routePath, html) {
  const rel = routePath === '/' ? 'index.html' : path.join(routePath.replace(/^\//, ''), 'index.html');
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  return rel;
}

function page(route, { title, description, body, bodyClass = '' }) {
  return write(route, head(site, { title, description, bodyClass }) + header(site) + body + footer(site));
}

/* ============================ HOME ============================ */
function buildHome(route) {
  const h = site.home;
  const half = Math.ceil(h.latestWork.length / 2);
  const body = `
<section class="hero">
  <div class="hero__media">
    <video autoplay muted loop playsinline poster="${esc(h.aboutTabs[0].image)}">
      <source src="${esc(site.brand.origin)}/assets/videos/showreel.mp4" type="video/mp4">
      Your browser does not support the video tag.
    </video>
  </div>
  <div class="container hero__inner">
    <h1 data-reveal>${esc(h.heroPrefix)} <span class="accent">${esc(h.heroBrand)}</span><br>${esc(h.heroSuffix)}</h1>
    <p class="hero__intro" data-reveal>${esc(h.intro)}</p>
    <div class="pillars" data-reveal>
      ${h.pillars.map((p) => `<div class="pillar"><h6>${esc(p.title)}</h6><p>${esc(p.text)}</p></div>`).join('')}
    </div>
  </div>
  <div class="hero__scroll"><span>Scroll</span><i></i></div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head" data-reveal>
      <span class="section-kicker">Selected campaigns</span>
      <h2 class="section-title">Our Latest Work</h2>
    </div>
  </div>
  <div class="marquee"><div class="marquee__track">${h.latestWork.slice(0, half).map(workCard).join('')}</div></div>
  <div class="marquee marquee--reverse" style="margin-top:22px"><div class="marquee__track">${h.latestWork.slice(half).concat(h.latestWork.slice(0, 2)).map(workCard).join('')}</div></div>
  <div class="container" style="margin-top:56px;text-align:center" data-reveal>
    <a class="btn" href="/portfolio"><span>Our Portfolio</span></a>
  </div>
</section>

<section class="section" id="about">
  <div class="container">
    <div class="section-head" data-reveal>
      <span class="section-kicker">Who we are</span>
      <h2 class="section-title">About Us</h2>
    </div>
    <div class="about-grid" data-tabs>
      <div data-reveal>
        <div class="tabs">
          <div class="tabs__list">
            ${h.aboutTabs.map((t, i) => `<button class="tabs__btn${i === 0 ? ' is-active' : ''}" type="button">${esc(t.label)}</button>`).join('')}
          </div>
        </div>
        ${h.aboutTabs
          .map(
            (t, i) => `
        <div class="tab-panel${i === 0 ? ' is-active' : ''}">
          <h2 style="font-size:clamp(28px,3.4vw,46px)">${esc(t.heading)}</h2>
          <p style="color:rgba(255,255,255,.72)">${esc(t.body)}</p>
          <div class="about-points">
            ${t.points.map((p) => `<div class="about-point"><h5>${esc(p.title)}</h5><p>${esc(p.text)}</p></div>`).join('')}
          </div>
        </div>`
          )
          .join('')}
      </div>
      <div class="about-visual" data-reveal>
        <img src="${esc(h.aboutTabs[0].image)}" alt="A Revolutionary Spirit" loading="lazy">
      </div>
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    <div class="section-head" data-reveal>
      <span class="section-kicker">In depth</span>
      <h2 class="section-title">Case Studies</h2>
    </div>
    <div class="case-grid">
      ${site.caseStudies
        .map(
          (c) => `
      <a class="case-card" href="/case-study/${esc(c.slug)}" data-reveal>
        <img src="${esc(c.image)}" alt="${esc(c.title)}" loading="lazy">
        <span class="case-card__body">
          <span class="case-card__cat">${esc(c.category)}</span>
          <span class="case-card__title">${esc(c.title)}</span>
        </span>
      </a>`
        )
        .join('')}
    </div>
    <div style="margin-top:44px" data-reveal><a class="link-more" href="/case-studies">View All Case Studies ${icon('arrow')}</a></div>
  </div>
</section>

${clientsSection(site)}`;

  page(route, { title: site.home.title, description: site.home.description, body });
}

/* ============================ SERVICES ============================ */
function buildServices() {
  const body = `
${pageHero('Our Services', { intro: 'A 360 agency built around production, design, digital, BTL and technology.', trail: [{ label: 'Home', href: '/home' }, { label: 'Services' }] })}
<section class="section">
  <div class="container">
    <div class="services-grid">
      ${site.services
        .map(
          (s, i) => `
      <a class="service-tile" href="/services/${esc(s.slug)}" data-reveal>
        <span class="service-tile__num">${String(i + 1).padStart(2, '0')}</span>
        <span>
          <h3>${esc(s.title)}</h3>
          <span class="service-tile__more">See More ${icon('arrow')}</span>
        </span>
      </a>`
        )
        .join('')}
    </div>
  </div>
</section>`;
  page('/services', {
    title: '360 Advertising Agency | Best Advertising Agencies in Egypt',
    description: 'Explore MWG services: digital marketing, graphic design, web & mobile apps, BTL, content creation, social media, SEO, media buying and media production.',
    body,
  });

  site.services.forEach((s) => {
    const slides = Array.from({ length: s.slides }, (_, i) => String(i + 1).padStart(2, '0'));
    const sbody = `
<section class="page-hero" style="padding-bottom:0">
  <div class="container">
    ${breadcrumbs([{ label: 'Home', href: '/home' }, { label: 'Services', href: '/services' }, { label: s.title }])}
  </div>
</section>
<section class="section section--tight" data-slider>
  <div class="container">
    <div class="svc-hero">
      <div data-reveal>
        <div class="slider-dots">${slides.map((n, i) => `<button type="button"${i === 0 ? ' class="is-active"' : ''}>${n}</button>`).join('')}</div>
        <h1 style="font-size:clamp(38px,6vw,80px)">${esc(s.title)}</h1>
        <div class="svc-blocks">
          ${s.blocks.map((b) => `<div class="svc-block"><h2>${esc(b.heading)}</h2><p>${esc(b.body)}</p></div>`).join('')}
        </div>
        <div class="slider-nav">
          <button type="button" data-slide-prev aria-label="prev" style="transform:rotate(180deg)">${icon('arrow')}</button>
          <button type="button" data-slide-next aria-label="next">${icon('arrow')}</button>
        </div>
      </div>
      <div class="svc-hero__media" data-reveal>
        <img src="${esc(s.hero)}" alt="${esc(s.title)}" loading="lazy">
      </div>
    </div>
  </div>
</section>
<section class="section section--tight">
  <div class="container">${portfolioBlock(site)}</div>
</section>`;
    page(`/services/${s.slug}`, {
      title: s.metaTitle,
      description: s.blocks[0].body.slice(0, 175),
      body: sbody,
    });
  });
}

/* ============================ PORTFOLIO ============================ */
function buildPortfolio() {
  const body = `
${pageHero('Portfolio', { intro: 'Campaigns, films, activations and platforms delivered for brands across Egypt, the GCC and beyond.', trail: [{ label: 'Home', href: '/home' }, { label: 'Portfolio' }] })}
<section class="section">
  <div class="container">${portfolioBlock(site)}</div>
</section>`;
  page('/portfolio', {
    title: 'mwg advertising agency',
    description: 'Selected work by MWG Advertising Agency across production, digital, graphics, BTL, 3D design and web & mobile apps.',
    body,
  });

  site.projects.forEach((p) => {
    const related = site.projects.filter((x) => x.slug !== p.slug).slice(0, 3);
    const gallery = Array.from({ length: 8 }, () => p.image);
    const body = `
<section class="page-hero">
  <div class="container">
    ${breadcrumbs([{ label: 'Home', href: '/home' }, { label: 'Portfolio', href: '/portfolio' }, { label: p.title }])}
    <div class="project-detail__share">
      <span>Share</span>
      ${site.social.slice(0, 3).map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.name)}">${icon(s.name)}</a>`).join('')}
    </div>
    <h1 data-reveal>${esc(p.title)}</h1>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    <div class="media-frame" data-reveal>
      <img src="${esc(p.image)}" alt="${esc(p.title)}">
      <span class="media-frame__play"><span>${icon('play')}</span></span>
    </div>
    <div style="max-width:860px;margin:56px auto 0" data-reveal>
      <h3 style="font-size:15px;letter-spacing:.22em;text-transform:uppercase;color:var(--accent-2)">About The Project</h3>
      <p style="font-size:17px;color:rgba(255,255,255,.76)">${esc(p.body)}</p>
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    <h2 class="section-title" style="font-size:32px;margin-bottom:28px" data-reveal>Other Videos</h2>
    <div class="gallery-grid" data-reveal>
      ${gallery.slice(0, 4).map(() => `<div class="media-frame" style="aspect-ratio:16/9"><img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy"><span class="media-frame__play"><span>${icon('play')}</span></span></div>`).join('')}
    </div>

    <h2 class="section-title" style="font-size:32px;margin:64px 0 28px" data-reveal>Making Of</h2>
    <div class="media-frame" data-reveal><img src="${esc(p.image)}" alt="Making of ${esc(p.title)}" loading="lazy"><span class="media-frame__play"><span>${icon('play')}</span></span></div>

    <h2 class="section-title" style="font-size:32px;margin:64px 0 28px" data-reveal>Photoshoots</h2>
    <div class="gallery-grid" data-reveal>
      ${gallery.map(() => `<img src="${esc(p.image)}" alt="Photoshoot" loading="lazy">`).join('')}
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    <h2 class="section-title" style="font-size:32px;margin-bottom:28px" data-reveal>More Projects</h2>
    <div class="project-grid">${related.map((r) => projectCard(r)).join('')}</div>
  </div>
</section>`;
    page(`/project/${p.slug}`, {
      title: p.metaTitle || `${p.title} | MWG Advertising Agency`,
      description: p.excerpt || p.body.slice(0, 175),
      body,
    });
  });
}

/* ============================ CASE STUDIES ============================ */
function buildCaseStudies() {
  const feature = site.caseStudies[0];
  const body = `
<section class="page-hero" style="padding-bottom:34px">
  <div class="container">
    ${breadcrumbs([{ label: 'Home', href: '/home' }, { label: 'Case Studies' }])}
    <div class="filters" style="margin-bottom:0">
      ${site.portfolioFilters.map((f, i) => `<button class="filter-btn${i === 0 ? ' is-active' : ''}" type="button">${esc(f)}</button>`).join('')}
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    <div class="cs-feature" data-reveal>
      <img src="${esc(feature.image)}" alt="${esc(feature.title)}">
      <div class="cs-feature__body">
        <span class="case-card__cat">${esc(feature.category)}</span>
        <h2>${esc(feature.title)}</h2>
        <a class="btn" href="/case-study/${esc(feature.slug)}"><span>Explore Case Study</span></a>
      </div>
    </div>

    <div class="case-grid" style="margin-top:40px">
      ${site.caseStudies
        .map(
          (c) => `
      <a class="case-card" href="/case-study/${esc(c.slug)}" data-reveal>
        <img src="${esc(c.image)}" alt="${esc(c.title)}" loading="lazy">
        <span class="case-card__body">
          <span class="case-card__cat">${esc(c.category)}</span>
          <span class="case-card__title">${esc(c.title)}</span>
        </span>
      </a>`
        )
        .join('')}
    </div>
  </div>
</section>`;
  page('/case-studies', {
    title: 'mwg advertising agency',
    description: 'Case studies from MWG Advertising Agency — strategy, production and results.',
    body,
  });

  site.caseStudies.forEach((c) => {
    const body = `
<section class="page-hero">
  <div class="container">
    ${breadcrumbs([{ label: 'Home', href: '/home' }, { label: 'Case Studies', href: '/case-studies' }, { label: c.title }])}
    <div class="project-detail__share">
      <span>Share</span>
      ${site.social.slice(0, 3).map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.name)}">${icon(s.name)}</a>`).join('')}
    </div>
    <h1 data-reveal>${esc(c.title)}</h1>
  </div>
</section>
<section class="section section--tight">
  <div class="container">
    <div class="media-frame" data-reveal><img src="${esc(c.image)}" alt="${esc(c.title)}"></div>
    <div style="max-width:860px;margin:56px auto 0" data-reveal>
      <span class="section-kicker">${esc(c.category)}</span>
      <p style="font-size:17px;color:rgba(255,255,255,.76)">${esc(c.body)}</p>
    </div>
  </div>
</section>`;
    page(`/case-study/${c.slug}`, { title: 'mwg advertising agency', description: c.body.slice(0, 175), body });
  });
}

/* ============================ BIG BANG ============================ */
function buildBigBang() {
  const bb = site.bigBang;
  const body = `
${pageHero(bb.heading, { intro: 'Breakthrough campaigns from a top advertising agency in Egypt.', trail: [{ label: 'Home', href: '/home' }, { label: 'Big Bang' }] })}
<section class="section section--tight">
  <div class="container">
    ${bb.items
      .map(
        (item) => `
    <article class="bb-item" data-reveal>
      <div class="bb-item__media"><img src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy"></div>
      <div>
        <h2>${esc(item.title)}</h2>
        <p>${esc(item.body)}</p>
        <a class="link-more" href="/project/${esc(item.slug)}">See More ${icon('arrow')}</a>
      </div>
    </article>`
      )
      .join('')}
  </div>
</section>`;
  page('/big-bang', {
    title: bb.title,
    description: 'Breakthrough campaigns by MWG — a top advertising agency in Egypt.',
    body,
  });
}

/* ============================ BLOG ============================ */
const ARTICLE_BODY = (post) => `
<p>${esc(post.excerpt || 'Insights from the MWG strategy, creative and media teams.')}</p>
<p>At MWG Advertising Agency we work at the intersection of strategy, storytelling and performance. This article breaks down what we're seeing across campaigns in Egypt, the GCC and the wider Middle East — and what it means for brands planning their next move.</p>
<h2>Why it matters now</h2>
<p>Audiences are fragmented across more platforms, formats and moments than ever before. The brands that win are the ones that combine a clear strategic position with craft, then measure relentlessly. That principle underpins every campaign we ship, whether it's a national TVC, an on-ground activation or an always-on performance programme.</p>
<ul>
  <li>Start with a business problem, not a channel.</li>
  <li>Build one idea strong enough to travel across every touchpoint.</li>
  <li>Produce with craft — attention is earned, not bought.</li>
  <li>Instrument everything so you can learn between flights.</li>
</ul>
<h2>How MWG approaches it</h2>
<p>As a 360 advertising agency, we bring strategy, creative, media production, BTL and technology under one roof. That means fewer handoffs, faster turnarounds and work that holds together from the first frame to the final report.</p>
<h3>The takeaway</h3>
<p>Clarity beats volume. Define the outcome, build the idea, produce it properly, then optimise with real data. If you'd like to talk through how this applies to your brand, <a href="/contact-us">get in touch</a> — we'd love to hear what you're working on.</p>`;

function buildBlog() {
  const posts = site.blog.posts;
  const first = posts.slice(0, 12);
  const rest = posts.slice(12);
  const card = (p, cls = '') => `
  <a class="post-card ${cls}" href="/post/${esc(p.slug)}">
    <span class="post-card__meta">BY MWG <span class="dot"></span> ${esc(p.date)}</span>
    <h3>${esc(p.title)}</h3>
    <p>${esc(p.excerpt || '')}</p>
    <span class="post-card__cta">Read Article ${icon('arrow')}</span>
  </a>`;

  const body = `
${pageHero(site.blog.heading, { intro: site.blog.subheading, trail: [{ label: 'Home', href: '/home' }, { label: 'Blog' }] })}
<section class="section">
  <div class="container">
    <div class="blog-grid" id="blog-grid">
      ${first.map((p) => card(p)).join('')}
      ${rest.map((p) => card(p, 'js-more')).join('')}
    </div>
    ${rest.length ? `<div class="load-more"><button class="btn" type="button" data-load-more="blog-grid"><span>Load More Articles</span></button></div>` : ''}
  </div>
</section>
<style>#blog-grid .js-more{display:none}</style>`;
  page('/blog', {
    title: 'mwg advertising agency',
    description: 'THE BIG BANG LOG — insights, strategies and digital victories from MWG Advertising Agency.',
    body,
  });

  posts.forEach((p, i) => {
    const related = posts.filter((_, n) => n !== i).slice(0, 3);
    const body = `
<section class="page-hero">
  <div class="container">
    ${breadcrumbs([{ label: 'Home', href: '/home' }, { label: 'Blog', href: '/blog' }, { label: p.title.slice(0, 42) + (p.title.length > 42 ? '…' : '') }])}
    <div class="project-detail__share">
      <span>Share</span>
      ${site.social.slice(0, 3).map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.name)}">${icon(s.name)}</a>`).join('')}
    </div>
    <h1 style="font-size:clamp(30px,4.4vw,58px)" data-reveal>${esc(p.title)}</h1>
    <p style="margin-top:14px;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--grey)">BY MWG &nbsp;·&nbsp; ${esc(p.date)}</p>
  </div>
</section>
<section class="section section--tight">
  <div class="container">
    <article class="article" data-reveal>
      ${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">` : ''}
      ${ARTICLE_BODY(p)}
    </article>
  </div>
</section>
<section class="section section--tight">
  <div class="container">
    <h2 class="section-title" style="font-size:30px;margin-bottom:28px" data-reveal>Related Articles</h2>
    <div class="blog-grid">
      ${related
        .map(
          (r) => `
      <a class="post-card" href="/post/${esc(r.slug)}">
        <span class="post-card__meta">BY MWG <span class="dot"></span> ${esc(r.date)}</span>
        <h3>${esc(r.title)}</h3>
        <p>${esc(r.excerpt || '')}</p>
        <span class="post-card__cta">Read Article ${icon('arrow')}</span>
      </a>`
        )
        .join('')}
    </div>
  </div>
</section>`;
    page(`/post/${p.slug}`, { title: `${p.title} | MWG`, description: p.excerpt || p.title, body });
  });
}

/* ============================ CONTACT ============================ */
function buildContact() {
  const c = site.contact;
  const body = `
<section style="padding-top:var(--header-h)">
  <iframe class="map-embed" title="MWG offices" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
    src="https://www.google.com/maps?q=Nasr+City+Cairo+Egypt&output=embed"></iframe>
</section>
<section class="section section--tight">
  <div class="container">
    <div class="section-head" data-reveal>
      <span class="section-kicker">${esc(c.explore)}</span>
      <h2 class="section-title">Our Offices</h2>
    </div>
    <div class="offices" style="margin-top:0">
      ${site.offices
        .map(
          (o) => `
      <div class="office" data-reveal>
        <h4>${esc(o.country)}</h4>
        <p>${esc(o.address)}</p>
        ${o.lines.map((l) => `<p>${esc(l)}</p>`).join('')}
      </div>`
        )
        .join('')}
    </div>
  </div>
</section>
<section class="section section--tight">
  <div class="container">
    <div class="contact-split">
      <div class="contact-split__media" data-reveal>
        <img src="${esc(c.image)}" alt="MWG Contact" loading="lazy">
      </div>
      <div data-reveal>
        <h1 style="font-size:clamp(36px,5vw,68px)">${esc(c.heading)}</h1>
        <p style="color:rgba(255,255,255,.7);margin-bottom:34px">${esc(c.subheading)}</p>
        ${touchForm(site, 'contact')}
      </div>
    </div>
  </div>
</section>`;
  page('/contact-us', {
    title: c.title,
    description: "Hire MWG Advertising Agency — offices in Cairo, Dubai and Los Angeles. Let's talk.",
    body,
  });
}

/* ============================ 404 + extras ============================ */
function buildExtras() {
  const body = `
<section class="page-hero" style="min-height:70vh;display:flex;align-items:center">
  <div class="container">
    <h1 data-reveal>404</h1>
    <p data-reveal>The page you're looking for has moved or never existed.</p>
    <p style="margin-top:26px" data-reveal><a class="btn" href="/home"><span>Back Home</span></a></p>
  </div>
</section>`;
  const html = head(site, { title: 'Page not found | MWG' }) + header(site) + body + footer(site);
  fs.writeFileSync(path.join(OUT, '404.html'), html);

  // sitemap + robots
  const urls = [];
  (function walk(dir, base = '') {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
      if (e.isDirectory()) walk(path.join(dir, e.name), base + '/' + e.name);
      else if (e.name === 'index.html') urls.push(base === '' ? '/' : base + '/');
    });
  })(OUT);
  fs.writeFileSync(
    path.join(OUT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .sort()
      .map((u) => `  <url><loc>${u}</loc></url>`)
      .join('\n')}\n</urlset>\n`
  );
  fs.writeFileSync(path.join(OUT, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n');
  return urls.length;
}

/* ============================ RUN ============================ */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.cpSync(path.join(root, 'public/assets'), path.join(OUT, 'assets'), { recursive: true });

buildHome('/');
buildHome('/home');
buildHome('/home/about');
buildServices();
buildPortfolio();
buildCaseStudies();
buildBigBang();
buildBlog();
buildContact();
const total = buildExtras();

console.log(`Built ${total} pages into ${path.relative(root, OUT)}/`);
