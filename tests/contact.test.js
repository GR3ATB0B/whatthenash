// tests/contact.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate, BUDGETS } from '../worker/src/validate.js';
import { handle } from '../worker/src/index.js';

const good = { name: 'Ada', email: 'ada@example.com', budget: BUDGETS[0], message: 'Hello there, nice desk.', token: 'tok' };
const env = { ALLOWED_ORIGINS: 'https://whatthenash.com', TURNSTILE_SECRET: 's3cret', RESEND_API_KEY: 'rk_test', CONTACT_TO: 'me@x.com', CONTACT_FROM: 'site <c@x.com>' };
const req = (body, origin = 'https://whatthenash.com', method = 'POST') => new Request('https://api.whatthenash.com/contact', {
  method, headers: { Origin: origin, 'Content-Type': 'application/json', 'CF-Connecting-IP': '1.2.3.4' },
  body: method === 'POST' ? JSON.stringify(body) : undefined,
});
function fakeFetch({ turnstile = true, resend = true } = {}) {
  const calls = [];
  const f = async (url, init) => {
    calls.push({ url, init });
    if (url.includes('siteverify')) return new Response(JSON.stringify({ success: turnstile }));
    return new Response('{}', { status: resend ? 200 : 500 });
  };
  f.calls = calls;
  return f;
}

test('validate accepts a normal message', () => {
  assert.equal(validate(good).ok, true);
});
test('validate rejects missing/oversized/bad fields', () => {
  const r = validate({ name: '', email: 'nope', budget: 'a million', message: 'hi' });
  assert.deepEqual(Object.keys(r.errors).sort(), ['budget', 'email', 'message', 'name']);
  assert.ok(validate({ ...good, message: 'x'.repeat(5000) }).errors.message);
});
test('validate trims and ignores non-strings', () => {
  const r = validate({ ...good, name: '  Ada  ', email: 42 });
  assert.equal(r.data.name, 'Ada');
  assert.ok(r.errors.email);
});

test('rejects unknown origins', async () => {
  const r = await handle(req(good, 'https://evil.example'), env, { fetch: fakeFetch() });
  assert.equal(r.status, 403);
});
test('answers CORS preflight for the real site', async () => {
  const r = await handle(req(null, 'https://whatthenash.com', 'OPTIONS'), env, { fetch: fakeFetch() });
  assert.equal(r.status, 204);
  assert.equal(r.headers.get('Access-Control-Allow-Origin'), 'https://whatthenash.com');
});
test('400 with field errors on bad input, before calling Turnstile', async () => {
  const f = fakeFetch();
  const r = await handle(req({ ...good, email: 'bad' }), env, { fetch: f });
  assert.equal(r.status, 400);
  assert.ok((await r.json()).fields.email);
  assert.equal(f.calls.length, 0);
});
test('honeypot gets a fake success and sends nothing', async () => {
  const f = fakeFetch();
  const r = await handle(req({ ...good, website: 'spam.biz' }), env, { fetch: f });
  assert.equal(r.status, 200);
  assert.equal(f.calls.length, 0);
});
test('403 when Turnstile says no', async () => {
  const r = await handle(req(good), env, { fetch: fakeFetch({ turnstile: false }) });
  assert.equal(r.status, 403);
});
test('verifies the token server-side with the secret, then emails', async () => {
  const f = fakeFetch();
  const r = await handle(req(good), env, { fetch: f });
  assert.equal(r.status, 200);
  assert.equal(f.calls[0].init.body.get('secret'), 's3cret');
  assert.equal(f.calls[0].init.body.get('response'), 'tok');
  const mail = JSON.parse(f.calls[1].init.body);
  assert.deepEqual(mail.to, ['me@x.com']);
  assert.equal(mail.reply_to, 'ada@example.com');
});
test('502 when the email provider fails', async () => {
  const r = await handle(req(good), env, { fetch: fakeFetch({ resend: false }) });
  assert.equal(r.status, 502);
});
test('429 when rate limited', async () => {
  const r = await handle(req(good), { ...env, CONTACT_LIMIT: { limit: async () => ({ success: false }) } }, { fetch: fakeFetch() });
  assert.equal(r.status, 429);
});
test('responses never echo secrets', async () => {
  for (const f of [fakeFetch(), fakeFetch({ turnstile: false }), fakeFetch({ resend: false })]) {
    const text = await (await handle(req(good), env, { fetch: f })).text();
    assert.ok(!text.includes('s3cret') && !text.includes('rk_test'));
  }
});
