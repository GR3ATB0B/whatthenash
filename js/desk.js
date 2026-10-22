/* js/desk.js — lay out the desk objects and reveal them one at a time as
   they load (driven by the loader). */

import { DESK } from '../data/desk.js';
import { hwUrls } from './hw.js';
import { prefersReducedMotion } from '../shared.js';

const desk = document.getElementById('desk-objects');
const REVEAL_GAP_MS = 110;

let queue = [], timer = 0, lastReveal = 0;

function reveal(el) {
  queue.push(el);
  if (!timer) pump();
}
function pump() {
  timer = 0;
  if (!queue.length) return;
  const wait = Math.max(0, lastReveal + REVEAL_GAP_MS - performance.now());
  timer = setTimeout(() => {
    timer = 0;
    const el = queue.shift();
    el.classList.add('is-in');
    lastReveal = performance.now();
    pump();
  }, prefersReducedMotion ? 0 : wait);
}

function track(url, onDone) {
  window.__loader?.expect(1);
  const img = new Image();
  img.decoding = 'async';
  const fin = () => { window.__loader?.tick(); onDone?.(img); };
  img.onload = fin; img.onerror = fin;
  img.src = url;
}

export function buildDesk() {
  if (!desk) return;
  DESK.forEach(o => {
    const el = document.createElement(o.opens ? 'button' : 'div');
    el.className = 'desk-obj' + (o.todo ? ' is-todo' : '') + (o.inert ? ' is-inert' : '');
    el.dataset.id = o.id;
    el.style.cssText = `--x:${o.x}%;--y:${o.y}%;--w:${o.w}%;--rot:${o.rot}deg;--z:${o.z}`;
    if (o.opens) {
      el.type = 'button';
      el.dataset.opens = o.opens;
      el.setAttribute('aria-label', `Open ${o.opens}`);
    } else {
      el.setAttribute('aria-hidden', 'true');
    }
    const img = document.createElement('img');
    img.alt = '';
    img.draggable = false;
    el.append(img);
    desk.append(el);
    track(o.src, () => { img.src = o.src; reveal(el); });
  });

  // the face + hello reveal too
  document.querySelectorAll('[data-reveal]').forEach(el => {
    const url = el.matches('[data-face]') ? '/img/face/face-sheet.webp' : null;
    if (url) track(url, () => reveal(el)); else reveal(el);
  });

  // lettering files count toward the loader as well
  hwUrls().forEach(u => track(u));

  // fail-open: anything still hidden when the loader finishes just shows up
  window.addEventListener('loader:done', () => {
    document.querySelectorAll('.desk-obj:not(.is-in), [data-reveal]:not(.is-in)').forEach(reveal);
  }, { once: true });
}
