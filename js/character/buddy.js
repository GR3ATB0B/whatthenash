/* js/character/buddy.js — little-me. Click him to take control.
   WASD / arrows walk, Space jumps; Esc or clicking elsewhere lets go.
   He stays on screen over every panel. Physics: physics.js. */

import { PHYS, createState, step } from './physics.js';
import { initWorld, refreshWorld, solidAt } from './world.js';
import { COPY } from '../../data/copy.js';

const SPRITE_H = 64;           // drawn height in px (feet at the bottom)
const STRIDE_PX = 15;          // walk-cycle frame advances every N px travelled
const KEYS = {
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right',
  ArrowUp: 'jump', w: 'jump', W: 'jump', ' ': 'jump',
};

export function initBuddy() {
  const el = document.createElement('div');
  el.className = 'buddy';
  el.tabIndex = 0;
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', 'Little me. Press Enter to take control, then arrow keys or WASD to walk and Space to jump. Escape lets go.');
  el.innerHTML = `
    <div class="buddy-sprite" data-frame="still" aria-hidden="true">
      <span class="bf" data-f="still" style="--src:url(/img/lettering/char-still-a.svg)"></span>
      <span class="bf" data-f="jump" style="--src:url(/img/lettering/char-jump-a.svg)"></span>
      ${[1, 2, 3, 4, 5].map(i => `<span class="bf" data-f="walk${i}" style="--src:url(/img/char/walk-${i}.TODO.svg)"></span>`).join('')}
    </div>
    <div class="buddy-hint" role="note">
      <span class="buddy-hint-say">${COPY.character.hint}</span>
      <span class="buddy-hint-keys">${COPY.character.controls}</span>
    </div>`;
  document.body.append(el);

  const pad = document.createElement('div');
  pad.className = 'buddy-pad';
  pad.hidden = true;
  pad.innerHTML = `
    <button type="button" data-k="left" aria-label="Walk left"><span class="hw" style="--a:url(/img/lettering/arrow-left-a.svg);--b:url(/img/lettering/arrow-left-a.svg);--ar:153/68"></span></button>
    <button type="button" data-k="right" aria-label="Walk right"><span class="hw" style="--a:url(/img/lettering/arrow-right-a.svg);--b:url(/img/lettering/arrow-right-a.svg);--ar:172/70"></span></button>
    <button type="button" data-k="jump" class="pad-jump" aria-label="Jump"><span class="hw" style="--a:url(/img/lettering/key-space-a.svg);--b:url(/img/lettering/key-space-a.svg);--ar:365/94"></span></button>`;
  document.body.append(pad);

  const sprite = el.querySelector('.buddy-sprite');
  const s = createState(64, innerHeight);
  const input = { left: false, right: false, jump: false, jumpPressed: false };
  let controlled = false, acc = 0, last = 0, walked = 0, hintTimer = 0;
  const coarse = matchMedia('(pointer: coarse)').matches;

  initWorld();

  function take() {
    if (controlled) return;
    controlled = true;
    window.__buddyControl = true;
    el.classList.add('is-controlled');
    el.classList.remove('show-hint');
    if (coarse) pad.hidden = false;
    el.focus({ preventScroll: true });
  }
  function release() {
    if (!controlled) return;
    controlled = false;
    window.__buddyControl = false;
    Object.assign(input, { left: false, right: false, jump: false });
    el.classList.remove('is-controlled');
    pad.hidden = true;
  }

  el.addEventListener('click', take);
  el.addEventListener('keydown', e => {
    if (!controlled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); take(); }
  });
  el.addEventListener('pointerenter', () => !controlled && el.classList.add('show-hint'));
  el.addEventListener('pointerleave', () => el.classList.remove('show-hint'));
  el.addEventListener('focus', () => !controlled && el.classList.add('show-hint'));
  el.addEventListener('blur', () => el.classList.remove('show-hint'));

  addEventListener('pointerdown', e => {
    if (controlled && !el.contains(e.target) && !pad.contains(e.target)) release();
  });

  const typing = t => t.closest?.('input, textarea, select, [contenteditable]');
  addEventListener('keydown', e => {
    if (!controlled || typing(e.target)) return;
    if (e.key === 'Escape') { release(); return; }
    const k = KEYS[e.key];
    if (!k) return;
    e.preventDefault(); e.stopPropagation();
    if (k === 'jump') { if (!input.jump) input.jumpPressed = true; input.jump = true; }
    else input[k] = true;
  }, true);
  addEventListener('keyup', e => {
    const k = KEYS[e.key];
    if (k) input[k] = false;
  }, true);
  addEventListener('blur', () => Object.assign(input, { left: false, right: false, jump: false }));

  pad.addEventListener('pointerdown', e => {
    const b = e.target.closest('[data-k]'); if (!b) return;
    e.preventDefault();
    const k = b.dataset.k;
    if (k === 'jump') { input.jumpPressed = true; input.jump = true; } else input[k] = true;
    try { b.setPointerCapture(e.pointerId); } catch { /* fine without capture */ }
  });
  const padUp = e => { const b = e.target.closest('[data-k]'); if (b) input[b.dataset.k] = false; };
  pad.addEventListener('pointerup', padUp);
  pad.addEventListener('pointercancel', padUp);

  // say hi once the loader's done
  addEventListener('loader:done', () => {
    el.classList.add('is-in');
    setTimeout(() => { el.classList.add('show-hint'); hintTimer = setTimeout(() => el.classList.remove('show-hint'), 6000); }, 900);
  }, { once: true });

  function frame(now) {
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    const world = refreshWorld();
    const solid = { solid: (x, y) => !!solidAt(world, x, y) };
    // the touch pad, when showing, is the floor
    const bounds = { w: innerWidth, h: innerHeight - (pad.hidden ? 0 : pad.offsetHeight) };

    // ride whatever he's standing on (photos slide, panels scroll)
    if (s.onGround && s.y < bounds.h) {
      const under = solidAt(world, s.x, s.y + 1);
      if (under) { const [dx, dy] = under.carry(s.x, s.y + 1); s.x += dx; s.y += dy; }
    }

    acc += dt;
    while (acc >= PHYS.DT) {
      step(s, controlled ? input : { left: false, right: false, jumpPressed: false }, solid, bounds);
      input.jumpPressed = false;
      acc -= PHYS.DT;
    }

    walked += Math.abs(s.vx) * dt;
    const f = !s.onGround ? 'jump' : Math.abs(s.vx) > 20 ? `walk${1 + Math.floor(walked / STRIDE_PX) % 5}` : 'still';
    if (sprite.dataset.frame !== f) sprite.dataset.frame = f;
    el.style.transform = `translate(${(s.x).toFixed(1)}px, ${(s.y - SPRITE_H).toFixed(1)}px)`;
    sprite.style.scale = `${s.facing} 1`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  const api = { state: s, take, release };
  if (location.hostname === 'localhost') window.__buddy = api;   // dev poking only
  return api;
}
