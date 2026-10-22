# whatthenash contact worker

`POST /contact` — validates, verifies Turnstile, emails Nash via Resend.

**Local:** `node tools/dev-worker.mjs` (from the repo root) runs the same handler on
http://localhost:8787 using Cloudflare's public Turnstile *test* keys, and logs the email
instead of sending it. The page uses it automatically on localhost.

**Deploy (needs Nash's Cloudflare account):**
1. Turnstile → add site `whatthenash.com` → copy the site key into `data/config.js`.
2. `cd worker && npx wrangler secret put TURNSTILE_SECRET` (and `RESEND_API_KEY`, `CONTACT_TO`).
3. Verify the sending domain in Resend, set `CONTACT_FROM` in `wrangler.toml`.
4. Point `api.whatthenash.com` at the worker (route in `wrangler.toml`), `npx wrangler deploy`.
