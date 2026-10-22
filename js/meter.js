/* js/meter.js — multimeter needle maths (no DOM, unit-tested). */

/* angle in degrees (0 = straight up) from the pivot to a point, clamped to the dial */
export function needleAngle(px, py, cx, cy, max = 62) {
  const deg = Math.atan2(px - cx, cy - py) * 180 / Math.PI;
  return Math.max(-max, Math.min(max, deg));
}
