// tools/dev-worker.mjs — run the contact worker locally on :8787 with test keys.
import http from 'node:http';
import { handle } from '../worker/src/index.js';

const env = {
  ALLOWED_ORIGINS: 'http://localhost:8000',
  TURNSTILE_SECRET: '1x0000000000000000000000000000000AA', // Cloudflare's public always-pass test secret
  DEV: '1',
};

http.createServer(async (req, res) => {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const request = new Request(`http://localhost:8787${req.url}`, {
    method: req.method,
    headers: req.headers,
    body: ['GET', 'HEAD', 'OPTIONS'].includes(req.method) ? undefined : Buffer.concat(chunks),
  });
  const response = await handle(request, env);
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(Buffer.from(await response.arrayBuffer()));
}).listen(8787, () => console.log('contact worker (dev) on http://localhost:8787'));
