// tests/hero.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { phaseFromScroll, wrapScroll, verbAt, VERBS } from '../js/hero-math.js';

const H = 800;

test('phase starts at 0 one segment down and loops every three segments', () => {
  assert.equal(phaseFromScroll(H, H), 0);
  assert.equal(phaseFromScroll(H * 2.5, H), 1.5);
  assert.equal(phaseFromScroll(H * 4, H), 0);
  assert.ok(Math.abs(phaseFromScroll(H * 0.75, H) - 2.75) < 1e-9);
});

test('wrapping hops by exactly three segments and lands on the same phase', () => {
  for (const y of [H * 0.2, H * 3.7, H * 4.9]) {
    const ny = wrapScroll(y, H);
    assert.notEqual(ny, null);
    assert.equal(Math.abs(ny - y), H * VERBS);
    assert.ok(Math.abs(phaseFromScroll(ny, H) - phaseFromScroll(y, H)) < 1e-9);
  }
  assert.equal(wrapScroll(H * 2, H), null);
});

test('verb swaps once per segment, while piled', () => {
  assert.equal(verbAt(0.1), 0);
  assert.equal(verbAt(0.59), 0);
  assert.equal(verbAt(0.61), 1);
  assert.equal(verbAt(2.7), 0);
});
