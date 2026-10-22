/* js/panels/about.js — the notebook. Two pages: lab notes, hobbies. */

import { COPY } from '../../data/copy.js';
import { HOBBIES } from '../../data/hobbies.js';
import * as store from '../state.js';

const panel = document.querySelector('.panel[data-panel="about"]');

function esc(s) { return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
const todo = s => s.startsWith('TODO') ? `<span class="todo">${esc(s)}</span>` : esc(s);

function build() {
  const notes = panel.querySelector('[data-page="notes"] .nb-body');
  const facts = COPY.about.facts.map(f => `<li>${esc(f)}</li>`).join('');
  notes.innerHTML = `
    <p class="nb-date">entry #001 · <span class="todo">TODO: date / where I'm writing from</span></p>
    <ul class="nb-facts">${facts}</ul>
    <p>${todo(COPY.about.body)}</p>
    <figure class="taped" style="--tilt:-3deg">
      <img src="/images/electronics-desk.jpg" alt="My electronics bench" loading="lazy" decoding="async">
      <figcaption class="todo">TODO: caption in my voice</figcaption>
    </figure>
    <figure class="taped" style="--tilt:2.5deg">
      <img src="/images/forging-1.jpg" alt="Forging metal" loading="lazy" decoding="async">
      <figcaption class="todo">TODO: caption in my voice</figcaption>
    </figure>
    <div class="nb-video todo" role="note">${esc(COPY.about.videos)}</div>
    <p>Code lives on <a class="orange" href="https://github.com/GR3ATB0B" target="_blank" rel="noopener">GitHub</a>.
       Want to talk? <a class="orange" href="#contact">Page me</a>.</p>`;

  const hob = panel.querySelector('[data-page="hobbies"] .nb-body');
  hob.innerHTML = `<p class="nb-sub">${HOBBIES.length} things I keep picking up. Click one for the notes.</p>
    <ul class="nb-hobbies">${HOBBIES.map((h, i) => `
      <li style="--tilt:${[-1.5, 1, -.5, 1.8, -1, .6][i % 6]}deg">
        <a href="${h.page}">
          ${h.img ? `<img src="${h.img}" alt="" loading="lazy" decoding="async">` : '<span class="nb-nophoto" aria-hidden="true">✳</span>'}
          <span>${esc(h.name)}${h.current ? ' <em>· right now</em>' : ''}</span>
        </a>
      </li>`).join('')}
    </ul>`;
}

function show(s) {
  const page = s.page === 'hobbies' ? 'hobbies' : 'notes';
  panel.querySelectorAll('.nb-page').forEach(p => (p.hidden = p.dataset.page !== page));
  panel.querySelectorAll('.nb-tab').forEach(t => t.setAttribute('aria-selected', String(t.dataset.tab === page)));
}

if (panel) {
  let built = false;
  panel.querySelectorAll('.nb-tab').forEach(t => t.addEventListener('click', () =>
    store.set({ page: t.dataset.tab === 'hobbies' ? 'hobbies' : null })));
  panel.addEventListener('click', e => {
    const a = e.target.closest('a[href="#contact"]');
    if (a) { e.preventDefault(); store.set({ panel: 'contact', page: null }); }
  });
  const sync = s => {
    if (s.panel !== 'about') return;
    if (!built) { built = true; build(); }
    show(s);
  };
  store.subscribe(sync);
  sync(store.get());
}
