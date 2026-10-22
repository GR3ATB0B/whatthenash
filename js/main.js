/* js/main.js — the desk page. */

import { hydrateHw } from './hw.js';
import { buildDesk } from './desk.js';
import * as store from './state.js';
import './menu.js';
import './face.js';

hydrateHw();
buildDesk();

// desk objects that open panels
document.getElementById('desk-objects')?.addEventListener('click', e => {
  const o = e.target.closest('[data-opens]');
  if (o) store.set({ panel: o.dataset.opens, page: null, menu: false });
});
