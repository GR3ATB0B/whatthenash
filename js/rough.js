/* js/rough.js — wobbly hand-drawn outlines.
   roughRect() returns an SVG path for a rounded rectangle whose edges wander a
   little. attachRough() draws two of them (frame A/B) so CSS can line-boil. */

// tiny deterministic PRNG so the same seed always gives the same wobble
export function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function roughRect(w, h, r, seed, wobble = 1.6) {
  const rnd = mulberry32(seed);
  const j = () => (rnd() - 0.5) * 2 * wobble;
  r = Math.min(r, w / 2, h / 2);
  const pts = [];
  // corners as quarter circles, edges as a few jittered points
  const corner = (cx, cy, a0) => {
    for (let k = 0; k <= 3; k++) {
      const a = a0 + (k / 3) * (Math.PI / 2);
      pts.push([cx + Math.cos(a) * r + j() * 0.5, cy + Math.sin(a) * r + j() * 0.5]);
    }
  };
  const edge = (x0, y0, x1, y1) => {
    const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 60));
    for (let k = 1; k < n; k++) {
      const t = k / n;
      pts.push([x0 + (x1 - x0) * t + j(), y0 + (y1 - y0) * t + j()]);
    }
  };
  corner(w - r, r, -Math.PI / 2);      edge(w, r, w, h - r);
  corner(w - r, h - r, 0);             edge(w - r, h, r, h);
  corner(r, h - r, Math.PI / 2);       edge(0, h - r, 0, r);
  corner(r, r, Math.PI);               edge(r, 0, w - r, 0);
  // overshoot: pencil lines rarely close perfectly
  const [sx, sy] = pts[0];
  let d = `M${sx.toFixed(1)} ${sy.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i], [px, py] = pts[i - 1];
    d += ` Q${px.toFixed(1)} ${py.toFixed(1)} ${((x + px) / 2).toFixed(1)} ${((y + py) / 2).toFixed(1)}`;
  }
  d += ` L${(sx + 4 + j()).toFixed(1)} ${(sy + j()).toFixed(1)}`;
  return d;
}

let seedCounter = 1;

export function attachRough(el, { radius = 999, wobble = 1.6 } = {}) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'rough');
  svg.setAttribute('aria-hidden', 'true');
  const a = document.createElementNS(NS, 'path'); a.setAttribute('class', 'f-a');
  const b = document.createElementNS(NS, 'path'); b.setAttribute('class', 'f-b');
  svg.append(a, b);
  el.prepend(svg);
  const seed = seedCounter++ * 977;
  const draw = () => {
    const w = el.offsetWidth + 6, h = el.offsetHeight + 6;
    if (!w || !h) return;
    svg.setAttribute('viewBox', `-3 -3 ${w} ${h}`);
    a.setAttribute('d', roughRect(w - 6, h - 6, radius, seed, wobble));
    b.setAttribute('d', roughRect(w - 6, h - 6, radius, seed + 1, wobble));
  };
  draw();
  if ('ResizeObserver' in window) new ResizeObserver(draw).observe(el);
  return svg;
}

/* a loose, not-quite-closed pencil circle centred in a size×size box */
export function roughCircle(size, seed, wobble = 1.2) {
  const rnd = mulberry32(seed);
  const c = size / 2, r = size / 2 - 2, n = 10, start = rnd() * Math.PI * 2;
  let d = '';
  for (let k = 0; k <= n + 1; k++) {
    const a = start + (k / n) * Math.PI * 2;
    const rr = r + (rnd() - .5) * 2 * wobble;
    const x = c + Math.cos(a) * rr, y = c + Math.sin(a) * rr;
    d += (k ? ' L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
  }
  return d;
}
