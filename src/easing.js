// src/easing.js

/**
 * Square-root easing. Fast initial velocity, smooth asymptote.
 * f(0) = 0, f(1) = 1, derivative at 0 = +infinity, derivative at 1 = 0.5.
 */
export function easeSqrt(t) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return Math.sqrt(t);
}
