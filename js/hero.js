/* js/hero.js — the looping scroll. Scroll (plus a slow idle drift) moves the
   photo table; the verb under the face swaps once per segment. */

import { phaseFromScroll, wrapScroll, verbAt } from './hero-math.js';
import { LOOP } from './table-math.js';
import { buildTable } from './table.js';
import * as store from './state.js';
import { prefersReducedMotion } from '../shared.js';

const SEG_VH = 1.1;        // one verb per ~screen of scrolling
const DRIFT = 0.018;       // phase units per second while nobody's scrolling, so it's never quite still

export function initHero() {
  const space = document.getElementById('scroll-space');
  const box = document.getElementById('table');
  const verbs = [...document.querySelectorAll('.hero-verb')];
  if (!space || !box) return;

  const update = buildTable(box);

  if (prefersReducedMotion) {
    document.documentElement.classList.add('hero-static');
    update(0.4);
    addEventListener('resize', () => update(0.4));
    addEventListener('loader:done', () => update(0.4), { once: true });
    return;
  }

  let segH = 0, verb = -1, drift = 0, last = 0;

  function measure() {
    segH = Math.round(innerHeight * SEG_VH);
    space.style.height = `${segH * 5 + innerHeight}px`;
  }

  function frame(now) {
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    const y = scrollY;
    const hop = wrapScroll(y, segH);
    if (hop !== null) scrollTo({ top: hop, behavior: 'instant' });
    const phase = phaseFromScroll(hop ?? y, segH);
    if (!store.get().panel && !document.hidden) drift = (drift + dt * DRIFT) % LOOP;
    update((phase + drift) % LOOP, now);
    const v = verbAt(phase);
    if (v !== verb) {
      verb = v;
      verbs.forEach((el, i) => el.classList.toggle('is-on', i === v));
    }
    requestAnimationFrame(frame);
  }

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  measure();
  scrollTo({ top: segH, behavior: 'instant' });
  addEventListener('resize', () => {
    const phase = phaseFromScroll(scrollY, segH);
    measure();
    scrollTo({ top: segH + phase * segH, behavior: 'instant' });
  });
  requestAnimationFrame(frame);
}
