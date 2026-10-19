import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../public');
const port = Number(process.env.PORT || 3000);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/api/health') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, app: 'Clipper AI', mode: 'MVP', processing: 'browser-local' }));
    return;
  }
  if (url.pathname === '/api/source-check' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 10000) req.destroy(); });
    req.on('end', () => {
      try {
        const { url: source } = JSON.parse(body || '{}');
        const parsed = new URL(source);
        const valid = parsed.protocol === 'https:' && (parsed.hostname === 'youtube.com' || parsed.hostname.endsWith('.youtube.com') || parsed.hostname === 'youtu.be' || parsed.hostname === 'www.youtube.com');
        res.writeHead(valid ? 200 : 400, { 'content-type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(valid ? { ok: true, message: 'Tautan dikenali. MVP ini tidak mengunduh video dari YouTube; unggah file video yang kamu miliki izin untuk edit.' } : { ok: false, message: 'Masukkan tautan YouTube HTTPS yang valid.' }));
      } catch {
        res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, message: 'Tautan tidak valid.' }));
      }
    });
    return;
  }
  const requested = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
  const file = path.resolve(root, `.${requested}`);
  if (!file.startsWith(root + path.sep) && file !== path.join(root, 'index.html')) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  try {
    const content = await readFile(file);
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'x-content-type-options': 'nosniff' });
    res.end(content);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); res.end('Not found');
  }
});
server.listen(port, '0.0.0.0', () => console.log(`Clipper AI running at http://localhost:${port}`));
