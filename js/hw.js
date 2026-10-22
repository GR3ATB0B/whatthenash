/* js/hw.js — hydrate handwritten pieces.
   <span class="hw" data-hw="menu">        → /img/lettering/menu-a.svg (+ -b → line boil)
   <span class="hw" data-hw-src="/x.svg" data-ar="80/110">  → any single drawing */

import { LETTERING } from './lettering.js';

const BASE = '/img/lettering/';

export function applyHw(el) {
  if (el.dataset.hwSrc) {
    el.style.setProperty('--a', `url(${el.dataset.hwSrc})`);
    el.style.setProperty('--b', `url(${el.dataset.hwSrc})`);
    if (el.dataset.ar) el.style.setProperty('--ar', el.dataset.ar);
    if (!el.classList.contains('static')) el.classList.add('jitter');
    return;
  }
  const name = el.dataset.hw;
  const a = LETTERING[`${name}-a`] ? `${name}-a` : (LETTERING[name] ? name : null);
  if (!a) { console.warn('[hw] missing lettering:', name); return; }
  const b = LETTERING[`${name}-b`] ? `${name}-b` : null;
  const [w, h] = LETTERING[a];
  el.style.setProperty('--ar', `${w} / ${h}`);
  el.style.setProperty('--a', `url(${BASE}${a}.svg)`);
  el.style.setProperty('--b', `url(${BASE}${b || a}.svg)`);
  if (el.classList.contains('static')) return;
  el.classList.add(b ? 'boil' : 'jitter');
}

export function hydrateHw(root = document) {
  root.querySelectorAll('.hw[data-hw], .hw[data-hw-src]').forEach(applyHw);
}

/* every lettering file a page uses, for the loader to count */
export function hwUrls(root = document) {
  const urls = new Set();
  root.querySelectorAll('.hw[data-hw]').forEach(el => {
    const n = el.dataset.hw;
    ['-a', '-b', ''].forEach(s => { if (LETTERING[n + s]) urls.add(`${BASE}${n}${s}.svg`); });
  });
  root.querySelectorAll('.hw[data-hw-src]').forEach(el => urls.add(el.dataset.hwSrc));
  return [...urls];
}
