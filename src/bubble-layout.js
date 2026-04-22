// src/bubble-layout.js

/**
 * Places `sizes` circles inside a container with no overlaps.
 * Returns [{ x, y, size }] in the same order as the input.
 *
 * @param {number[]} sizes        Diameter of each bubble, in px.
 * @param {number}   containerW   Container width in px.
 * @param {number}   containerH   Container height in px.
 * @param {() => number} [rng]    Optional RNG returning [0,1). Defaults to Math.random.
 * @param {number}   [padding=8]  Minimum pixel gap between bubble edges.
 * @param {number}   [maxAttempts=300] Max placement attempts per bubble.
 */
export function layoutBubbles(sizes, containerW, containerH, rng = Math.random, padding = 8, maxAttempts = 300) {
  const placed = [];
  for (const size of sizes) {
    let x = 0, y = 0, ok = false;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      x = rng() * Math.max(0, containerW - size);
      y = rng() * Math.max(0, containerH - size);
      if (!collides({ x, y, size }, placed, padding)) { ok = true; break; }
    }
    // Fallback: pack to the nearest available corner if we never found a slot.
    if (!ok) { x = Math.min(x, containerW - size); y = Math.min(y, containerH - size); }
    placed.push({ x, y, size });
  }
  return placed;
}

function collides(b, others, padding) {
  const bx = b.x + b.size / 2, by = b.y + b.size / 2;
  for (const p of others) {
    const px = p.x + p.size / 2, py = p.y + p.size / 2;
    const dx = bx - px, dy = by - py;
    if (Math.hypot(dx, dy) < (b.size / 2 + p.size / 2 + padding)) return true;
  }
  return false;
}
