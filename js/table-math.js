/* js/table-math.js — the photo table, as pure functions (unit-tested).

   Like rubbing a deck of cards around a table: every print follows its own
   slow looping path, so they keep sliding over and under each other and
   never gather in one spot. Paths repeat every LOOP phase units, which is
   what lets the scroll loop (hero-math.js) wrap invisibly.               */

import { mulberry32 } from './rough.js';

export const LOOP = 3;          // phase units per full loop (= three verbs)
const TAU = Math.PI * 2;

/* per-card path parameters; integer frequencies keep every path periodic over LOOP */
export function makeCards(n, seed = 21) {
  const rnd = mulberry32(seed);
  const pick = arr => arr[Math.floor(rnd() * arr.length)];
  return Array.from({ length: n }, (_, i) => ({
    fx: pick([1, 2, 3]) * (rnd() < .5 ? -1 : 1),
    fy: pick([1, 2, 3]) * (rnd() < .5 ? -1 : 1),
    fr: pick([1, 2]),
    fz: pick([1, 2, 3]),
    px: rnd() * TAU, py: rnd() * TAU, pr: rnd() * TAU, pz: rnd() * TAU,
    ax: 0.30 + rnd() * 0.16,      // how far it roams (fraction of table)
    ay: 0.28 + rnd() * 0.16,
    rot0: (rnd() - .5) * 30,
    polaroid: i % 3 === 1,
    size: 0.85 + rnd() * 0.35,
  }));
}

/* centre (0..1 of table), rotation (deg) and stacking height of card c at phase */
export function cardPose(c, phase) {
  const t = (phase / LOOP) * TAU;
  return {
    x: 0.5 + c.ax * Math.sin(c.fx * t + c.px),
    y: 0.5 + c.ay * Math.sin(c.fy * t + c.py),
    rot: c.rot0 + 22 * Math.sin(c.fr * t + c.pr),
    z: Math.sin(c.fz * t + c.pz),
  };
}

/* fraction of rect a covered by the rects in `above` (approximate: summed overlaps, capped at 1) */
export function coveredFraction(a, above) {
  const area = a.w * a.h;
  if (!area) return 0;
  let sum = 0;
  for (const b of above) {
    const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
    const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    if (ox > 0 && oy > 0) sum += ox * oy;
  }
  return Math.min(1, sum / area);
}

/* how spread out the table is: mean distance of cards from their centroid (0..~0.5) */
export function spread(poses) {
  const cx = poses.reduce((s, p) => s + p.x, 0) / poses.length;
  const cy = poses.reduce((s, p) => s + p.y, 0) / poses.length;
  return poses.reduce((s, p) => s + Math.hypot(p.x - cx, p.y - cy), 0) / poses.length;
}
