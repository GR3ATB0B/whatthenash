/* js/panels/contact.js — the pager expands into a compose form.
   Validation runs here for instant feedback, but the Worker re-checks
   everything; the Turnstile token is only verified server-side. */

import { CONFIG } from '../../data/config.js';
import { COPY } from '../../data/copy.js';
import { validate, BUDGETS } from '../../worker/src/validate.js';
import * as store from '../state.js';
import { prefersReducedMotion } from '../../shared.js';

const panel = document.querySelector('.panel[data-panel="contact"]');
const form = panel?.querySelector('.pager-form');
const status = panel?.querySelector('.form-status');
let token = '', widget = null, built = false;

function loadTurnstile() {
  return new Promise((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = () => resolve(window.turnstile);
    s.onerror = reject;
    document.head.append(s);
  });
}

function build() {
  const budgets = panel.querySelector('.budget-pills');
  budgets.innerHTML = BUDGETS.map((b, i) => `
    <label class="budget-pill"><input type="radio" name="budget" value="${b}" ${i === 0 ? 'checked' : ''}><span>${b}</span></label>`).join('');
  const msg = form.elements.message;
  if (!msg.value) msg.value = COPY.contact.prefill.startsWith('TODO') ? '' : COPY.contact.prefill;
  msg.placeholder = COPY.contact.prefill;

  loadTurnstile().then(ts => {
    widget = ts.render(panel.querySelector('.ts-box'), {
      sitekey: CONFIG.turnstileSiteKey,
      theme: 'light',
      callback: t => { token = t; },
      'expired-callback': () => { token = ''; },
      'error-callback': () => { token = ''; },
    });
  }).catch(() => say('Couldn’t load the spam check. Email works too: see the notebook.', true));
}

function say(text, bad = false) {
  status.textContent = text;
  status.classList.toggle('is-bad', bad);
}

function showErrors(errors) {
  ['name', 'email', 'budget', 'message'].forEach(k => {
    const field = form.querySelector(`[data-field="${k}"]`);
    const err = field?.querySelector('.field-err');
    const input = form.elements[k];
    if (!field) return;
    err.textContent = errors[k] || '';
    if (input?.setAttribute) input.setAttribute('aria-invalid', errors[k] ? 'true' : 'false');
  });
}

async function submit(e) {
  e.preventDefault();
  const fd = Object.fromEntries(new FormData(form));
  const { ok, errors } = validate(fd);
  showErrors(errors);
  if (!ok) {
    form.querySelector('[aria-invalid="true"]')?.focus();
    return say('A couple of things to fix.', true);
  }
  if (!token) return say('Hang on, the spam check is still thinking.', true);

  const btn = form.querySelector('.send');
  btn.disabled = true;
  say('Sending…');
  try {
    const r = await fetch(CONFIG.contactEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...fd, token }),
    });
    const body = await r.json().catch(() => ({}));
    if (r.ok && body.ok) {
      panel.classList.add('is-sent');
      form.reset();
      say('Sent! I’ll write back soon.');
    } else if (body.fields) {
      showErrors(body.fields);
      say('A couple of things to fix.', true);
    } else {
      say(body.error === 'slow_down' ? 'Easy there. Try again in a minute.' : 'That didn’t go through. Try again?', true);
    }
  } catch {
    say('That didn’t go through. Try again?', true);
  } finally {
    btn.disabled = false;
    token = '';
    if (widget !== null) window.turnstile?.reset(widget);
  }
}

if (panel) {
  form.addEventListener('submit', submit);
  store.subscribe((s, prev) => {
    if (s.panel === 'contact' && prev.panel !== 'contact') {
      if (!built) { built = true; build(); }
      panel.classList.remove('is-open', 'is-sent');
      // let the pager sit for a beat, then the screen grows into the form
      setTimeout(() => panel.classList.add('is-open'), prefersReducedMotion ? 0 : 260);
    }
  });
  if (store.get().panel === 'contact') { built = true; build(); panel.classList.add('is-open'); }
}
