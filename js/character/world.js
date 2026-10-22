/* js/character/world.js — everything little-me can stand on, rebuilt every frame:
   the shuffling photo prints, the face (its real alpha, per turntable frame),
   and any element marked [data-solid] (paper scraps, cards, the notebook…).
   Only what's on screen counts: the desk when no panel is open, else that panel. */

import { maskFromImageData, makeCollider } from './mask.js';
import { tableState } from '../table.js';
import { faceFrame, FACE_SHEET } from '../face.js';
import * as store from '../state.js';

const colliders = new Map();       // element → collider (kept so `carry` knows where it was)
let solidMask = null;
const faceMasks = new Map();       // frame → mask
let sheetCanvas = null;

function canvasMask(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  draw(g);
  return maskFromImageData(g.getImageData(0, 0, w, h), { cell: 2 });
}

/* prints and cards are opaque rectangles: one shared mask, scaled per collider */
function getSolidMask() {
  return solidMask ??= canvasMask(32, 32, g => { g.fillStyle = '#000'; g.fillRect(0, 0, 32, 32); });
}

function loadSheet() {
  const img = new Image();
  img.onload = () => {
    sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = img.naturalWidth; sheetCanvas.height = img.naturalHeight;
    sheetCanvas.getContext('2d', { willReadFrequently: true }).drawImage(img, 0, 0);
  };
  img.src = FACE_SHEET.src;
}

function faceMask(frame) {
  if (!sheetCanvas) return null;
  if (faceMasks.has(frame)) return faceMasks.get(frame);
  const fw = Math.floor(sheetCanvas.width / FACE_SHEET.cols), fh = Math.floor(sheetCanvas.height / FACE_SHEET.rows);
  const sx = (frame % FACE_SHEET.cols) * fw, sy = Math.floor(frame / FACE_SHEET.cols) * fh;
  const m = maskFromImageData(sheetCanvas.getContext('2d').getImageData(sx, sy, fw, fh), { cell: 3, threshold: 140 });
  faceMasks.set(frame, m);
  return m;
}

function upsert(key, mask, t, live) {
  let c = colliders.get(key);
  if (!c) { c = makeCollider(mask, t); colliders.set(key, c); }
  else { c.mask = mask; c.move(t); }
  live.add(key);
  return c;
}

const rectT = el => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, rot: 0 }; };

export function initWorld() { loadSheet(); }

/* refresh colliders for this frame; returns the active list */
export function refreshWorld() {
  const live = new Set();
  const panel = store.get().panel;
  const scope = panel ? document.querySelector(`.panel[data-panel="${panel}"]`) : document.getElementById('desk');

  if (!panel) {
    for (const p of tableState.prints) {
      if (p.t && p.el.classList.contains('is-in')) upsert(p.el, getSolidMask(), p.t, live);
    }
    const face = document.querySelector('.desk-face.is-in');
    const fm = face && faceMask(faceFrame(face));
    if (fm) upsert(face, fm, rectT(face), live);
  }
  scope?.querySelectorAll('[data-solid]').forEach(el => {
    const t = rectT(el);
    if (t.w && t.h && t.y < innerHeight && t.y + t.h > 0) upsert(el, getSolidMask(), t, live);
  });

  for (const k of colliders.keys()) if (!live.has(k)) colliders.delete(k);
  return [...colliders.values()];
}

export function solidAt(list, x, y) {
  for (const c of list) if (c.hit(x, y)) return c;
  return null;
}
