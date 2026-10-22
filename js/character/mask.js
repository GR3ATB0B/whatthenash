/* js/character/mask.js — alpha bitmasks + transformed colliders (no DOM, unit-tested).

   A mask is the image's alpha channel thresholded into a coarse grid of
   solid / empty cells. A collider places a mask in the world (position,
   rotation, scale) and answers "is this world point solid?", so the
   character stands on what's actually drawn, not on a bounding box.     */

export function buildMask(alpha, w, h, { cell = 2, threshold = 128, stride = 1, offset = 0 } = {}) {
  const cw = Math.ceil(w / cell), ch = Math.ceil(h / cell);
  const bits = new Uint8Array(cw * ch);
  for (let y = 0; y < h; y++) {
    const row = Math.floor(y / cell) * cw;
    for (let x = 0; x < w; x++) {
      if (alpha[(y * w + x) * stride + offset] >= threshold) bits[row + Math.floor(x / cell)] = 1;
    }
  }
  return { w, h, cell, cw, ch, bits };
}

/* RGBA ImageData → mask (alpha is every 4th byte, offset 3) */
export const maskFromImageData = (img, opts) => buildMask(img.data, img.width, img.height, { ...opts, stride: 4, offset: 3 });

export function maskHit(m, lx, ly) {
  if (lx < 0 || ly < 0 || lx >= m.w || ly >= m.h) return false;
  return m.bits[Math.floor(ly / m.cell) * m.cw + Math.floor(lx / m.cell)] === 1;
}

/* t = { x, y, w, h, rot } : box's top-left (unrotated), drawn size, rotation in degrees about its centre */
export function toLocal(t, wx, wy, m) {
  const cx = t.x + t.w / 2, cy = t.y + t.h / 2;
  const a = -t.rot * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  const dx = wx - cx, dy = wy - cy;
  const lx = dx * c - dy * s + t.w / 2, ly = dx * s + dy * c + t.h / 2;
  return [lx * (m.w / t.w), ly * (m.h / t.h)];
}

export function toWorld(t, lx, ly, m) {
  const px = lx * (t.w / m.w) - t.w / 2, py = ly * (t.h / m.h) - t.h / 2;
  const a = t.rot * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return [t.x + t.w / 2 + px * c - py * s, t.y + t.h / 2 + px * s + py * c];
}

export function makeCollider(mask, t) {
  return {
    mask, t, prev: null,
    hit(wx, wy) { const [lx, ly] = toLocal(this.t, wx, wy, this.mask); return maskHit(this.mask, lx, ly); },
    move(nt) { this.prev = this.t; this.t = nt; },
    /* how far the surface point under (wx, wy) moved since the last move() */
    carry(wx, wy) {
      if (!this.prev) return [0, 0];
      const [lx, ly] = toLocal(this.prev, wx, wy, this.mask);
      const [nx, ny] = toWorld(this.t, lx, ly, this.mask);
      return [nx - wx, ny - wy];
    },
  };
}
