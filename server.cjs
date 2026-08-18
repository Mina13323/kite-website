const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cms = require('./database/data/cms-store.cjs');
const studioUi = require('./resources/studio/render.cjs');
const studioPages = require('./resources/studio/pages.cjs');
const pubRender = require('./resources/site/public-render.cjs');
const animLib = require('./database/data/animation-presets.cjs');

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const SITE = path.join(ROOT, 'resources', 'site');
const PORT = Number(process.env.PORT || 4173);
const STUDIO_EMAIL = 'studio@kiteagency-eg.com';
const STUDIO_PASSWORD = process.env.STUDIO_PASSWORD || 'kite-studio';
const sessions = new Set();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function readFile(file) {
  return fs.readFileSync(file, 'utf8');
}

function cookies(req) {
  const out = {};
  String(req.headers.cookie || '').split(';').forEach((part) => {
    const [k, ...rest] = part.trim().split('=');
    if (k) out[k] = decodeURIComponent(rest.join('='));
  });
  return out;
}

function isStudio(req) {
  return sessions.has(cookies(req).kite_studio);
}

function send(res, status, body, type = 'text/html; charset=utf-8', extra = {}) {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    ...extra,
  });
  res.end(body);
}

function redirect(res, to, extra = {}) {
  res.writeHead(302, { Location: to, 'Cache-Control': 'no-store', ...extra });
  res.end();
}

const SERVICE_ALIASES = {
  media: 'media-production',
  web: 'web-development',
  digital: 'digital-content',
  marketing: 'marketing-materials',
  'graphic-design': 'branding',
  btl: 'marketing-materials',
};

function resolveServiceSlug(slug) {
  return SERVICE_ALIASES[slug] || slug;
}

function layout(inner, meta = {}) {
  const data = cms.read();
  const settings = data.settings;
  const socials = Object.entries(settings.socials || {})
    .filter(([, url]) => url)
    .map(([name, url]) => `<a href="${url}">${name[0].toUpperCase()}${name.slice(1)}</a>`)
    .join('');
  const phone = settings.phone
    ? `<a href="${settings.socials.whatsapp || '#'}">${settings.phone}</a>`
    : '';
  const footerServices = cms.published(data.services).map((s) =>
    `<li><a href="/services/${s.slug}">${s.name.toUpperCase()}</a></li>`).join('');
  const origin = process.env.APP_URL || 'https://www.kiteagency-eg.com';
  const canonical = meta.canonical || `${origin.replace(/\/$/, '')}${meta.path || '/'}`;
  return readFile(path.join(SITE, 'layout.html'))
    .replaceAll('{{title}}', meta.title || 'KITE Design Studio')
    .replaceAll('{{description}}', meta.description || settings.tagline || '')
    .replaceAll('{{canonical}}', canonical)
    .replaceAll('{{headerClass}}', meta.headerClass || '')
    .replaceAll('{{bodyClass}}', meta.bodyClass || '')
    .replaceAll('{{extraHead}}', meta.extraHead || '')
    .replaceAll('{{extraScript}}', meta.extraScript || '')
    .replaceAll('{{footerTag}}', settings.tagline || '')
    .replaceAll('{{footerWeb}}', (settings.website || '').replace(/^https?:\/\//, ''))
    .replaceAll('{{footerPhone}}', phone)
    .replaceAll('{{footerSocials}}', socials)
    .replaceAll('{{footerServices}}', footerServices)
    .replace('{{content}}', inner);
}

function homePage() {
  const pub = cms.publicPayload();
  const hero = pub.homepage.hero;
  let html = readFile(path.join(SITE, 'pages', 'home.html'));
  html = html
    .replaceAll('{{heroHeadline}}', pubRender.emphasize(hero.headline))
    .replaceAll('{{heroSupporting}}', hero.supporting || '')
    .replaceAll('{{heroCta}}', hero.cta_label || 'View work')
    .replaceAll('{{heroSecondaryCta}}', hero.secondary_cta_label || 'Start a project')
    .replaceAll('{{heroSecondaryUrl}}', hero.secondary_cta_url || '/contact-us')
    .replace('{{cmsHome}}', pubRender.homeSections(pub));
  return layout(html, {
    title: `${pub.settings.company_name} — Aim High. Fly Higher.`,
    description: hero.supporting,
    bodyClass: 'home-intro',
    extraHead: '<link rel="stylesheet" href="/assets/css/kite-intro.css?v=kite-sky-7">',
    extraScript: '<script src="/assets/js/kite-intro.js?v=kite-sky-7"></script><script src="/assets/js/kite-services.js?v=kite-sky-7"></script>',
  });
}

function parseUrlForm(raw) {
  const params = new URLSearchParams(raw);
  const obj = {};
  for (const [k, v] of params.entries()) {
    if (obj[k] === undefined) obj[k] = v;
    else if (Array.isArray(obj[k])) obj[k].push(v);
    else obj[k] = [obj[k], v];
  }
  return obj;
}

function list(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const ct = req.headers['content-type'] || '';
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('error', reject);
    req.on('end', () => {
      const buf = Buffer.concat(chunks);
      if (ct.includes('multipart/form-data')) {
        resolve(parseMultipart(buf, ct));
        return;
      }
      resolve({ fields: parseUrlForm(buf.toString('utf8')), file: null });
    });
  });
}

function parseMultipart(buf, contentType) {
  const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType);
  if (!m) return { fields: {}, file: null };
  const boundary = Buffer.from(`--${m[1] || m[2]}`);
  const fields = {};
  let file = null;
  let start = 0;
  while (start < buf.length) {
    const idx = buf.indexOf(boundary, start);
    if (idx < 0) break;
    const next = buf.indexOf(boundary, idx + boundary.length);
    if (next < 0) break;
    const part = buf.slice(idx + boundary.length + 2, next - 2);
    const split = part.indexOf(Buffer.from('\r\n\r\n'));
    if (split < 0) {
      start = next;
      continue;
    }
    const header = part.slice(0, split).toString('utf8');
    const body = part.slice(split + 4);
    const nameM = /name="([^"]+)"/.exec(header);
    const fileM = /filename="([^"]+)"/.exec(header);
    if (fileM && nameM) {
      file = { field: nameM[1], filename: fileM[1], buffer: body };
    } else if (nameM) {
      const val = body.toString('utf8');
      if (fields[nameM[1]] === undefined) fields[nameM[1]] = val;
      else if (Array.isArray(fields[nameM[1]])) fields[nameM[1]].push(val);
      else fields[nameM[1]] = [fields[nameM[1]], val];
    }
    start = next;
  }
  return { fields, file };
}

function qs(url) {
  const q = url.includes('?') ? url.slice(url.indexOf('?') + 1) : '';
  return Object.fromEntries(new URLSearchParams(q));
}

function industryName(slug) {
  return cms.read().industries.find((i) => i.slug === slug)?.name || '';
}

const ALLOWED_UPLOAD = {
  '.jpg': 1, '.jpeg': 1, '.png': 1, '.webp': 1, '.svg': 1,
};

async function handleStudio(req, res, urlPath, urlFull) {
  const query = qs(urlFull);

  if (urlPath === '/studio/login' && req.method === 'GET') {
    send(res, 200, studioUi.loginPage(query.error));
    return;
  }
  if (urlPath === '/studio/login' && req.method === 'POST') {
    const { fields } = await parseBody(req);
    if (fields.email === STUDIO_EMAIL && fields.password === STUDIO_PASSWORD) {
      const token = crypto.randomBytes(16).toString('hex');
      sessions.add(token);
      redirect(res, '/studio', { 'Set-Cookie': `kite_studio=${token}; Path=/; HttpOnly; SameSite=Lax` });
      return;
    }
    redirect(res, '/studio/login?error=Wrong+email+or+password');
    return;
  }
  if (urlPath === '/studio/logout') {
    sessions.delete(cookies(req).kite_studio);
    redirect(res, '/studio/login', { 'Set-Cookie': 'kite_studio=; Path=/; Max-Age=0' });
    return;
  }
  if (!isStudio(req)) {
    redirect(res, '/studio/login');
    return;
  }

  const data = cms.read();

  if (urlPath === '/studio' || urlPath === '/studio/') {
    send(res, 200, studioUi.dashboard(cms.stats(), query));
    return;
  }
  if (urlPath === '/studio/animations') {
    send(res, 200, studioPages.animationsPage(animLib.PRESETS, query));
    return;
  }
  if (urlPath.startsWith('/studio/preview/project/')) {
    const slug = urlPath.slice('/studio/preview/project/'.length);
    const p = cms.projectBySlug(slug, { allowUnpublished: true });
    if (!p) { send(res, 404, 'Not found', 'text/plain'); return; }
    const related = cms.publicPayload().projects.filter((x) => x.slug !== p.slug).slice(0, 3);
    send(res, 200, layout(pubRender.projectPage(p, industryName(p.industry), related), {
      title: `Preview · ${p.title}`,
      headerClass: 'is-solid',
      ...projectAssets(),
    }));
    return;
  }

  if (urlPath === '/studio/projects' && req.method === 'GET') {
    send(res, 200, studioPages.projectsIndex(data.projects, query));
    return;
  }
  if (urlPath === '/studio/projects/new' && req.method === 'GET') {
    send(res, 200, studioPages.projectForm({}, data.services, data.industries, data.media, query));
    return;
  }
  if (urlPath === '/studio/projects/new' && req.method === 'POST') {
    const { fields } = await parseBody(req);
    const p = saveProjectFields(null, fields);
    redirect(res, `/studio/projects/${p.slug}?saved=1`);
    return;
  }
  if (urlPath.startsWith('/studio/projects/') && urlPath.endsWith('/delete') && req.method === 'POST') {
    const slug = urlPath.slice('/studio/projects/'.length, -'/delete'.length);
    cms.removeItem('projects', slug);
    redirect(res, '/studio/projects?deleted=1');
    return;
  }
  if (urlPath.startsWith('/studio/projects/') && req.method === 'GET') {
    const slug = urlPath.slice('/studio/projects/'.length);
    const p = data.projects.find((x) => x.slug === slug);
    if (!p) { send(res, 404, 'Not found', 'text/plain'); return; }
    send(res, 200, studioPages.projectForm(p, data.services, data.industries, data.media, query));
    return;
  }
  if (urlPath.startsWith('/studio/projects/') && req.method === 'POST') {
    const slug = urlPath.slice('/studio/projects/'.length);
    const { fields } = await parseBody(req);
    const p = saveProjectFields(slug, fields);
    redirect(res, `/studio/projects/${p.slug}?saved=1`);
    return;
  }

  if (urlPath === '/studio/services' && req.method === 'GET') {
    send(res, 200, studioPages.servicesIndex(data.services, query));
    return;
  }
  if (urlPath === '/studio/services/reorder' && req.method === 'POST') {
    const { fields } = await parseBody(req);
    data.services.forEach((s) => {
      const n = Number(fields[`sort_${s.slug}`]);
      if (!Number.isNaN(n)) s.sort_order = n;
    });
    cms.write(data);
    redirect(res, '/studio/services?saved=1');
    return;
  }
  if (urlPath === '/studio/services/new' && req.method === 'GET') {
    send(res, 200, studioPages.serviceForm({}, data.projects, query));
    return;
  }
  if (urlPath === '/studio/services/new' && req.method === 'POST') {
    const { fields } = await parseBody(req);
    const s = saveServiceFields(null, fields);
    redirect(res, `/studio/services/${s.slug}?saved=1`);
    return;
  }
  if (urlPath.startsWith('/studio/services/') && req.method === 'GET') {
    const slug = urlPath.slice('/studio/services/'.length);
    const s = data.services.find((x) => x.slug === slug);
    if (!s) { send(res, 404, 'Not found', 'text/plain'); return; }
    send(res, 200, studioPages.serviceForm(s, data.projects, query));
    return;
  }
  if (urlPath.startsWith('/studio/services/') && req.method === 'POST') {
    const slug = urlPath.slice('/studio/services/'.length);
    const { fields } = await parseBody(req);
    const s = saveServiceFields(slug, fields);
    redirect(res, `/studio/services/${s.slug}?saved=1`);
    return;
  }

  if (urlPath === '/studio/industries' && req.method === 'GET') {
    send(res, 200, studioPages.industriesPage(data.industries, query));
    return;
  }
  if (urlPath === '/studio/industries/new' && req.method === 'POST') {
    const { fields } = await parseBody(req);
    cms.saveIndustry(null, { name: fields.name });
    redirect(res, '/studio/industries?saved=1');
    return;
  }
  if (urlPath.startsWith('/studio/industries/') && req.method === 'POST') {
    const slug = urlPath.slice('/studio/industries/'.length);
    const { fields } = await parseBody(req);
    cms.saveIndustry(slug, { name: fields.name, status: fields.status });
    redirect(res, '/studio/industries?saved=1');
    return;
  }

  if (urlPath === '/studio/clients' && req.method === 'GET') {
    send(res, 200, studioPages.clientsPage(data.clients, data.industries, query));
    return;
  }
  if (urlPath === '/studio/clients/new' && req.method === 'GET') {
    send(res, 200, studioPages.clientForm({}, data.industries, query));
    return;
  }
  if (urlPath === '/studio/clients/new' && req.method === 'POST') {
    const { fields } = await parseBody(req);
    const c = saveClientFields(null, fields);
    redirect(res, `/studio/clients/${c.slug}?saved=1`);
    return;
  }
  if (urlPath.endsWith('/delete') && urlPath.startsWith('/studio/clients/')) {
    const slug = urlPath.slice('/studio/clients/'.length, -'/delete'.length);
    cms.removeItem('clients', slug);
    redirect(res, '/studio/clients?deleted=1');
    return;
  }
  if (urlPath.startsWith('/studio/clients/') && req.method === 'GET') {
    const slug = urlPath.slice('/studio/clients/'.length);
    const c = data.clients.find((x) => x.slug === slug);
    if (!c) { send(res, 404, 'Not found', 'text/plain'); return; }
    send(res, 200, studioPages.clientForm(c, data.industries, query));
    return;
  }
  if (urlPath.startsWith('/studio/clients/') && req.method === 'POST') {
    const slug = urlPath.slice('/studio/clients/'.length);
    const { fields } = await parseBody(req);
    const c = saveClientFields(slug, fields);
    redirect(res, `/studio/clients/${c.slug}?saved=1`);
    return;
  }

  if (urlPath === '/studio/case-studies' && req.method === 'GET') {
    send(res, 200, studioPages.casesIndex(data.case_studies, query));
    return;
  }
  if (urlPath === '/studio/case-studies/new' && req.method === 'GET') {
    send(res, 200, studioPages.caseForm({}, data.projects, data.services, data.industries, query));
    return;
  }
  if (urlPath === '/studio/case-studies/new' && req.method === 'POST') {
    const { fields } = await parseBody(req);
    const c = saveCaseFields(null, fields);
    redirect(res, `/studio/case-studies/${c.slug}?saved=1`);
    return;
  }
  if (urlPath.startsWith('/studio/case-studies/') && req.method === 'GET') {
    const slug = urlPath.slice('/studio/case-studies/'.length);
    const c = data.case_studies.find((x) => x.slug === slug);
    if (!c) { send(res, 404, 'Not found', 'text/plain'); return; }
    send(res, 200, studioPages.caseForm(c, data.projects, data.services, data.industries, query));
    return;
  }
  if (urlPath.startsWith('/studio/case-studies/') && req.method === 'POST') {
    const slug = urlPath.slice('/studio/case-studies/'.length);
    const { fields } = await parseBody(req);
    const c = saveCaseFields(slug, fields);
    redirect(res, `/studio/case-studies/${c.slug}?saved=1`);
    return;
  }

  if (urlPath === '/studio/homepage' && req.method === 'GET') {
    send(res, 200, studioPages.homepageForm(data.homepage, data.projects, data.case_studies, data.clients, query));
    return;
  }
  if (urlPath === '/studio/homepage' && req.method === 'POST') {
    const { fields } = await parseBody(req);
    cms.saveHomepage({
      hero: {
        headline: fields.hero_headline,
        supporting: fields.hero_supporting,
        cta_label: fields.hero_cta_label,
        cta_url: fields.hero_cta_url,
        secondary_cta_label: fields.hero_secondary_cta_label,
        secondary_cta_url: fields.hero_secondary_cta_url,
      },
      services_intro: {
        title: fields.svc_title,
        statement: fields.svc_statement,
        supporting: fields.svc_supporting,
      },
      about: {
        title: fields.about_title,
        main_statement: fields.about_main,
        description: fields.about_description,
        mission: fields.about_mission,
        vision: fields.about_vision,
        how_we_work: fields.about_how,
      },
      cta: {
        headline: fields.cta_headline,
        supporting: fields.cta_supporting,
        cta_label: fields.cta_label,
        cta_url: fields.cta_url,
      },
      featured_project_slugs: list(fields.featured_project_slugs),
      featured_case_study_slugs: list(fields.featured_case_study_slugs),
      featured_client_slugs: list(fields.featured_client_slugs),
    });
    redirect(res, '/studio/homepage?saved=1');
    return;
  }

  if (urlPath === '/studio/media' && req.method === 'GET') {
    send(res, 200, studioPages.mediaPage(data.media, data.image_specs, query));
    return;
  }
  if (urlPath === '/studio/media' && req.method === 'POST') {
    const { file } = await parseBody(req);
    if (!file || !file.filename) {
      redirect(res, '/studio/media?error=Choose+an+image');
      return;
    }
    const ext = path.extname(file.filename).toLowerCase();
    if (!ALLOWED_UPLOAD[ext]) {
      redirect(res, '/studio/media?error=Use+jpg,+png,+webp+or+svg');
      return;
    }
    if (file.buffer.length > 8 * 1024 * 1024) {
      redirect(res, '/studio/media?error=Max+8MB');
      return;
    }
    cms.saveUpload(file.filename, file.buffer);
    redirect(res, '/studio/media?saved=1');
    return;
  }
  if (urlPath.startsWith('/studio/media/') && urlPath.endsWith('/delete')) {
    const id = urlPath.slice('/studio/media/'.length, -'/delete'.length);
    cms.removeMedia(id);
    redirect(res, '/studio/media?deleted=1');
    return;
  }

  if (urlPath === '/studio/contact' && req.method === 'GET') {
    send(res, 200, studioPages.contactPage(data.settings, data.company, query));
    return;
  }
  if (urlPath === '/studio/contact' && req.method === 'POST') {
    const { fields } = await parseBody(req);
    cms.saveSettings({
      company_name: fields.company_name,
      tagline: fields.tagline,
      phone: fields.phone,
      website: fields.website,
      email: fields.email || null,
      address: fields.address || null,
      socials: {
        behance: fields.behance,
        instagram: fields.instagram,
        facebook: fields.facebook,
        linkedin: fields.linkedin,
        whatsapp: fields.whatsapp,
      },
    });
    cms.saveCompany({
      story: fields.story,
      mission: fields.mission,
      vision: fields.vision,
    });
    redirect(res, '/studio/contact?saved=1');
    return;
  }

  send(res, 404, 'Not found', 'text/plain');
}

function lines(value) {
  return String(value || '').split('\n').map((s) => s.trim()).filter(Boolean);
}

function saveProjectFields(id, f) {
  let blocks = [];
  try { blocks = f.blocks ? JSON.parse(f.blocks) : []; } catch { blocks = []; }
  if (!Array.isArray(blocks)) blocks = [];
  return cms.saveProject(id, {
    title: f.title,
    slug: f.slug,
    client: f.client,
    industry: f.industry,
    year: f.year || null,
    status: f.status || 'draft',
    short_description: f.short_description,
    full_description: f.full_description,
    services: list(f.services),
    service_labels: list(f.services).map((slug) => {
      const s = cms.read().services.find((x) => x.slug === slug);
      return s ? s.name : slug;
    }),
    external_url: f.external_url || null,
    cover_image: f.cover_image || null,
    hero_image: f.hero_image || null,
    og_image: f.og_image || null,
    seo_title: f.seo_title || null,
    seo_description: f.seo_description || null,
    challenge: f.challenge || null,
    approach: f.approach || null,
    solution: f.solution || null,
    results: f.results || null,
    featured: f.featured === '1',
    gallery: lines(f.gallery).map((url) => ({ id: crypto.randomBytes(4).toString('hex'), url })),
    blocks,
    sections: parseSections(f.sections),
    animation: animLib.sanitizeProjectAnimation({
      theme: f.anim_theme,
      intensity: f.anim_intensity,
      respect_reduced_motion: true,
    }),
  });
}

function parseSections(raw) {
  let list = [];
  try { list = raw ? JSON.parse(raw) : []; } catch { list = []; }
  if (!Array.isArray(list)) return [];
  return list.map((s) => ({
    id: String(s.id || `sec-${Date.now()}`).slice(0, 40),
    type: animLib.SECTION_TYPES.some((t) => t.id === s.type) ? s.type : 'text',
    heading: String(s.heading || '').slice(0, 200),
    text: String(s.text || '').slice(0, 8000),
    media: Array.isArray(s.media) ? s.media.map(String).filter(Boolean).slice(0, 12) : [],
    video_url: String(s.video_url || '').slice(0, 400),
    animation: animLib.sanitizeAnimation(s.animation || {}),
  }));
}

function projectAssets() {
  return {
    extraHead: '<link rel="stylesheet" href="/assets/css/kite-project.css?v=1">',
    extraScript: '<script src="/assets/js/kite-presets.js?v=1"></script>',
  };
}

function saveServiceFields(id, f) {
  return cms.saveService(id, {
    name: f.name,
    slug: f.slug,
    statement: f.statement,
    status: f.status,
    short_description: f.short_description,
    description: f.description,
    capabilities: lines(f.capabilities),
    cover_image: f.cover_image || null,
    seo_title: f.seo_title || null,
    seo_description: f.seo_description || null,
    featured_project_slugs: list(f.featured_project_slugs),
    featured: f.featured === '1',
  });
}

function saveClientFields(id, f) {
  return cms.saveClient(id, {
    name: f.name,
    slug: f.slug,
    logo: f.logo || null,
    website_url: f.website_url || null,
    industry: f.industry || null,
    status: f.status,
    sort_order: Number(f.sort_order || 0),
  });
}

function saveCaseFields(id, f) {
  return cms.saveCaseStudy(id, {
    title: f.title,
    slug: f.slug,
    project_slug: f.project_slug || null,
    status: f.status,
    introduction: f.introduction,
    challenge: f.challenge,
    approach: f.approach,
    solution: f.solution,
    results: f.results,
    industry: f.industry || null,
    website_url: f.website_url || null,
    services: list(f.services),
    featured: f.featured === '1',
    gallery: lines(f.gallery),
  });
}

function sitemapXml() {
  const origin = (process.env.APP_URL || 'https://www.kiteagency-eg.com').replace(/\/$/, '');
  const pub = cms.publicPayload();
  const urls = ['/', '/home', '/services', '/portfolio', '/case-studies', '/contact-us'];
  pub.services.forEach((s) => urls.push(`/services/${s.slug}`));
  pub.projects.forEach((p) => urls.push(`/project/${p.slug}`));
  pub.case_studies.forEach((c) => urls.push(`/case-study/${c.slug}`));
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${origin}${u}</loc></url>`).join('\n')}
</urlset>
`;
}

function publicRoute(urlPath) {
  const pub = cms.publicPayload();
  if (urlPath === '/' || urlPath === '/home' || urlPath === '/home/about') {
    return { html: homePage() };
  }
  if (urlPath === '/about') {
    return { location: '/home#about' };
  }
  if (urlPath === '/projects') {
    return { location: '/portfolio' };
  }
  if (urlPath === '/sitemap.xml') {
    return { raw: sitemapXml(), type: 'application/xml; charset=utf-8' };
  }
  if (urlPath === '/robots.txt') {
    return { raw: 'User-agent: *\nAllow: /\nDisallow: /studio\nDisallow: /studio/\nSitemap: https://www.kiteagency-eg.com/sitemap.xml\n', type: 'text/plain; charset=utf-8' };
  }
  if (urlPath === '/services') {
    return {
      html: layout(
        `<section class="page-hero"><div class="container"><h1>${pub.homepage.services_intro.title}</h1><p>${pub.homepage.services_intro.supporting}</p></div></section>${pubRender.servicesHorizon(pub.services, pub.projects)}`,
        { title: `Services · ${pub.settings.company_name}`, headerClass: 'is-solid', extraScript: '<script src="/assets/js/kite-services.js?v=kite-sky-7"></script>' },
      ),
    };
  }
  if (urlPath.startsWith('/services/')) {
    const slug = resolveServiceSlug(urlPath.slice('/services/'.length));
    const s = cms.serviceBySlug(slug);
    if (!s) return { html: null };
    const related = cms.projectsForService(slug);
    return {
      html: layout(
        `<section class="page-hero"><div class="container"><h1>${s.name}</h1><p>${s.statement || ''}</p></div></section>
         <section class="section"><div class="container"><p>${s.description || ''}</p>
         <div class="project-grid" style="margin-top:28px">${related.map((p) => pubRender.tile(p, s.name)).join('') || '<p>No published projects for this service yet.</p>'}</div></div></section>`,
        { title: `${s.seo_title || s.name} · KITE`, description: s.seo_description || s.description, headerClass: 'is-solid' },
      ),
    };
  }
  if (urlPath === '/portfolio') {
    return { html: layout(pubRender.portfolioPage(pub), { title: `Portfolio · ${pub.settings.company_name}`, headerClass: 'is-solid' }) };
  }
  if (urlPath === '/case-studies') {
    const cards = pub.case_studies.map((c) => `<a class="case-card has-empty" href="/case-study/${c.slug}"><div class="empty-visual"></div><div class="meta"><div class="tag">Case Study</div><h3>${c.title}</h3></div></a>`).join('')
      || '<p>No published case studies yet.</p>';
    return {
      html: layout(
        `<section class="page-hero"><div class="container"><h1>Case Studies</h1><p>Deeper looks at selected work.</p></div></section><section class="section"><div class="container cases">${cards}</div></section>`,
        { title: `Case Studies · ${pub.settings.company_name}`, headerClass: 'is-solid' },
      ),
    };
  }
  if (urlPath.startsWith('/case-studies/') || urlPath.startsWith('/case-study/')) {
    const slug = urlPath.replace(/^\/case-stud(?:y|ies)\//, '');
    const c = cms.caseBySlug(slug);
    if (!c) return { html: null };
    return { html: layout(pubRender.casePage(c), { title: `${c.title} · Case Study`, headerClass: 'is-solid', path: `/case-study/${slug}` }) };
  }
  if (urlPath.startsWith('/project/')) {
    const p = cms.projectBySlug(urlPath.slice('/project/'.length));
    if (!p) return { html: null };
    const list = pub.projects;
    const i = list.findIndex((x) => x.slug === p.slug);
    const related = [list[i - 1], list[i + 1]].filter(Boolean);
    return {
      html: layout(pubRender.projectPage(p, industryName(p.industry), related), {
        title: p.seo_title || `${p.title} · KITE`,
        description: p.seo_description || p.short_description,
        headerClass: 'is-solid',
        path: `/project/${p.slug}`,
        ...projectAssets(),
      }),
    };
  }
  if (urlPath === '/contact-us') {
    return { html: layout(pubRender.contactPage(pub.settings), { title: `Contact · ${pub.settings.company_name}`, headerClass: 'is-solid', path: '/contact-us' }) };
  }
  if (urlPath === '/big-bang') {
    return { location: '/portfolio' };
  }
  if (urlPath === '/blog' || urlPath.startsWith('/post/')) {
    return { location: '/home' };
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  const urlFull = req.url || '/';
  const urlPath = decodeURIComponent(urlFull.split('?')[0]).replace(/\/+$/, '') || '/';

  if (urlPath.startsWith('/assets/') || urlPath.startsWith('/uploads/') || urlPath === '/favicon.ico') {
    const file = urlPath === '/favicon.ico'
      ? path.join(PUBLIC, 'assets/kite/preloader/logo-icon.svg')
      : path.join(PUBLIC, urlPath);
    const safe = path.normalize(file).startsWith(PUBLIC);
    if (!safe || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      send(res, 404, 'Not found', 'text/plain');
      return;
    }
    send(res, 200, fs.readFileSync(file), MIME[path.extname(file)] || 'application/octet-stream');
    return;
  }

  try {
    if (urlPath === '/studio' || urlPath.startsWith('/studio/')) {
      await handleStudio(req, res, urlPath, urlFull);
      return;
    }
    if (urlPath === '/contact-us' && req.method === 'POST') {
      const { fields } = await parseBody(req);
      const name = String(fields.name || '').trim();
      const email = String(fields.email || '').trim();
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name || !validEmail) {
        send(res, 200, layout(pubRender.contactPage(cms.read().settings, false, 'Please enter your name and a valid email.'), {
          title: `Contact · ${cms.read().settings.company_name}`,
          headerClass: 'is-solid',
          path: '/contact-us',
        }));
        return;
      }
      const leadDir = path.join(ROOT, 'storage', 'app', 'website');
      fs.mkdirSync(leadDir, { recursive: true });
      const leads = path.join(leadDir, 'leads.json');
      const existing = fs.existsSync(leads) ? JSON.parse(fs.readFileSync(leads, 'utf8')) : [];
      existing.push({
        name: name.slice(0, 120),
        email: email.slice(0, 180),
        business: String(fields.business || '').slice(0, 180),
        mobile: String(fields.mobile || '').slice(0, 60),
        at: new Date().toISOString(),
      });
      fs.writeFileSync(leads, JSON.stringify(existing, null, 2));
      send(res, 200, layout(pubRender.contactPage(cms.read().settings, true), {
        title: `Contact · ${cms.read().settings.company_name}`,
        headerClass: 'is-solid',
        path: '/contact-us',
      }));
      return;
    }
    const result = publicRoute(urlPath);
    if (!result) {
      send(res, 404, layout('<section class="page-hero"><div class="container"><h1>Page not found</h1><p><a class="ghost-link" href="/home">Back home</a></p></div></section>', { title: 'Not found', headerClass: 'is-solid' }));
      return;
    }
    if (result.location) {
      redirect(res, result.location);
      return;
    }
    if (result.raw) {
      send(res, 200, result.raw, result.type);
      return;
    }
    if (!result.html) {
      send(res, 404, layout('<section class="page-hero"><div class="container"><h1>Page not found</h1><p>This project is not published.</p></div></section>', { title: 'Not found', headerClass: 'is-solid' }));
      return;
    }
    send(res, 200, result.html);
  } catch (err) {
    console.error(err);
    send(res, 500, 'Server error', 'text/plain');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`KITE site + Studio CMS on http://0.0.0.0:${PORT}`);
});
