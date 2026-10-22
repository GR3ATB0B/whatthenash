/* js/hero-math.js — the looping desk scroll, as pure functions (unit-tested).

   Scroll never really goes anywhere. The page is 5 "segments" tall and we
   live in the middle three: one segment per verb (create → wonder → rebuild).
   Drift past either end and we hop back by exactly three segments, which
   lands on the identical frame, so the loop is invisible.

   The verb swaps 60% of the way through each segment. What the photos
   do with the phase lives in table-math.js.                             */

export const VERBS = 3;
export const SWAP_AT = 0.6;


/* where in the loop are we: 0 ≤ phase < 3 */
export function phaseFromScroll(y, segH) {
  const p = (y - segH) / segH;
  return ((p % VERBS) + VERBS) % VERBS;
}

/* if we've drifted out of the middle three segments, where to hop to (else null) */
export function wrapScroll(y, segH) {
  if (y < segH * 0.5) return y + segH * VERBS;
  if (y > segH * (VERBS + 0.5)) return y - segH * VERBS;
  return null;
}

export function verbAt(phase) {
  const k = Math.floor(phase), f = phase - k;
  return f < SWAP_AT ? k % VERBS : (k + 1) % VERBS;
}
