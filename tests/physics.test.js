// tests/physics.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PHYS, createState, step } from '../js/character/physics.js';

const bounds = { w: 800, h: 600 };
const empty = { solid: () => false };
const idle = { left: false, right: false, jumpPressed: false };
const run = (s, input, world, n) => { for (let i = 0; i < n; i++) step(s, i === 0 ? input : { ...input, jumpPressed: false }, world, bounds); return s; };

test('falls under gravity and lands on the floor', () => {
  const s = run(createState(100, 100), idle, empty, 240);
  assert.equal(s.y, bounds.h);
  assert.equal(s.onGround, true);
  assert.equal(s.vy, 0);
});

test('jump height matches v²/2g (fixed timestep, any machine)', () => {
  const s = run(createState(100, bounds.h), idle, empty, 5);
  let minY = s.y;
  step(s, { ...idle, jumpPressed: true }, empty, bounds);
  for (let i = 0; i < 240; i++) { step(s, idle, empty, bounds); minY = Math.min(minY, s.y); }
  const height = bounds.h - minY, expected = PHYS.JUMP_V ** 2 / (2 * PHYS.GRAVITY);
  assert.ok(Math.abs(height - expected) < 8, `height ${height.toFixed(1)} vs ${expected.toFixed(1)}`);
  assert.equal(s.y, bounds.h);
});

test('cannot double-jump in mid-air', () => {
  const s = run(createState(100, bounds.h), idle, empty, 5);
  step(s, { ...idle, jumpPressed: true }, empty, bounds);
  run(s, idle, empty, 20);
  const vyBefore = s.vy;
  step(s, { ...idle, jumpPressed: true }, empty, bounds);
  assert.ok(s.vy > vyBefore - 1, 'second jump ignored');
});

test('walls clamp him inside the screen', () => {
  const left = run(createState(30, bounds.h), { ...idle, left: true }, empty, 240);
  assert.equal(left.x, PHYS.W / 2);
  const right = run(createState(700, bounds.h), { ...idle, right: true }, empty, 240);
  assert.equal(right.x, bounds.w - PHYS.W / 2);
});

test('walk speed is capped and friction stops him', () => {
  const s = run(createState(100, bounds.h), { ...idle, right: true }, empty, 120);
  assert.equal(s.vx, PHYS.MOVE);
  run(s, idle, empty, 60);
  assert.equal(s.vx, 0);
});

test('lands on top of a platform, not inside it', () => {
  const plat = { solid: (x, y) => x > 0 && x < 400 && y >= 300 && y <= 320 };
  const s = run(createState(200, 100), idle, plat, 240);
  assert.ok(Math.abs(s.y - 300) <= 1, `y ${s.y}`);
  assert.equal(s.onGround, true);
});

test('does not tunnel through a thin platform at max fall speed', () => {
  const plat = { solid: (x, y) => y >= 400 && y <= 412 };
  const s = createState(200, 0);
  s.vy = PHYS.MAX_FALL;
  run(s, idle, plat, 120);
  assert.ok(s.y <= 401, `y ${s.y}`);
});

test('walks off an edge and falls', () => {
  const plat = { solid: (x, y) => x < 150 && y >= 300 };
  const s = run(createState(100, 299), idle, plat, 10);
  assert.equal(s.onGround, true);
  run(s, { ...idle, right: true }, plat, 120);
  assert.equal(s.y, bounds.h);
});

test('steps up small ledges but is blocked by tall ones', () => {
  const ledge = h => ({ solid: (x, y) => x >= 300 && y >= bounds.h - h });
  const small = run(createState(250, bounds.h), { ...idle, right: true }, ledge(6), 120);
  assert.ok(small.x > 320, 'walked up the 6px step');
  const tall = run(createState(250, bounds.h), { ...idle, right: true }, ledge(40), 120);
  assert.ok(tall.x < 300, 'stopped at the 40px wall');
});

test('pops up on top of something that slides onto him', () => {
  const s = run(createState(200, bounds.h), idle, empty, 5);
  const box = { solid: (x, y) => x > 100 && x < 300 && y >= 520 };
  run(s, idle, box, 2);
  assert.ok(s.y <= 521, `y ${s.y}`);
});
