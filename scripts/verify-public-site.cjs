const http = require('http');
const { URL } = require('url');

const origin = process.env.VERIFY_ORIGIN || 'http://127.0.0.1:4173';
const start = ['/', '/home', '/services', '/portfolio', '/projects', '/case-studies', '/contact-us', '/about', '/sitemap.xml', '/robots.txt'];
const seen = new Map();
const brokenAssets = [];
const queue = [...start];

function request(path) {
  return new Promise((resolve) => {
    const url = new URL(path, origin);
    const req = http.get(url, { timeout: 8000 }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({
        status: res.statusCode,
        location: res.headers.location || '',
        body: Buffer.concat(chunks).toString('utf8'),
        type: res.headers['content-type'] || '',
      }));
    });
    req.on('error', (err) => resolve({ status: 0, error: err.message, body: '', location: '' }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'timeout', body: '', location: '' }); });
  });
}

function extract(html, from) {
  const hrefs = [];
  const re = /(?:href|src)=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(html))) hrefs.push(m[1]);
  return hrefs.filter((h) => h && !h.startsWith('mailto:') && !h.startsWith('tel:') && !h.startsWith('javascript:') && h !== '#');
}

(async () => {
  while (queue.length) {
    const path = queue.shift();
    if (seen.has(path)) continue;
    const res = await request(path);
    seen.set(path, res);
    if (res.status >= 300 && res.status < 400 && res.location) {
      const next = res.location.startsWith('http') ? new URL(res.location).pathname + (new URL(res.location).hash || '') : res.location;
      if (next.startsWith('/') && !next.startsWith('//')) queue.push(next.split('#')[0] || '/');
    }
    if ((res.type || '').includes('html') && res.body) {
      for (const raw of extract(res.body, path)) {
        if (raw.startsWith('http') && !raw.startsWith(origin)) continue;
        const clean = raw.split('#')[0];
        if (!clean.startsWith('/')) continue;
        if (clean.startsWith('/studio')) continue;
        if (clean.startsWith('/assets/') || clean.startsWith('/uploads/')) {
          if (!seen.has(clean)) {
            const a = await request(clean);
            seen.set(clean, a);
            if (a.status >= 400 || a.status === 0) brokenAssets.push({ from: path, href: clean, status: a.status });
          }
          continue;
        }
        if (!seen.has(clean) && !queue.includes(clean)) queue.push(clean);
      }
    }
  }

  const pages = [...seen.entries()].filter(([p]) => !p.startsWith('/assets') && !p.startsWith('/uploads'));
  const unexpected = pages.filter(([, r]) => r.status >= 400 || r.status === 0);
  const ok = pages.filter(([, r]) => r.status && r.status < 400);
  console.log(JSON.stringify({
    origin,
    pages: pages.length,
    ok: ok.length,
    unexpected: unexpected.map(([p, r]) => ({ path: p, status: r.status, error: r.error || '' })),
    brokenAssets,
  }, null, 2));
})();
