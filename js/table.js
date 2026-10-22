/* js/table.js — Nash's printed photos on the table. Not clickable; just to look at.
   Motion comes from table-math.js. When a print gets buried under others it
   quietly becomes a different photo, so the table keeps changing. */

import { PHOTOS } from '../data/photos.js';
import { makeCards, cardPose, coveredFraction } from './table-math.js';
import { mulberry32 } from './rough.js';
import { track, reveal } from './desk.js';

const SWAP_COVER = 0.8;       // this buried → swap the photo
const SWAP_COOLDOWN = 1500;   // ms before the same print can swap again

/* live print rectangles in viewport coords, for the character to stand on */
export const tableState = { prints: [] };

export function buildTable(box, { containY = false } = {}) {
  const mobile = matchMedia('(max-width: 720px)').matches;
  const n = Math.min(PHOTOS.length, mobile ? 9 : 16);
  const cards = makeCards(n);

  // shuffle the photo order once per visit
  const rnd = mulberry32((Date.now() / 1000) | 0);
  const order = PHOTOS.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const pool = order.slice(n);

  let W = 0, H = 0, base = 0, ox = 0, oy = 0;
  const prints = cards.map((c, i) => {
    const el = document.createElement('div');
    el.className = 'print' + (c.polaroid ? ' is-polaroid' : '');
    el.setAttribute('aria-hidden', 'true');
    const img = document.createElement('img');
    img.alt = ''; img.draggable = false; img.decoding = 'async';
    el.append(img);
    box.append(el);
    const p = { el, img, card: c, photo: order[i], w: 0, h: 0, lastSwap: 0 };
    track(PHOTOS[p.photo][0], () => { setPhoto(p, p.photo); reveal(el); });
    return p;
  });

  function size(p) {
    const [, pw, ph] = PHOTOS[p.photo];
    const ar = pw / ph;
    p.w = base * p.card.size * Math.sqrt(ar);
    p.h = p.w / ar;
    const frame = p.card.polaroid ? [10, 10, 34] : [6, 6, 6];   // side, top, bottom border
    p.el.style.width = `${(p.w + frame[0] * 2).toFixed(0)}px`;
    p.el.style.padding = `${frame[1]}px ${frame[0]}px ${frame[2]}px`;
    p.img.style.aspectRatio = `${pw} / ${ph}`;
    p.bw = p.w + frame[0] * 2; p.bh = p.h + frame[1] + frame[2];
  }
  function setPhoto(p, idx) {
    p.photo = idx;
    p.img.src = PHOTOS[idx][0];
    size(p);
  }

  function measure() {
    W = box.clientWidth; H = box.clientHeight;
    const r = box.getBoundingClientRect(); ox = r.left; oy = r.top;
    base = Math.max(96, Math.min(220, Math.min(W, H * 1.4) * (mobile ? 0.26 : 0.16)));
    prints.forEach(size);
  }
  measure();
  addEventListener('resize', measure);
  tableState.prints = prints;

  // warm the cache for photos that will swap in later (after the loader, low priority)
  addEventListener('loader:done', () => setTimeout(() => pool.forEach(i => { const im = new Image(); im.src = PHOTOS[i][0]; }), 1500), { once: true });

  return function update(phase, now = performance.now()) {
    const poses = prints.map(p => cardPose(p.card, phase));
    const rank = poses.map((q, i) => [q.z, i]).sort((a, b) => a[0] - b[0]);
    const rects = new Array(prints.length);
    rank.forEach(([, i], r) => {
      const p = prints[i], q = poses[i];
      const x = q.x * W - p.bw / 2;
      // containY: keep the whole print inside the band (top/bottom edges never cross the words)
      const y = containY ? q.y * Math.max(0, H - p.bh) : q.y * H - p.bh / 2;
      p.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${q.rot.toFixed(1)}deg)`;
      p.el.style.zIndex = String(r + 1);
      rects[i] = { x: x + p.bw * .08, y: y + p.bh * .08, w: p.bw * .84, h: p.bh * .84 };
      p.t = { x: ox + x, y: oy + y, w: p.bw, h: p.bh, rot: q.rot };
    });
    // buried prints become something else
    if (!pool.length) return;
    rank.forEach(([, i], r) => {
      const p = prints[i];
      if (now - p.lastSwap < SWAP_COOLDOWN) return;
      const above = rank.slice(r + 1).map(([, j]) => rects[j]);
      if (coveredFraction(rects[i], above) >= SWAP_COVER) {
        pool.push(p.photo);
        setPhoto(p, pool.shift());
        p.lastSwap = now;
      }
    });
  };
}
