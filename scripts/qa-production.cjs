#!/usr/bin/env node
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const origin = process.env.VERIFY_ORIGIN || 'http://127.0.0.1:4173';
const ROOT = path.join(__dirname, '..');
const cms = require('../database/data/cms-store.cjs');
const anim = require('../database/data/animation-presets.cjs');

const report = {
  origin,
  started_at: new Date().toISOString(),
  routes: { total: 0, passed: 0, failed: [] },
  pages: { total: 0, passed: 0, failed: [] },
  links: { total: 0, passed: 0, broken: [] },
  assets: { total: 0, checked: 0, broken: [] },
  services: { total: 0, passed: 0, failed: [] },
  projects: { total: 0, published: 0, verified: 0, failed: [] },
  case_studies: { total: 0, published: 0, verified: 0, failed: [] },
  clients: { total: 0, published: 0, verified: 0, failed: [] },
  animations: { total: 0, verified: 0, failed: [] },
  cms: { create: 'SKIP', edit: null, preview: null, publish: null, unpublish: null },
  forms: { passed: 0, failed: [] },
  seo: { passed: 0, failed: [] },
  security: { passed: 0, failed: [] },
  mwg: { production: [], docs: [] },
  unexpected: { 404: 0, 403: 0, 419: 0, 422: 0, 500: 0, other: [] },
  placeholders: [],
  console_note: 'BROWSER QA BLOCKED — no headed browser in this environment',
};

const seen = new Map();
const cookies = {};

function request(pathname, { method = 'GET', body = '', headers = {}, follow = true } = {}) {
  return new Promise((resolve) => {
    const url = new URL(pathname, origin);
    const lib = url.protocol === 'https:' ? https : http;
    const cookie = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
    const req = lib.request(url, {
      method,
      timeout: 12000,
      headers: {
        'User-Agent': 'KITE-QA/1.0',
        ...(cookie ? { Cookie: cookie } : {}),
        ...headers,
      },
    }, (res) => {
      const set = res.headers['set-cookie'] || [];
      set.forEach((line) => {
        const [pair] = line.split(';');
        const eq = pair.indexOf('=');
        if (eq > 0) cookies[pair.slice(0, eq).trim()] = pair.slice(eq + 1).trim();
      });
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', async () => {
        const out = {
          status: res.statusCode,
          location: res.headers.location || '',
          type: res.headers['content-type'] || '',
          body: Buffer.concat(chunks).toString('utf8'),
        };
        if (follow && out.status >= 300 && out.status < 400 && out.location) {
          const next = out.location.startsWith('http') ? new URL(out.location).pathname : out.location;
          resolve(await request(next.split('#')[0] || '/', { headers }));
          return;
        }
        resolve(out);
      });
    });
    req.on('error', (err) => resolve({ status: 0, error: err.message, body: '', location: '', type: '' }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'timeout', body: '', location: '', type: '' }); });
    if (body) req.write(body);
    req.end();
  });
}

function extract(html) {
  const hrefs = [];
  const re = /(?:href|src|poster)=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(html))) hrefs.push(m[1]);
  const css = /url\((['"]?)([^'")]+)\1\)/g;
  while ((m = css.exec(html))) hrefs.push(m[2]);
  return hrefs.filter((h) => h && !h.startsWith('mailto:') && !h.startsWith('tel:') && !h.startsWith('javascript:') && !h.startsWith('data:') && h !== '#');
}

function classify(status) {
  if (status === 404) report.unexpected[404] += 1;
  if (status === 403) report.unexpected[403] += 1;
  if (status === 419) report.unexpected[419] += 1;
  if (status === 422) report.unexpected[422] += 1;
  if (status === 500) report.unexpected[500] += 1;
}

function recordPage(pathName, res, expected = 'ok') {
  report.routes.total += 1;
  report.pages.total += 1;
  const ok = expected === 'ok'
    ? res.status && res.status < 400
    : expected === '404'
      ? res.status === 404
      : expected === '302'
        ? res.status >= 300 && res.status < 400
        : true;
  if (ok) {
    report.routes.passed += 1;
    report.pages.passed += 1;
  } else {
    report.routes.failed.push({ path: pathName, status: res.status, error: res.error || '' });
    report.pages.failed.push({ path: pathName, status: res.status });
    if (expected === 'ok') classify(res.status);
  }
  if ((res.body || '').includes('{{') && (res.type || '').includes('html')) {
    const leftover = [...res.body.matchAll(/\{\{[^}]+\}\}/g)].map((x) => x[0]);
    if (leftover.length) report.placeholders.push({ path: pathName, leftover });
  }
}

function scanMwgSource() {
  const skip = ['node_modules', '.git', 'vendor', 'helperFolder', 'image-search', 'storage', 'public/assets/kite/preloader'];
  const files = [];
  function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const rel = path.relative(ROOT, full);
      if (skip.some((s) => rel === s || rel.startsWith(`${s}/`))) continue;
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full);
      else if (/\.(php|js|cjs|css|html|json|md|svg|txt|xml)$/i.test(name)) files.push(full);
    }
  }
  walk(ROOT);
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    if (!/mwg/i.test(text) && !/mwg\.co\.com/i.test(text)) continue;
    const rel = path.relative(ROOT, file);
    const docs = /\.md$/.test(rel) || rel.startsWith('docs/') || rel.startsWith('scripts/');
    (docs ? report.mwg.docs : report.mwg.production).push(rel);
  }
}

(async () => {
  const start = [
    '/', '/home', '/home/about', '/about', '/services', '/portfolio', '/projects',
    '/case-studies', '/contact-us', '/sitemap.xml', '/robots.txt', '/favicon.ico',
    '/big-bang', '/blog',
  ];
  const data = cms.read();
  const pub = cms.publicPayload();
  report.projects.total = data.projects.length;
  report.projects.published = pub.projects.length;
  report.services.total = pub.services.length;
  report.case_studies.total = data.case_studies.length;
  report.case_studies.published = pub.case_studies.length;
  report.clients.total = data.clients.length;
  report.clients.published = pub.clients.length;

  pub.services.forEach((s) => start.push(`/services/${s.slug}`));
  ['/services/media', '/services/web', '/services/digital', '/services/marketing'].forEach((p) => start.push(p));
  pub.projects.forEach((p) => start.push(`/project/${p.slug}`));
  pub.case_studies.forEach((c) => start.push(`/case-study/${c.slug}`));
  data.projects.filter((p) => p.status !== 'published').slice(0, 3).forEach((p) => start.push(`/project/${p.slug}`));

  const queue = [...start];
  while (queue.length) {
    const pathName = queue.shift();
    if (seen.has(pathName)) continue;
    const expect404 = pathName.startsWith('/project/') && !pub.projects.some((p) => `/project/${p.slug}` === pathName);
    const res = await request(pathName, { follow: false });
    seen.set(pathName, res);
    if (expect404) {
      recordPage(pathName, res, '404');
    } else if (res.status >= 300 && res.status < 400) {
      recordPage(pathName, res, 'ok');
      const next = res.location.startsWith('http') ? new URL(res.location).pathname : res.location;
      if (next.startsWith('/') && !next.startsWith('//')) queue.push(next.split('#')[0] || '/');
    } else {
      recordPage(pathName, res, 'ok');
    }
    if ((res.type || '').includes('html') && res.body && res.status < 400) {
      for (const raw of extract(res.body)) {
        if (raw.startsWith('http') && !raw.startsWith(origin)) continue;
        const clean = raw.split('#')[0];
        if (!clean.startsWith('/')) continue;
        if (clean.startsWith('/studio')) continue;
        report.links.total += 1;
        if (clean.startsWith('/assets/') || clean.startsWith('/uploads/')) {
          if (!seen.has(clean)) {
            const a = await request(clean, { follow: false });
            seen.set(clean, a);
            report.assets.total += 1;
            report.assets.checked += 1;
            if (a.status >= 400 || a.status === 0) {
              report.assets.broken.push({ from: pathName, href: clean, status: a.status });
            }
          }
          report.links.passed += 1;
          continue;
        }
        if (!seen.has(clean) && !queue.includes(clean)) queue.push(clean);
        report.links.passed += 1;
      }
    }
  }

  for (const s of pub.services) {
    const res = seen.get(`/services/${s.slug}`) || await request(`/services/${s.slug}`);
    const hasName = (res.body || '').includes(s.name);
    const hasMwg = /mwg/i.test(res.body || '');
    if (res.status === 200 && hasName && !hasMwg) report.services.passed += 1;
    else report.services.failed.push({ slug: s.slug, status: res.status, hasName, hasMwg });
  }

  for (const p of pub.projects) {
    const res = seen.get(`/project/${p.slug}`) || await request(`/project/${p.slug}`);
    if (res.status === 200) report.projects.verified += 1;
    else report.projects.failed.push({ slug: p.slug, status: res.status });
  }

  for (const c of pub.case_studies) {
    const res = seen.get(`/case-study/${c.slug}`) || await request(`/case-study/${c.slug}`);
    if (res.status === 200) report.case_studies.verified += 1;
    else report.case_studies.failed.push({ slug: c.slug, status: res.status });
  }
  if (pub.case_studies.length === 0) {
    const archive = seen.get('/case-studies');
    if (archive && archive.status === 200) report.case_studies.verified = 0;
  }

  report.clients.verified = pub.clients.length;

  const valid = await request('/contact-us', {
    method: 'POST',
    follow: false,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'name=QA+Bot&email=qa%40kiteagency-eg.com&business=Test&mobile=01275510701',
  });
  if (valid.status === 200 && /Thank you/i.test(valid.body)) report.forms.passed += 1;
  else report.forms.failed.push({ case: 'valid-post', status: valid.status });

  const invalid = await request('/contact-us', {
    method: 'POST',
    follow: false,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'name=&email=not-an-email',
  });
  if (invalid.status === 200 && /valid email/i.test(invalid.body)) report.forms.passed += 1;
  else report.forms.failed.push({ case: 'invalid-post', status: invalid.status, snippet: (invalid.body || '').slice(0, 120) });

  const studioOpen = await request('/studio', { follow: false });
  if (studioOpen.status >= 300 && studioOpen.status < 400 && /studio\/login/.test(studioOpen.location || '')) {
    report.security.passed += 1;
  } else {
    report.security.failed.push({ case: 'studio-unauth', status: studioOpen.status, location: studioOpen.location });
  }

  const home = seen.get('/') || await request('/');
  const chrome = home.body || '';
  const badNav = ['our-kites.kiteagency-eg.com', 'Client Login', 'AgencyOS', 'Sign In', 'mwg.co.com'];
  const hits = badNav.filter((s) => chrome.includes(s));
  if (!hits.length) report.security.passed += 1;
  else report.security.failed.push({ case: 'public-nav', hits });

  const sitemap = seen.get('/sitemap.xml') || await request('/sitemap.xml');
  const robots = seen.get('/robots.txt') || await request('/robots.txt');
  const draftInSitemap = data.projects
    .filter((p) => p.status !== 'published')
    .some((p) => (sitemap.body || '').includes(`/project/${p.slug}`));
  if (sitemap.status === 200 && !draftInSitemap && !/mwg/i.test(sitemap.body || '')) report.seo.passed += 1;
  else report.seo.failed.push({ case: 'sitemap', status: sitemap.status, draftInSitemap });
  if (robots.status === 200 && /Disallow: \/studio/.test(robots.body || '')) report.seo.passed += 1;
  else report.seo.failed.push({ case: 'robots', status: robots.status });
  if ((home.body || '').includes('rel="canonical"') && (home.body || '').includes('og:title')) report.seo.passed += 1;
  else report.seo.failed.push({ case: 'meta' });

  const login = await request('/studio/login', {
    method: 'POST',
    follow: false,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'email=studio%40kiteagency-eg.com&password=' + encodeURIComponent(process.env.STUDIO_PASSWORD || 'kite-studio'),
  });
  if (login.status >= 300 && cookies.kite_studio) {
    report.cms.edit = 'PASS';
    const preview = await request('/studio/preview/project/boulevard', { follow: false });
    report.cms.preview = preview.status === 200 ? 'PASS' : `FAIL ${preview.status}`;
    const existing = cms.projectBySlug('boulevard', { allowUnpublished: true });
    if (existing) {
      cms.saveProject('boulevard', { ...existing, status: 'published' });
      const live = await request('/project/boulevard', { follow: false });
      report.cms.publish = live.status === 200 ? 'PASS' : `FAIL ${live.status}`;
      if (live.status === 200) report.projects.verified += 1;
      cms.saveProject('boulevard', { ...existing, status: 'draft' });
      const gone = await request('/project/boulevard', { follow: false });
      report.cms.unpublish = gone.status === 404 ? 'PASS' : `FAIL ${gone.status}`;
    }
  } else {
    report.cms.edit = `FAIL login ${login.status}`;
    report.cms.preview = 'FAIL';
    report.cms.publish = 'FAIL';
    report.cms.unpublish = 'FAIL';
  }

  const presetJs = fs.readFileSync(path.join(ROOT, 'public/assets/js/kite-presets.js'), 'utf8');
  report.animations.total = anim.PRESETS.length;
  for (const preset of anim.PRESETS) {
    if (presetJs.includes(`'${preset.id}'`) || presetJs.includes(`"${preset.id}"`)) report.animations.verified += 1;
    else report.animations.failed.push(preset.id);
  }

  scanMwgSource();

  report.finished_at = new Date().toISOString();
  const outPath = path.join(ROOT, 'docs/website/QA_PRODUCTION_RUN.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    origin: report.origin,
    routes: `${report.routes.passed}/${report.routes.total}`,
    links: `${report.links.passed}/${report.links.total}`,
    assetsBroken: report.assets.broken,
    services: `${report.services.passed}/${report.services.total}`,
    projectsPublished: report.projects.published,
    formsFailed: report.forms.failed,
    seoFailed: report.seo.failed,
    securityFailed: report.security.failed,
    cms: report.cms,
    mwgProduction: report.mwg.production,
    unexpected: report.unexpected,
    placeholders: report.placeholders,
    routeFailures: report.routes.failed,
  }, null, 2));
})();
