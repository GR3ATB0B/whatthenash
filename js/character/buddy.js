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

  const sprite = el.querySelector('.buddy-sprite');
  const coarse = matchMedia('(pointer: coarse)').matches;
  if (coarse) el.querySelector('.buddy-hint-keys').textContent = COPY.character.touchControls;
  const s = createState(64, innerHeight);
  const input = { left: false, right: false, jump: false, jumpPressed: false };
  let controlled = false, acc = 0, last = 0, walked = 0, hintTimer = 0;

  initWorld();

  function take() {
    if (controlled) return;
    controlled = true;
    window.__buddyControl = true;
    el.classList.add('is-controlled');
    el.classList.remove('show-hint');
    if (coarse) document.documentElement.classList.add('buddy-touch');
    el.focus({ preventScroll: true });
  }
  function release() {
    if (!controlled) return;
    controlled = false;
    window.__buddyControl = false;
    Object.assign(input, { left: false, right: false, jump: false });
    el.classList.remove('is-controlled');
    document.documentElement.classList.remove('buddy-touch');
  }

  // tapping him again on a touch screen lets go (there's no Esc key)
  el.addEventListener('click', () => (controlled && coarse ? release() : take()));
  el.addEventListener('keydown', e => {
    if (!controlled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); take(); }
  });
  el.addEventListener('pointerenter', () => !controlled && el.classList.add('show-hint'));
  el.addEventListener('pointerleave', () => el.classList.remove('show-hint'));
  el.addEventListener('focus', () => !controlled && el.classList.add('show-hint'));
  el.addEventListener('blur', () => el.classList.remove('show-hint'));

  addEventListener('pointerdown', e => {
    if (!controlled || el.contains(e.target)) return;
    if (e.pointerType === 'touch') return touchSteer(e);
    release();
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

  /* touch: hold to the left/right of him to walk, tap above him to jump */
  function touchSteer(e) {
    const above = e.clientY < s.y - PHYS.H;
    if (above) { input.jumpPressed = true; input.jump = true; }
    const side = e.clientX < s.x ? 'left' : 'right';
    if (!above) input[side] = true;
    const up = ev => {
      if (ev.pointerId !== e.pointerId) return;
      input[side] = false; input.jump = false;
      removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
    };
    addEventListener('pointerup', up); addEventListener('pointercancel', up);
  }

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
    const bounds = { w: innerWidth, h: innerHeight };

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
