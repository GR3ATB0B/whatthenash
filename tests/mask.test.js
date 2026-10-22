// tests/mask.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildMask, maskHit, makeCollider, toLocal, toWorld } from '../js/character/mask.js';

// 8×4 image: left half opaque, right half transparent
const W = 8, H = 4;
const alpha = new Uint8Array(W * H).map((_, i) => (i % W < 4 ? 255 : 0));
const m = buildMask(alpha, W, H, { cell: 1 });

test('alpha threshold → bitmask', () => {
  assert.equal(maskHit(m, 1, 1), true);
  assert.equal(maskHit(m, 6, 1), false);
  assert.equal(maskHit(m, -1, 1), false);
  assert.equal(maskHit(m, 1, 9), false);
});

test('soft edges below threshold count as empty', () => {
  const soft = buildMask(new Uint8Array([255, 100, 0, 0]), 4, 1, { cell: 1, threshold: 128 });
  assert.deepEqual([...soft.bits], [1, 0, 0, 0]);
});

test('RGBA stride reads only the alpha byte', () => {
  const rgba = new Uint8Array([0, 0, 0, 255, 255, 255, 255, 0]);
  const r = buildMask(rgba, 2, 1, { cell: 1, stride: 4, offset: 3 });
  assert.deepEqual([...r.bits], [1, 0]);
});

test('collider respects position and scale', () => {
  const c = makeCollider(m, { x: 100, y: 50, w: 80, h: 40, rot: 0 });   // drawn 10× bigger
  assert.equal(c.hit(110, 60), true);
  assert.equal(c.hit(170, 60), false);
  assert.equal(c.hit(90, 60), false);
});

test('collider respects rotation (180° swaps left and right halves)', () => {
  const c = makeCollider(m, { x: 0, y: 0, w: 80, h: 40, rot: 180 });
  assert.equal(c.hit(10, 20), false);
  assert.equal(c.hit(70, 20), true);
});

test('toLocal/toWorld round-trip', () => {
  const t = { x: 30, y: 40, w: 80, h: 40, rot: 33 };
  const [lx, ly] = toLocal(t, 77, 61, m);
  const [wx, wy] = toWorld(t, lx, ly, m);
  assert.ok(Math.abs(wx - 77) < 1e-9 && Math.abs(wy - 61) < 1e-9);
});

test('carry follows the surface when the collider moves', () => {
  const c = makeCollider(m, { x: 0, y: 0, w: 80, h: 40, rot: 0 });
  c.move({ x: 15, y: -5, w: 80, h: 40, rot: 0 });
  assert.deepEqual(c.carry(20, 0).map(v => Math.round(v)), [15, -5]);
});
