/* worker/src/index.js — POST /contact for whatthenash.com.

   1. CORS allow-list (ALLOWED_ORIGINS)
   2. rate limit per IP (CONTACT_LIMIT binding, if configured)
   3. validate fields (validate.js)
   4. verify Cloudflare Turnstile token server-side (TURNSTILE_SECRET)
   5. email it via Resend (RESEND_API_KEY, CONTACT_TO, CONTACT_FROM)

   Secrets are set with `wrangler secret put …` and never reach the browser. */

import { validate } from './validate.js';

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const RESEND = 'https://api.resend.com/emails';
const MAX_BODY = 10_000;

function cors(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!origin || !allowed.includes(origin)) return null;
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

const json = (status, body, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

export async function handle(request, env, { fetch: doFetch = fetch } = {}) {
  const url = new URL(request.url);
  if (url.pathname !== '/contact') return json(404, { ok: false, error: 'not_found' });

  const headers = cors(request.headers.get('Origin'), env);
  if (!headers) return json(403, { ok: false, error: 'origin' });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST') return json(405, { ok: false, error: 'method' }, headers);

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (env.CONTACT_LIMIT) {
    const { success } = await env.CONTACT_LIMIT.limit({ key: ip });
    if (!success) return json(429, { ok: false, error: 'slow_down' }, headers);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY) return json(413, { ok: false, error: 'too_big' }, headers);
  let body;
  try { body = JSON.parse(raw); } catch { return json(400, { ok: false, error: 'bad_json' }, headers); }

  const { ok, errors, data } = validate(body);
  if (errors.website) return json(200, { ok: true }, headers);          // bot: pretend it worked
  if (!ok) return json(400, { ok: false, error: 'invalid', fields: errors }, headers);

  if (!env.TURNSTILE_SECRET) return json(500, { ok: false, error: 'not_configured' }, headers);
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET);
  form.append('response', typeof body.token === 'string' ? body.token : '');
  form.append('remoteip', ip);
  const verdict = await doFetch(SITEVERIFY, { method: 'POST', body: form }).then(r => r.json()).catch(() => ({ success: false }));
  if (!verdict.success) return json(403, { ok: false, error: 'turnstile' }, headers);

  const text = [
    `From: ${data.name} <${data.email}>`,
    `Budget: ${data.budget || '—'}`,
    '',
    data.message,
  ].join('\n');

  if (!env.RESEND_API_KEY) {
    if (env.DEV === '1') { console.log('[dev] would send:\n' + text); return json(200, { ok: true, dev: true }, headers); }
    return json(500, { ok: false, error: 'not_configured' }, headers);
  }
  const sent = await doFetch(RESEND, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: [env.CONTACT_TO],
      reply_to: data.email,
      subject: `whatthenash.com — ${data.name}`,
      text,
    }),
  }).catch(() => null);
  if (!sent || !sent.ok) return json(502, { ok: false, error: 'send_failed' }, headers);

  return json(200, { ok: true }, headers);
}

export default { fetch: (request, env) => handle(request, env) };
