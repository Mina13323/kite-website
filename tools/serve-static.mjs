#!/usr/bin/env node
/** Tiny static server for the generated ./static site (clean URLs + 404). */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'static');
const PORT = Number(process.env.PORT || 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
};

const send = (res, code, body, type) => {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
  res.end(body);
};

http
  .createServer((req, res) => {
    let p = decodeURIComponent((req.url || '/').split('?')[0]);
    if (p.includes('..')) return send(res, 400, 'Bad request', 'text/plain');

    const candidates = [
      path.join(ROOT, p),
      path.join(ROOT, p, 'index.html'),
      path.join(ROOT, p + '.html'),
    ];
    for (const file of candidates) {
      if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        const ext = path.extname(file).toLowerCase();
        return send(res, 200, fs.readFileSync(file), TYPES[ext] || 'application/octet-stream');
      }
    }
    const nf = path.join(ROOT, '404.html');
    return send(res, 404, fs.existsSync(nf) ? fs.readFileSync(nf) : 'Not found', 'text/html; charset=utf-8');
  })
  .listen(PORT, '0.0.0.0', () => console.log(`MWG clone running at http://0.0.0.0:${PORT}`));
