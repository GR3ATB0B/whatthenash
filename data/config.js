// data/config.js — public settings only. Never put secrets here.
const local = ['localhost', '127.0.0.1'].includes(location.hostname);

export const CONFIG = {
  contactEndpoint: local
    ? 'http://localhost:8787/contact'
    : 'https://api.whatthenash.com/contact',            // TODO: live once the worker is deployed
  turnstileSiteKey: local
    ? '1x00000000000000000000AA'                         // Cloudflare's public always-pass test key
    : 'TODO_TURNSTILE_SITE_KEY',                         // public site key from the Turnstile dashboard
};
