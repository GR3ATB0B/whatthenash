/* js/hero.js — the looping scroll. Scroll (plus a slow idle drift) moves the
   photo table; the verb under the face swaps once per segment. */

import { phaseFromScroll, wrapScroll, verbAt } from './hero-math.js';
import { LOOP } from './table-math.js';
import { buildTable } from './table.js';
import { inlineLettering, writeOn } from './write-on.js';
import * as store from './state.js';
import { CONFIG } from '../data/config.js';
import { prefersReducedMotion } from '../shared.js';

const SEG_VH = 1.1;        // one verb per ~screen of scrolling
const DRIFT = 0.018;       // phase units per second while nobody's scrolling, so it's never quite still

export function initHero() {
  const space = document.getElementById('scroll-space');
  const box = document.getElementById('table');
  const verbBox = document.querySelector('.hero-verbs');
  if (!space || !box) return;

  // optional: confine the photos to the band between the two lines of words
  const clear = CONFIG.photosClearOfWords;
  document.documentElement.classList.toggle('words-clear', clear);
  function fitBand() {
    if (!clear) return;
    const hello = document.querySelector('.desk-hello'), line = document.querySelector('.hero-line');
    box.style.top = `${Math.round(hello.getBoundingClientRect().bottom + 14)}px`;
    box.style.bottom = `${Math.round(innerHeight - line.getBoundingClientRect().top + 14)}px`;
  }
  fitBand();
  addEventListener('resize', fitBand);

  const update = buildTable(box, { containY: clear });

  // the verbs, inlined so they can be written on stroke by stroke
  const names = (verbBox?.dataset.verbs || '').split(',');
  const verbs = [];
  Promise.all(names.map(n => inlineLettering(`${n}-a`))).then(svgs => svgs.forEach((svg, i) => {
    svg.classList.add('hero-verb');
    verbBox.append(svg);
    verbs[i] = svg;
    if (prefersReducedMotion) svg.classList.add('is-on');
  }));
  let writing = -1;
  function showVerb(v) {
    if (!verbs[v] || writing === v) return;
    writing = v;
    verbs.forEach((svg, i) => svg.classList.toggle('is-on', i === v));
    writeOn(verbs[v]);
  }

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
    if (v !== verb || writing !== v) { verb = v; showVerb(v); }
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
