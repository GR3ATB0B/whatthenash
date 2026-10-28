/* js/terminal/terminal.js — the green phosphor CRT. Boot flicker, grain, a
   scan bar sweeping down, a real "last login" (your last visit), history on
   ↑/↓, Tab to complete, and a counter of commands found. */

import { createShell } from './commands.js';
import { grade, bar, SPEEDUP } from './nashpresso.js';
import { PROJECTS } from '../../data/projects.js';
import * as store from '../state.js';
import { prefersReducedMotion } from '../../shared.js';

const EMAIL = 'NashVogeltanz@icloud.com';   // already public on the old Reach page
const KEY_FOUND = 'wtn.term.found', KEY_LAST = 'wtn.term.last', KEY_BEST = 'wtn.term.best';

const panel = document.querySelector('.panel[data-panel="terminal"]');
const out = panel?.querySelector('.crt-out');
const form = panel?.querySelector('.crt-line');
const input = panel?.querySelector('#crt-in');
const count = panel?.querySelector('.crt-count');

const get = k => { try { return localStorage.getItem(k); } catch { return null; } };
const put = (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode: fine */ } };

const shell = createShell({ projects: PROJECTS, email: EMAIL });
try { shell.restore(JSON.parse(get(KEY_FOUND) || '[]')); } catch { /* ignore */ }

const history = [];
let hIdx = 0, game = null, booted = false;

function print(lines, cls = '') {
  const frag = document.createDocumentFragment();
  for (const l of lines) {
    const div = document.createElement('div');
    div.className = 'crt-l' + (cls ? ' ' + cls : '');
    div.textContent = l || ' ';
    frag.append(div);
  }
  out.append(frag);
  out.scrollTop = out.scrollHeight;
}

function updateCount() {
  count.textContent = `commands found: ${shell.discovered.size}/${shell.total}`;
}

function lastLogin() {
  const prev = get(KEY_LAST);
  put(KEY_LAST, new Date().toISOString());
  if (!prev) return 'Last login: never. first time? welcome.';
  const d = new Date(prev);
  return `Last login: ${d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} on ttys001`;
}

function boot() {
  out.textContent = '';
  panel.classList.remove('is-booting'); void panel.offsetWidth;
  if (!prefersReducedMotion) panel.classList.add('is-booting');
  // the boxed banner only fits on wider screens
  const banner = innerWidth >= 560 ? [
    '┌───────────────────────────────────────────┐',
    '│  whatthenash.com  ·  nash’s desk crt      │',
    '│  type help to start. type exit to leave.  │',
    '└───────────────────────────────────────────┘',
  ] : ['whatthenash.com · nash’s desk crt', 'type help to start. type exit to leave.'];
  print([lastLogin(), '', ...banner, '']);
  updateCount();
}

/* ---- nashpresso: the hidden mini-game ---- */
function startGame() {
  game = { state: 'ready', t0: 0, raf: 0, line: null };
  print(['NASHPRESSO v1', 'grinding… dosing 18g… tamping…', 'press Enter to start the pull. Enter again to stop it.', 'aim for 25–30 seconds.'], 'crt-game');
}
function gameEnter() {
  if (game.state === 'ready') {
    game.state = 'pulling';
    game.t0 = performance.now();
    print([bar(0)], 'crt-game crt-live');
    game.line = out.lastElementChild;
    const tick = () => {
      const sec = (performance.now() - game.t0) / 1000 * SPEEDUP;
      game.line.textContent = bar(sec);
      if (sec > 60) return gameEnter();          // walked away from the machine
      game.raf = requestAnimationFrame(tick);
    };
    game.raf = requestAnimationFrame(tick);
    return;
  }
  if (game.state === 'pulling') {
    cancelAnimationFrame(game.raf);
    const sec = (performance.now() - game.t0) / 1000 * SPEEDUP;
    game.line.textContent = bar(sec);
    const g = grade(sec);
    const best = parseFloat(get(KEY_BEST) || 'NaN');
    const isBest = g.stars === 3 && (isNaN(best) || Math.abs(sec - 27.5) < Math.abs(best - 27.5));
    if (isBest) put(KEY_BEST, sec.toFixed(1));
    print([
      `${'★'.repeat(g.stars)}${'☆'.repeat(3 - g.stars)}  ${g.label}: ${g.note}`,
      isBest ? 'new personal best.' : (isNaN(best) ? '' : `best so far: ${best}s`),
      'type nashpresso to pull another.',
    ], 'crt-game');
    game = null;
  }
}

function run(line) {
  print([`visitor@whatthenash:~$ ${line}`], 'crt-echo');
  if (line.trim()) { history.push(line); hIdx = history.length; }
  const res = shell.run(line);
  if (res.effect === 'clear') { out.textContent = ''; }
  print(res.out);
  if (res.found) {
    put(KEY_FOUND, JSON.stringify([...shell.discovered]));
    updateCount();
    count.classList.remove('is-bump'); void count.offsetWidth; count.classList.add('is-bump');
  }
  if (res.effect === 'exit') setTimeout(() => store.set({ panel: null, page: null }), 250);
  if (res.effect === 'contact') setTimeout(() => store.set({ panel: 'contact', page: null }), 400);
  if (res.effect === 'nashpresso') startGame();
}

if (panel) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (game) { gameEnter(); return; }
    const line = input.value;
    input.value = '';
    run(line);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && history.length) { e.preventDefault(); hIdx = Math.max(0, hIdx - 1); input.value = history[hIdx]; }
    else if (e.key === 'ArrowDown' && history.length) { e.preventDefault(); hIdx = Math.min(history.length, hIdx + 1); input.value = history[hIdx] || ''; }
    else if (e.key === 'Tab') {
      // complete from commands you can already see or have found
      const v = input.value.trim().toLowerCase();
      if (!v) return;
      const hits = shell.names().filter(n => n.startsWith(v));
      if (hits.length) { e.preventDefault(); if (hits.length === 1) input.value = hits[0] + ' '; else print(hits.join('  ').split('\n')); }
    } else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); out.textContent = ''; }
  });

  // clicking anywhere on the screen puts you back at the prompt
  panel.querySelector('.crt').addEventListener('click', () => input.focus({ preventScroll: true }));

  store.subscribe((s, prev) => {
    const open = s.panel === 'terminal';
    document.documentElement.classList.toggle('term-open', open);
    if (open && prev.panel !== 'terminal') {
      if (!booted || !out.childElementCount) { boot(); booted = true; }
      else if (!prefersReducedMotion) { panel.classList.remove('is-booting'); void panel.offsetWidth; panel.classList.add('is-booting'); }
      setTimeout(() => input.focus({ preventScroll: true }), prefersReducedMotion ? 0 : 450);
    }
    if (!open && game) { cancelAnimationFrame(game.raf); game = null; }
  });
  if (store.get().panel === 'terminal') { document.documentElement.classList.add('term-open'); boot(); booted = true; }

  document.querySelector('.crt-btn')?.addEventListener('click', () => store.set({ panel: 'terminal', page: null, menu: false }));

  // the backtick key opens it from anywhere (unless you're typing somewhere)
  addEventListener('keydown', e => {
    if (e.key !== '`' || e.target.closest?.('input, textarea')) return;
    e.preventDefault();
    store.set({ panel: store.get().panel === 'terminal' ? null : 'terminal', page: null, menu: false });
  });
}
