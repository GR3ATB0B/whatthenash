/* js/menu.js — slide-in drawer, Menu/Close button, Back arrow, multimeter needle. */

import * as store from './state.js';
import { attachRough } from './rough.js';
import { prefersReducedMotion } from '../shared.js';
import { needleAngle } from './meter.js';

const btn = document.getElementById('menu-btn');
const drawer = document.getElementById('drawer');
const scrim = document.getElementById('scrim');
const back = document.getElementById('back-btn');
const needle = document.querySelector('.meter-needle');
const meter = document.querySelector('.meter');

let lastFocus = null;
let openedAt = 0;
const desk = document.getElementById('desk');

function focusables() {
  return [btn, ...drawer.querySelectorAll('a[href], button:not([disabled])')];
}

function render(s, prev) {
  const open = s.menu;
  btn.setAttribute('aria-expanded', String(open));
  btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  drawer.classList.toggle('is-open', open);
  drawer.inert = !open;
  scrim.classList.toggle('is-open', open);
  document.documentElement.classList.toggle('menu-open', open);

  back.hidden = !s.panel;
  if (desk) desk.inert = open || !!s.panel;
  document.querySelectorAll('.panel').forEach(p => {
    const on = p.dataset.panel === s.panel;
    p.hidden = !on;
    if (on && s.panel !== prev.panel) requestAnimationFrame(() => p.querySelector('[data-autofocus], h2')?.focus());
  });

  if (open && !prev.menu) {
    openedAt = performance.now();
    lastFocus = document.activeElement;
    requestAnimationFrame(() => drawer.querySelector('.pill')?.focus());
  }
  if (!open && prev.menu && drawer.contains(document.activeElement)) btn.focus();
  if (!s.panel && prev.panel) (lastFocus && document.contains(lastFocus) ? lastFocus : btn).focus();
}

btn.addEventListener('click', () => store.set({ menu: !store.get().menu }));
scrim.addEventListener('click', () => store.set({ menu: false }));
back.addEventListener('click', () => store.set({ panel: null, page: null }));

drawer.addEventListener('click', e => {
  const a = e.target.closest('a[data-panel]');
  if (!a) return;
  e.preventDefault();
  // the Enter that opened the drawer can land on the first pill once focus moves there
  if (e.detail === 0 && performance.now() - openedAt < 300) return;
  lastFocus = btn;
  store.set({ menu: false, panel: a.dataset.panel, page: a.dataset.page || null });
});

document.addEventListener('keydown', e => {
  const s = store.get();
  if (e.key === 'Escape') {
    if (s.menu) store.set({ menu: false });
    else if (s.panel) store.set({ panel: null, page: null });
  }
  if (e.key === 'Tab' && s.menu) {
    const f = focusables(), i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
  }
});

/* ---- rough outlines ---- */
document.querySelectorAll('[data-rough]').forEach(el =>
  attachRough(el, { radius: Number(el.dataset.rough) || 999 }));

/* ---- multimeter needle follows the cursor (or keyboard focus) ---- */
(function initNeedle() {
  if (!needle || !meter) return;
  let cur = 0, target = -40, raf = 0;
  const pivot = () => {
    const r = meter.getBoundingClientRect();
    return [r.left + r.width * 0.5, r.top + r.height * 0.436];
  };
  const aim = (x, y) => {
    const [cx, cy] = pivot();
    target = needleAngle(x, y, cx, cy);
    if (prefersReducedMotion) { cur = target; needle.style.setProperty('--deg', `${cur}deg`); return; }
    if (!raf) raf = requestAnimationFrame(tick);
  };
  function tick() {
    raf = 0;
    cur += (target - cur) * 0.18;
    // a touch of needle wobble, like a real analog movement settling
    needle.style.setProperty('--deg', `${cur.toFixed(2)}deg`);
    if (Math.abs(target - cur) > 0.05) raf = requestAnimationFrame(tick);
  }
  window.addEventListener('pointermove', e => {
    if (store.get().menu) aim(e.clientX, e.clientY);
  }, { passive: true });
  drawer.addEventListener('focusin', e => {
    const r = e.target.getBoundingClientRect();
    aim(r.left + r.width / 2, r.top + r.height / 2);
  });
  needle.style.setProperty('--deg', `${target}deg`);
})();

store.subscribe(render);
render(store.get(), { menu: false, panel: null });
