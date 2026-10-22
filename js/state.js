/* js/state.js — one tiny store for what's open. Mirrors to the URL hash so
   panels are linkable (#work, #about, #about/hobbies, #contact, #terminal). */

import { parseHash, hashFor } from './route.js';

const state = { menu: false, panel: null, page: null };
const subs = new Set();

export function get() { return { ...state }; }

export function set(patch) {
  const prev = { ...state };
  Object.assign(state, patch);
  if (prev.panel !== state.panel || prev.page !== state.page) {
    const h = hashFor(state);
    if (h !== location.hash && !(h === '' && location.hash === '')) {
      history.pushState(null, '', h || location.pathname + location.search);
    }
  }
  subs.forEach(fn => fn(get(), prev));
}

export function subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }

window.addEventListener('popstate', () => set({ ...parseHash(location.hash), menu: false }));
Object.assign(state, parseHash(location.hash));
