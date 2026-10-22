/* js/face.js — 2D "turntable" of Nash's face.
   36 pre-rendered frames (yaw -70°..+70°) in a 6×6 WebP sheet.
   Any element with [data-face] turns to follow the cursor. */

import { prefersReducedMotion } from '../shared.js';

const SHEET = '/img/face/face-sheet.webp';
const COLS = 6, ROWS = 6, FRAMES = COLS * ROWS;
const FRONT = 17;   // ≈ 0° yaw
const EASE = 0.15;  // per-frame lerp toward target

/* which of the 36 frames an element is showing right now */
export const faceFrame = el => Math.round(el._face?.cur ?? FRONT);
export const FACE_SHEET = { src: SHEET, cols: COLS, rows: ROWS };

export function frameForPointer(px, cx, halfWidth) {
  const t = Math.max(-1, Math.min(1, (px - cx) / halfWidth));
  return Math.round(((t + 1) / 2) * (FRAMES - 1));
}

function setFrame(el, i) {
  const col = i % COLS, row = Math.floor(i / COLS);
  el.style.backgroundPosition =
    `${(col / (COLS - 1)) * 100}% ${(row / (ROWS - 1)) * 100}%`;
}

(function initFaces() {
  const faces = [...document.querySelectorAll('[data-face]')];
  if (!faces.length) return;

  faces.forEach(el => {
    el.style.backgroundImage = `url(${SHEET})`;
    el.style.backgroundSize = `${COLS * 100}% ${ROWS * 100}%`;
    el.style.backgroundRepeat = 'no-repeat';
    el.setAttribute('role', 'img');
    if (!el.hasAttribute('aria-label') && !el.hasAttribute('aria-hidden')) {
      el.setAttribute('aria-label', 'Nash’s face');
    }
    el._face = { cur: FRONT, target: FRONT };
    setFrame(el, FRONT);
  });

  if (prefersReducedMotion) return;

  let pointerX = null, raf = 0;

  function tick() {
    raf = 0;
    let moving = false;
    faces.forEach(el => {
      const r = el.getBoundingClientRect();
      const s = el._face;
      s.target = frameForPointer(pointerX, r.left + r.width / 2, window.innerWidth / 2);
      s.cur += (s.target - s.cur) * EASE;
      if (Math.abs(s.target - s.cur) < 0.05) s.cur = s.target;
      else moving = true;
      setFrame(el, Math.round(s.cur));
    });
    if (moving) raf = requestAnimationFrame(tick);
  }

  window.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    pointerX = e.clientX;
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });
})();
