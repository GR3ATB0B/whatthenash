/* js/desk.js — loader bookkeeping for the desk: count assets in, then
   reveal things one at a time as they arrive. */

import { hwUrls } from './hw.js';
import { prefersReducedMotion } from '../shared.js';

const REVEAL_GAP_MS = 110;
let queue = [], timer = 0, lastReveal = 0;

export function reveal(el) {
  queue.push(el);
  if (!timer) pump();
}
function pump() {
  timer = 0;
  if (!queue.length) return;
  const wait = Math.max(0, lastReveal + REVEAL_GAP_MS - performance.now());
  timer = setTimeout(() => {
    timer = 0;
    queue.shift().classList.add('is-in');
    lastReveal = performance.now();
    pump();
  }, prefersReducedMotion ? 0 : wait);
}

/* tell the loader about one asset; cb runs when it's in (or failed) */
export function track(url, cb) {
  window.__loader?.expect(1);
  const img = new Image();
  img.decoding = 'async';
  const fin = () => { window.__loader?.tick(); cb?.(img); };
  img.onload = fin; img.onerror = fin;
  img.src = url;
}

export function buildDesk() {
  document.querySelectorAll('[data-reveal]').forEach(el => {
    if (el.matches('[data-face]')) track('/img/face/face-sheet.webp', () => reveal(el));
    else reveal(el);
  });
  hwUrls().forEach(u => track(u));
  // fail-open: anything still hidden when the loader finishes just shows up
  window.addEventListener('loader:done', () => {
    document.querySelectorAll('.print:not(.is-in), [data-reveal]:not(.is-in)').forEach(reveal);
  }, { once: true });
}
