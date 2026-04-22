// tests/easing.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { easeSqrt } from '../src/easing.js';

test('easeSqrt(0) = 0', () => {
  assert.equal(easeSqrt(0), 0);
});

test('easeSqrt(1) = 1', () => {
  assert.equal(easeSqrt(1), 1);
});

test('easeSqrt(0.25) = 0.5 (sqrt curve passes through this point)', () => {
  assert.equal(easeSqrt(0.25), 0.5);
});

test('easeSqrt is monotonically increasing', () => {
  let prev = -1;
  for (let t = 0; t <= 1; t += 0.05) {
    const v = easeSqrt(t);
    assert.ok(v > prev, `expected ${v} > ${prev} at t=${t}`);
    prev = v;
  }
});

test('easeSqrt(0.01) > 0.09 (sharp initial velocity)', () => {
  // A linear curve would be 0.01 here. sqrt gives 0.1. Confirms the fast-start character.
  assert.ok(easeSqrt(0.01) > 0.09);
});
