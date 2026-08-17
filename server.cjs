const http = require('http');
const fs = require('fs');
const path = require('path');
const content = require('./resources/site/content.cjs');

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const SITE = path.join(ROOT, 'resources', 'site');
const PORT = Number(process.env.PORT || 4173);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function layout(inner, meta = {}) {
  const html = read(path.join(SITE, 'layout.html'));
  return html
    .replaceAll('{{title}}', meta.title || 'MWG Advertising Agency')
    .replaceAll('{{description}}', meta.description || 'MWG Advertising Agency & Creative Agency Egypt')
    .replaceAll('{{headerClass}}', meta.headerClass || '')
    .replace('{{content}}', inner);
}

function pageFile(name) {
  return read(path.join(SITE, 'pages', `${name}.html`));
}

function projectGrid() {
  const items = [
    ['digital', '/project/naguib-selim', 'naguib-selim.jpg', 'Digital', 'Naguib Selim', 'A mass-market campaign about individuality through fabric'],
    ['graphics', '/project/chubb-mestnyak-a7la-7ekyat', 'chubb-mestnyak.jpg', 'Graphics', 'Chubb “Mestnyak A7la 7ekyat”', 'A storytelling campaign connecting life insurance to joy'],
    ['btl', '/project/chubb-life-insurance-egypt', 'chubb.jpg', 'BTL', 'CHUBB life Insurance Egypt', 'Visual storytelling for insurance companies in Egypt'],
    ['production', '/project/duspataline', 'duspataline.jpg', 'Production', 'Duspataline', 'Commercial showcasing Duspataline for epigastric pain relief'],
    ['digital', '/project/cosmoshop', 'cosmoshop.jpg', 'Digital', 'Cosmoshop', 'Vibrant campaign for a leading cosmetics store experience'],
    ['production', '/project/dr-nour-mirror', 'dr-nour-mirror.jpg', 'Production', 'Dr-Nour (Mirror)', 'A video series for the best dental clinic in Cairo'],
    ['digital', '/project/dr-nour', 'dr-nour.jpg', 'Digital', 'Dr. Nour', 'An elegant visual campaign for the best dentist in Cairo'],
    ['graphics', '/project/vezeeta', 'vezeeta.jpg', 'Graphics', 'Vezeeta', 'An awareness campaign for a digital healthcare platform'],
    ['btl', '/project/the-spot-mall', 'spot-mall.jpg', 'BTL', 'The Spot Mall', 'Ramadan BTL services bringing The Spot Mall to life'],
  ];
  return `
    <section class="section" style="padding-top:28px">
      <div class="container">
        <div class="filters">
          <button class="is-on" data-filter="all" type="button">All</button>
          <button data-filter="digital" type="button">Digital</button>
          <button data-filter="graphics" type="button">Graphics</button>
          <button data-filter="btl" type="button">BTL</button>
          <button data-filter="production" type="button">Production</button>
        </div>
        <div class="project-grid">
          ${items.map(([cat, href, img, label, title, desc]) => `
            <a class="project-tile" data-cat="${cat}" href="${href}">
              <img src="/assets/images/projects/${img}" alt="${title}">
              <div class="info"><div class="cat">${label}</div><h3>${title}</h3><p>${desc}</p></div>
            </a>`).join('')}
        </div>
      </div>
    </section>`;
}

function renderService(slug) {
  const s = content.services[slug];
  if (!s) return null;
  const keys = Object.keys(content.services);
  const i = keys.indexOf(slug);
  const prev = keys[(i - 1 + keys.length) % keys.length];
  const next = keys[(i + 1) % keys.length];
  return `
    <section class="service-stage">
      <div class="service-visual"><img src="${s.image}" alt="${s.title}"></div>
      <div class="service-copy">
        <div class="num">${s.num}</div>
        <h1>${s.title}</h1>
        <h2>${s.eyebrow}</h2>
        ${s.paragraphs.map((p) => `<p>${p}</p>`).join('')}
        <div class="service-nav">
          <a class="circle" href="/services/${prev}" aria-label="Previous">←</a>
          <a class="circle" href="/services/${next}" aria-label="Next">→</a>
        </div>
      </div>
    </section>
    ${projectGrid()}`;
}

function renderProject(slug) {
  const p = content.projects[slug];
  if (!p) return null;
  return `
    <section class="project-hero">
      <img src="${p.image}" alt="${p.title}">
      <div class="shade"></div>
      <div class="inner">
        <div class="cat">${p.category}</div>
        <h1>${p.title}</h1>
      </div>
    </section>
    <div class="project-body">
      <h3>About The Project</h3>
      <p>${p.body}</p>
    </div>
    <div class="gallery">
      <img src="${p.image}" alt="">
      <img src="/assets/images/hero.jpg" alt="">
      <img src="/assets/images/about.jpg" alt="">
      <img src="/assets/images/contact.jpg" alt="">
    </div>`;
}

function renderCase(slug) {
  const c = content.cases[slug];
  if (!c) return null;
  return `
    <section class="project-hero">
      <img src="${c.image}" alt="${c.title}">
      <div class="shade"></div>
      <div class="inner">
        <div class="cat">${c.category} · Case Study</div>
        <h1>${c.title}</h1>
      </div>
    </section>
    <div class="project-body">
      <h3>The work</h3>
      <p>${c.body}</p>
    </div>`;
}

function renderPost(slug) {
  const p = content.posts[slug];
  if (!p) return null;
  return `
    <article class="article">
      <div class="meta">By MWG · ${p.date}</div>
      <h1>${p.title}</h1>
      <p class="lead">${p.lead}</p>
      <img src="${p.image}" alt="" style="width:100%;height:360px;object-fit:cover;margin:8px 0 28px">
      ${p.body.map((para) => `<p>${para}</p>`).join('')}
    </article>`;
}

function route(urlPath) {
  const url = urlPath.replace(/\/+$/, '') || '/';

  if (url === '/' || url === '/home' || url === '/home/about') {
    return layout(pageFile('home'), {
      title: 'MWG Advertising Agency & Creative Agency Egypt',
      description: 'Looking for the best advertising agency in Egypt? MWG offers advertising solutions to help boost your brand.',
    });
  }
  if (url === '/big-bang') {
    return layout(pageFile('big-bang'), { title: 'Big Bang · MWG', headerClass: 'is-solid' });
  }
  if (url === '/services') {
    return layout(pageFile('services'), { title: 'Services · MWG', headerClass: 'is-solid' });
  }
  if (url.startsWith('/services/')) {
    const html = renderService(url.slice('/services/'.length));
    return html && layout(html, { title: `${content.services[url.slice('/services/'.length)].title} · MWG`, headerClass: 'is-solid' });
  }
  if (url === '/portfolio') {
    return layout(pageFile('portfolio'), { title: 'Portfolio · MWG', headerClass: 'is-solid' });
  }
  if (url === '/case-studies') {
    return layout(pageFile('case-studies'), { title: 'Case Studies · MWG', headerClass: 'is-solid' });
  }
  if (url.startsWith('/case-study/')) {
    const slug = url.slice('/case-study/'.length);
    const html = renderCase(slug);
    return html && layout(html, { title: `${content.cases[slug].title} · Case Study`, headerClass: 'is-solid' });
  }
  if (url === '/blog') {
    return layout(pageFile('blog'), { title: 'The Big Bang Log · MWG', headerClass: 'is-solid' });
  }
  if (url.startsWith('/post/')) {
    const slug = url.slice('/post/'.length);
    const html = renderPost(slug);
    return html && layout(html, { title: `${content.posts[slug].title} · MWG`, headerClass: 'is-solid' });
  }
  if (url === '/contact-us') {
    return layout(pageFile('contact'), { title: 'Contact Us · MWG', headerClass: 'is-solid' });
  }
  if (url.startsWith('/project/')) {
    const slug = url.slice('/project/'.length);
    const html = renderProject(slug);
    return html && layout(html, { title: `${content.projects[slug].title} · MWG`, headerClass: 'is-solid' });
  }
  return null;
}

function send(res, status, body, type = 'text/html; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': status === 200 && type.startsWith('image/') ? 'public, max-age=86400' : 'no-cache',
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);

  if (url.startsWith('/assets/') || url === '/favicon.ico') {
    const file = url === '/favicon.ico'
      ? path.join(PUBLIC, 'favicon.ico')
      : path.join(PUBLIC, url);
    const safe = path.normalize(file).startsWith(PUBLIC);
    if (!safe || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      send(res, 404, 'Not found', 'text/plain');
      return;
    }
    send(res, 200, fs.readFileSync(file), MIME[path.extname(file)] || 'application/octet-stream');
    return;
  }

  try {
    const html = route(url);
    if (!html) {
      send(res, 404, layout(`<section class="page-hero"><div class="container"><h1>Page not found</h1><p><a class="ghost-link" href="/home">Back home</a></p></div></section>`, { title: 'Not found · MWG', headerClass: 'is-solid' }));
      return;
    }
    send(res, 200, html);
  } catch (err) {
    console.error(err);
    send(res, 500, 'Server error', 'text/plain');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`MWG site preview on http://0.0.0.0:${PORT}`);
});
