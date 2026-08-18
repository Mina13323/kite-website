const { esc } = require('../studio/render.cjs');

function tile(p, label) {
  const href = `/project/${esc(p.slug)}`;
  const img = p.cover_image || p.hero_image;
  return `<a class="project-tile ${img ? '' : 'has-empty'}" data-cat="${esc((p.services || [])[0] || 'other')}" href="${href}">
    ${img ? `<img src="${esc(img)}" alt="">` : '<div class="empty-visual"></div>'}
    <div class="info"><div class="cat">${esc(label || (p.service_labels || [])[0] || 'Project')}</div><h3>${esc(p.title)}</h3></div>
  </a>`;
}

function workCard(p) {
  const img = p.cover_image;
  return `<a class="work-card ${img ? '' : 'has-empty'}" href="/project/${esc(p.slug)}">
    ${img ? `<img src="${esc(img)}" alt="">` : '<div class="empty-visual"></div>'}
    <figcaption><span>${esc((p.service_labels || [])[0] || '')}</span><strong>${esc(p.title)}</strong></figcaption>
  </a>`;
}

function servicesHorizon(services, projects) {
  const slides = services.map((s, i) => {
    const n = String(i + 1).padStart(2, '0');
    const selected = (s.featured_project_slugs || [])
      .map((slug) => projects.find((p) => p.slug === slug))
      .filter(Boolean);
    const chips = selected.length
      ? selected.map((p) => `<span>${esc(p.title)}</span>`).join('')
      : (s.capabilities || []).slice(0, 5).map((c) => `<span>${esc(c)}</span>`).join('');
    const art = s.cover_image
      ? `<figure class="svc-frame reveal-media"><img src="${esc(s.cover_image)}" alt=""></figure>`
      : `<figure class="svc-frame"><div class="empty-visual"></div></figure>`;
    const theme = ['is-branding', 'is-media', 'is-web', 'is-digital', 'is-marketing'][i % 5];
    return `<article class="service-slide ${theme}" id="svc-${esc(s.slug)}">
      <div class="svc-art">
        <div class="svc-giant" aria-hidden="true">${n}</div>
        ${art}
      </div>
      <div class="service-copy">
        <div class="num">Service ${n}</div>
        <h1>${esc(s.name)}</h1>
        <h2>${esc(s.statement || '')}</h2>
        <p>${esc(s.description || s.short_description || '')}</p>
        <div class="svc-chips">${chips}</div>
      </div>
    </article>`;
  }).join('');

  const dots = services.map((_, i) => `<button type="button" class="${i === 0 ? 'is-on' : ''}" data-svc-go="${i}">${String(i + 1).padStart(2, '0')}</button>`).join('');

  return `<section class="services-horizon" id="services">
    <div class="services-horizon-pin">
      <div class="services-toolbar"><h2>Services</h2><div class="services-dots">${dots}</div></div>
      <div class="services-track">${slides}</div>
    </div>
  </section>`;
}

function homeSections(pub) {
  const { homepage: home, company, services, projects, featured_projects, clients, case_studies } = pub;
  const latest = (featured_projects.length ? featured_projects : projects).slice(0, 8);
  const latestCards = latest.length
    ? [...latest, ...latest].map(workCard).join('')
    : '<p class="container" style="color:var(--muted)">Published projects will appear here.</p>';

  const cases = (home.featured_case_study_slugs || [])
    .map((slug) => case_studies.find((c) => c.slug === slug))
    .filter(Boolean);
  const caseCards = (cases.length ? cases : case_studies).slice(0, 4).map((c) => {
    const img = (c.gallery || [])[0];
    return `<a class="case-card ${img ? '' : 'has-empty'}" href="/case-study/${esc(c.slug)}">
      ${img ? `<img src="${esc(img)}" alt="">` : '<div class="empty-visual"></div>'}
      <div class="meta"><div class="tag">${esc(c.industry || 'Case Study')}</div><h3>${esc(c.title)}</h3></div>
    </a>`;
  }).join('') || '<p style="color:var(--muted)">Case studies appear here when published.</p>';

  const groups = {};
  services.forEach((s) => { groups[s.slug] = { name: s.name, items: [] }; });
  groups.other = { name: 'Other', items: [] };
  projects.forEach((p) => {
    const key = (p.services || [])[0] || 'other';
    (groups[key] || groups.other).items.push(p);
  });

  const portfolio = Object.values(groups).filter((g) => g.items.length).map((g) => `
    <div class="work-group"><h3>${esc(g.name)}</h3>
      <div class="project-grid">${g.items.map((p) => tile(p, g.name)).join('')}</div>
    </div>`).join('') || '<p style="color:var(--muted)">No published projects yet.</p>';

  const clientSlugs = home.featured_client_slugs || [];
  const shownClients = (clientSlugs.length ? clientSlugs.map((s) => clients.find((c) => c.slug === s)).filter(Boolean) : clients);
  const logos = shownClients.map((c) => (c.logo
    ? `<a class="client-logo" href="${esc(c.website_url || '#')}"><img src="${esc(c.logo)}" alt="${esc(c.name)}"></a>`
    : `<span class="client-logo">${esc(c.name)}</span>`)).join('');

  return `
<section class="section" id="latest">
  <div class="container section-head"><h2>Our Latest Work</h2><a class="ghost-link" href="/portfolio">Our Portfolio</a></div>
  <div class="work-wrap"><div class="work-track">${latestCards}</div></div>
</section>
<section class="section" id="about" style="padding-top:20px">
  <div class="container">
    <div class="section-head"><h2>${esc(home.about.title)}</h2></div>
    <div class="about-grid">
      <div class="about-tabs from-left">
        <button class="is-on" type="button" data-panel="about-kite">About KITE</button>
        <button type="button" data-panel="about-mission">Mission</button>
        <button type="button" data-panel="about-vision">Vision</button>
      </div>
      <div class="about-copy">
        <div class="about-panel" id="about-kite">
          <h3>${esc(home.about.main_statement)}</h3>
          <p>${esc(home.about.description)}</p>
          ${home.about.how_we_work ? `<div class="value"><h5>How we make it fly</h5><p>${esc(home.about.how_we_work)}</p></div>` : ''}
        </div>
        <div class="about-panel" id="about-mission" hidden>
          <h3>Our Mission</h3>
          <p>${esc(home.about.mission || company.mission || '')}</p>
        </div>
        <div class="about-panel" id="about-vision" hidden>
          <h3>Our Vision</h3>
          <p>${esc(home.about.vision || company.vision || '')}</p>
        </div>
      </div>
      <div class="about-visual from-right">
        <div class="empty-visual"></div>
        <img class="about-mark" src="/assets/kite/preloader/logo-icon.svg" alt="KITE">
      </div>
    </div>
  </div>
</section>
${servicesHorizon(services, projects)}
<section class="section" id="case-studies" style="padding-top:20px">
  <div class="container section-head"><h2>Case Studies</h2></div>
  <div class="container cases">${caseCards}</div>
</section>
<section class="section" id="portfolio">
  <div class="container">
    <div class="section-head"><h2>Portfolio / Our Work</h2></div>
    ${portfolio}
  </div>
</section>
<section class="clients" id="kites">
  <h2>Clients / Kites</h2>
  <div class="logo-track">${logos}${logos}</div>
</section>
<section class="cta-band" id="cta">
  <div class="container">
    <h2>${esc(home.cta.headline)}</h2>
    <p style="color:var(--muted);margin:10px 0 22px">${esc(home.cta.supporting)}</p>
    <a class="btn" href="${esc(home.cta.cta_url)}">${esc(home.cta.cta_label)}</a>
  </div>
</section>`;
}

function renderBlocks(blocks, project) {
  return (blocks || []).map((b) => {
    switch (b.type) {
      case 'heading': return `<h2>${esc(b.text || '')}</h2>`;
      case 'text': return `<p>${esc(b.text || '')}</p>`;
      case 'quote': return `<blockquote class="article lead">${esc(b.text || '')}</blockquote>`;
      case 'image':
      case 'hero_image':
      case 'full_width_image':
        return b.src ? `<img src="${esc(b.src)}" alt="${esc(b.alt || '')}" style="width:100%;margin:16px 0">` : '';
      case 'two_image':
        return `<div class="gallery">${[b.src, b.src2].filter(Boolean).map((src) => `<img src="${esc(src)}" alt="">`).join('')}</div>`;
      case 'image_text':
        return `<div class="contact-hero-grid">${b.src ? `<img src="${esc(b.src)}" alt="">` : ''}<div><p>${esc(b.text || '')}</p></div></div>`;
      case 'video':
        return b.src ? `<p><a class="btn ghost" href="${esc(b.src)}">Watch video</a></p>` : '';
      case 'gallery':
        return `<div class="gallery">${(b.items || []).map((src) => `<img src="${esc(src)}" alt="">`).join('')}</div>`;
      case 'project_info':
        return `<p>${esc(project.short_description || '')}</p>`;
      case 'website_preview':
        return project.external_url ? websitePreview(project.external_url) : '';
      case 'spacer':
        return '<div style="height:48px"></div>';
      case 'custom':
        return b.text ? `<p>${esc(b.text)}</p>` : '';
      default:
        return '';
    }
  }).join('');
}

function websitePreview(url) {
  return `<div class="section" style="padding-top:12px">
    <h3>Website preview</h3>
    <p style="margin:10px 0 16px"><a class="btn" href="${esc(url)}" target="_blank" rel="noopener">Open website</a></p>
    <iframe src="${esc(url)}" title="Website preview" style="width:100%;height:520px;border:1px solid rgba(17,17,17,.12);background:#fff" sandbox="allow-scripts allow-same-origin"></iframe>
    <p class="note" style="margin-top:8px;color:var(--muted);font-size:13px">If the site blocks embedding, use Open website.</p>
  </div>`;
}

function projectPage(p, industryName) {
  const blocks = (p.blocks && p.blocks.length)
    ? renderBlocks(p.blocks, p)
    : `<p>${esc(p.full_description || p.short_description || '')}</p>`;
  const gallery = (p.gallery || []).map((g) => {
    const src = g.url || g;
    return src ? `<img src="${esc(src)}" alt="">` : '';
  }).join('');
  return `
    <section class="project-hero">
      ${p.hero_image || p.cover_image ? `<img src="${esc(p.hero_image || p.cover_image)}" alt="">` : ''}
      <div class="shade"></div>
      <div class="inner">
        <div class="cat">${esc((p.service_labels || []).join(' · '))}${industryName ? ` · ${esc(industryName)}` : ''}${p.year ? ` · ${esc(p.year)}` : ''}</div>
        <h1>${esc(p.title)}</h1>
      </div>
    </section>
    <div class="project-body">
      ${blocks}
      ${p.challenge ? `<h3>Challenge</h3><p>${esc(p.challenge)}</p>` : ''}
      ${p.approach ? `<h3>Approach</h3><p>${esc(p.approach)}</p>` : ''}
      ${p.solution ? `<h3>Solution</h3><p>${esc(p.solution)}</p>` : ''}
      ${p.results ? `<h3>Results</h3><p>${esc(p.results)}</p>` : ''}
      ${p.external_url ? websitePreview(p.external_url) : ''}
    </div>
    ${gallery ? `<div class="gallery">${gallery}</div>` : ''}
  `;
}

function casePage(c) {
  const parts = [
    ['Introduction', c.introduction],
    ['Challenge', c.challenge],
    ['Approach', c.approach],
    ['Solution', c.solution],
    ['Results', c.results],
  ].filter(([, text]) => text);
  return `
    <section class="project-hero">
      <div class="inner"><div class="cat">Case Study</div><h1>${esc(c.title)}</h1></div>
    </section>
    <div class="project-body">
      ${parts.map(([h, t]) => `<h3>${esc(h)}</h3><p>${esc(t)}</p>`).join('')}
      ${c.website_url ? websitePreview(c.website_url) : ''}
    </div>
  `;
}

function portfolioPage(pub) {
  const groups = {};
  pub.services.forEach((s) => { groups[s.slug] = { name: s.name, items: [] }; });
  groups.other = { name: 'Other', items: [] };
  pub.projects.forEach((p) => {
    const key = (p.services || [])[0] || 'other';
    (groups[key] || groups.other).items.push(p);
  });
  return `<section class="page-hero"><div class="container"><h1>Portfolio</h1><p>Published KITE work, grouped by service.</p></div></section>
    <section class="section"><div class="container">
      ${Object.values(groups).filter((g) => g.items.length).map((g) => `
        <div class="work-group"><h3>${esc(g.name)}</h3>
          <div class="project-grid">${g.items.map((p) => tile(p, g.name)).join('')}</div>
        </div>`).join('') || '<p>No published projects yet.</p>'}
    </div></section>`;
}

function contactPage(settings) {
  return `<section class="page-hero"><div class="container"><h1>Let's work together</h1><p>Tell us about the brand and the brief.</p></div></section>
    <section class="section"><div class="container">
      <div class="offices" style="grid-template-columns:1fr 1fr">
        <article class="office">
          <h4>Talk to KITE</h4>
          ${settings.phone ? `<p><a href="${esc(settings.socials.whatsapp || '#')}">${esc(settings.phone)}</a></p>` : ''}
          ${settings.email ? `<p>${esc(settings.email)}</p>` : ''}
          ${settings.address ? `<p>${esc(settings.address)}</p>` : ''}
          <p>${esc((settings.website || '').replace(/^https?:\/\//, ''))}</p>
        </article>
        <article class="office">
          <h4>Follow</h4>
          ${Object.entries(settings.socials || {}).filter(([, u]) => u).map(([k, u]) => `<p><a href="${esc(u)}">${esc(k)}</a></p>`).join('')}
        </article>
      </div>
    </div></section>`;
}

function emphasize(headline) {
  const text = String(headline || '');
  const word = 'forward';
  if (!text.toLowerCase().includes(word)) return esc(text);
  return esc(text).replace(/forward\.?/i, '<em>forward.</em>');
}

module.exports = {
  homeSections,
  servicesHorizon,
  projectPage,
  casePage,
  portfolioPage,
  contactPage,
  emphasize,
  tile,
};
