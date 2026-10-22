/* js/panels/work.js — project cards: wobbly borders, captions that run around
   the border on an SVG text path, grunge-edged shots, hand-drawn page marks. */

import { PROJECTS } from '../../data/projects.js';
import { attachRough, roughRect, roughCircle } from '../rough.js';
import { applyHw } from '../hw.js';
import * as store from '../state.js';

const NS = 'http://www.w3.org/2000/svg';
const panel = document.querySelector('.panel[data-panel="work"]');
const list = panel?.querySelector('.work-cards');
const pager = panel?.querySelector('.work-pager');
const mq = matchMedia('(max-width: 720px)');

let page = 0;
const perPage = () => (mq.matches ? 1 : 2);
const pages = () => Math.ceil(PROJECTS.length / perPage());

function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => (k === 'class' ? (e.className = v) : e.setAttribute(k, v)));
  e.append(...kids);
  return e;
}

/* caption text running around the card, just outside the border */
function attachCaption(card, text, seed) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'card-caption');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(NS, 'path');
  const id = `cap-${seed}`;
  path.id = id;
  const t = document.createElementNS(NS, 'text');
  const tp = document.createElementNS(NS, 'textPath');
  tp.setAttribute('href', `#${id}`);
  tp.textContent = `${text}  ✳  `.repeat(4);
  t.append(tp);
  svg.append(path, t);
  card.append(svg);
  const PAD = 16;
  const draw = () => {
    const w = card.offsetWidth + PAD * 2, h = card.offsetHeight + PAD * 2;
    svg.setAttribute('viewBox', `${-PAD} ${-PAD} ${w} ${h}`);
    // same wobble family as the border, a bit bigger
    path.setAttribute('d', roughRect(w - PAD * 2 + 20, h - PAD * 2 + 20, 30, seed, 1.2).replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g,
      (_, x, y) => `${(+x - 10).toFixed(1)} ${(+y - 10).toFixed(1)}`));
  };
  draw();
  new ResizeObserver(draw).observe(card);
}

function card(p, i) {
  const title = p.hw
    ? el('h3', {}, Object.assign(el('span', { class: 'hw', 'data-hw': p.hw, 'aria-hidden': 'true' })), el('span', { class: 'sr-only' }, p.name))
    : el('h3', { class: 'typed' }, p.name);
  const shot = el('div', { class: 'card-shot' + (p.img ? '' : ' is-todo') });
  if (p.img) shot.append(el('img', { src: p.img, alt: `${p.name}`, loading: 'lazy', decoding: 'async' }));
  else shot.append(el('span', {}, `TODO: photo of ${p.name}`));
  const status = p.status === 'complete' ? 'done' : `in progress · ${p.progress}%`;
  const c = el('article', { class: 'card', 'data-swap': '' },
    shot, title,
    el('p', { class: 'card-status' }, status),
    el('a', { class: 'card-link', href: `/projects/${p.slug}.html` }, 'read the notes →'));
  c.style.setProperty('--tilt', `${[-1.2, .8, -.4, 1.1, -.9, .5][i % 6]}deg`);
  return c;
}

function render() {
  if (!list) return;
  const n = perPage();
  page = Math.min(page, pages() - 1);
  list.replaceChildren(...PROJECTS.slice(page * n, page * n + n).map((p, k) => card(p, page * n + k)));
  list.querySelectorAll('.card').forEach((c, k) => {
    attachRough(c, { radius: 22, wobble: 2 });
    attachCaption(c, PROJECTS[page * n + k].desc, 100 + page * n + k);
  });
  list.querySelectorAll('.hw').forEach(applyHw);

  // hand-drawn page marks (TODO: swap for Nash's own marks once drawn)
  const marks = pager.querySelector('.work-marks');
  marks.replaceChildren(...Array.from({ length: pages() }, (_, k) => {
    const b = el('button', { type: 'button', class: 'mark' + (k === page ? ' is-on' : ''), 'aria-label': `Page ${k + 1} of ${pages()}` });
    if (k === page) b.setAttribute('aria-current', 'page');
    b.innerHTML = `<svg viewBox="0 0 22 22" aria-hidden="true"><path d="${roughCircle(22, 7 + k * 13)}"/></svg>`;
    b.addEventListener('click', () => go(k));
    return b;
  }));
  pager.querySelector('.work-prev').disabled = page === 0;
  pager.querySelector('.work-next').disabled = page >= pages() - 1;
}

function go(k) {
  page = Math.max(0, Math.min(pages() - 1, k));
  render();
}

if (panel) {
  pager.querySelector('.work-prev').addEventListener('click', () => go(page - 1));
  pager.querySelector('.work-next').addEventListener('click', () => go(page + 1));
  document.addEventListener('keydown', e => {
    if (store.get().panel !== 'work' || e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowRight') go(page + 1);
    if (e.key === 'ArrowLeft') go(page - 1);
  });
  mq.addEventListener('change', render);
  // build lazily the first time the panel opens (keeps images out of the loader)
  let built = false;
  const maybeBuild = s => { if (s.panel === 'work' && !built) { built = true; render(); } };
  store.subscribe(maybeBuild);
  maybeBuild(store.get());
}
