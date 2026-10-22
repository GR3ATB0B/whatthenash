/* js/character/physics.js — little-me's platformer physics (no DOM, unit-tested).

   Units are px and seconds, stepped at a fixed 120 Hz so a jump is the
   same height on every machine. `world.solid(x, y)` says whether a point
   is inside anything; the floor and side walls come from `bounds`.       */

export const PHYS = {
  DT: 1 / 120,
  GRAVITY: 2400,
  JUMP_V: 760,          // → apex ≈ JUMP_V² / (2·GRAVITY) ≈ 120 px
  MOVE: 240,
  ACCEL: 2600,
  AIR_ACCEL: 1500,
  FRICTION: 3000,
  MAX_FALL: 1400,
  W: 20, H: 58,          // collision box; (x, y) is the middle of the feet
  STEP_UP: 10,           // little ledges he just walks up
  UNSTICK: 240,          // if something lands on him, pop up at most this far
  COYOTE: 0.08,          // grace after walking off an edge
  BUFFER: 0.1,           // jump pressed slightly before landing still counts
};

export function createState(x, y) {
  return { x, y, vx: 0, vy: 0, onGround: false, facing: 1, coyote: 0, buffer: 0 };
}

const feet = (world, x, y) =>
  world.solid(x - PHYS.W / 2 + 3, y) || world.solid(x, y) || world.solid(x + PHYS.W / 2 - 3, y);
const body = (world, x, y) =>
  world.solid(x, y - PHYS.H * 0.5) || world.solid(x, y - PHYS.H + 4);

export function step(s, input, world, bounds, dt = PHYS.DT) {
  const P = PHYS;
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);

  // run
  if (dir) {
    s.vx += dir * (s.onGround ? P.ACCEL : P.AIR_ACCEL) * dt;
    s.vx = Math.max(-P.MOVE, Math.min(P.MOVE, s.vx));
    s.facing = dir;
  } else if (s.onGround) {
    const f = P.FRICTION * dt;
    s.vx = Math.abs(s.vx) <= f ? 0 : s.vx - Math.sign(s.vx) * f;
  }

  // jump (with coyote time + input buffer)
  if (input.jumpPressed) s.buffer = P.BUFFER;
  else s.buffer = Math.max(0, s.buffer - dt);
  s.coyote = s.onGround ? P.COYOTE : Math.max(0, s.coyote - dt);
  if (s.buffer > 0 && s.coyote > 0) {
    s.vy = -P.JUMP_V; s.onGround = false; s.buffer = 0; s.coyote = 0;
  }

  s.vy = Math.min(P.MAX_FALL, s.vy + P.GRAVITY * dt);

  // something slid onto him (a photo moved): pop up on top of it
  if (body(world, s.x, s.y)) {
    let k = 0;
    while ((body(world, s.x, s.y) || feet(world, s.x, s.y - 1)) && k++ < P.UNSTICK) s.y -= 1;
  }

  // horizontal
  let nx = s.x + s.vx * dt;
  const half = P.W / 2;
  if (nx < half) { nx = half; s.vx = 0; }
  if (nx > bounds.w - half) { nx = bounds.w - half; s.vx = 0; }
  const edge = nx + Math.sign(s.vx || s.facing) * half;
  if (s.vx && (world.solid(edge, s.y - P.STEP_UP - 2) || world.solid(edge, s.y - P.H + 4))) {
    nx = s.x; s.vx = 0;           // wall-ish: too tall to step up
  }
  s.x = nx;

  // vertical
  let ny = s.y + s.vy * dt;
  if (s.vy >= 0) {
    if (feet(world, s.x, ny)) {
      const limit = P.STEP_UP + Math.ceil(s.vy * dt) + 2;
      let k = 0;
      while (feet(world, s.x, ny) && k++ < limit) ny -= 1;
      s.vy = 0; s.onGround = true;
    } else {
      s.onGround = feet(world, s.x, ny + 1);
      if (s.onGround) s.vy = 0;
    }
  } else if (world.solid(s.x, ny - P.H)) {
    ny = s.y; s.vy = 0;            // bonk
  } else {
    s.onGround = false;
  }

  if (ny >= bounds.h) { ny = bounds.h; s.vy = 0; s.onGround = true; }
  if (ny < P.H) { ny = P.H; s.vy = Math.max(0, s.vy); }
  s.y = ny;
  return s;
}
