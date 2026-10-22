// data/config.js — public settings only. Never put secrets here.
const local = ['localhost', '127.0.0.1'].includes(location.hostname);

export const CONFIG = {
  // Photos stay in the band between "Hey, I'm Nash" and "I love to …" instead of
  // sliding behind the words. Set to false to go back to photos everywhere (with paper scraps behind the words).
  photosClearOfWords: true,

  contactEndpoint: local
    ? 'http://localhost:8787/contact'
    : 'https://api.whatthenash.com/contact',            // TODO: live once the worker is deployed
  turnstileSiteKey: local
    ? '1x00000000000000000000AA'                         // Cloudflare's public always-pass test key
    : 'TODO_TURNSTILE_SITE_KEY',                         // public site key from the Turnstile dashboard
};
