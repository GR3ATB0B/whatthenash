// tests/menu.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { roughRect, mulberry32 } from '../js/rough.js';
import { parseHash, hashFor } from '../js/route.js';
import { needleAngle } from '../js/meter.js';

test('needle points straight up at a cursor directly above the pivot', () => {
  assert.equal(needleAngle(100, 0, 100, 100), 0);
});
test('needle leans right for a cursor to the right, clamped to the dial', () => {
  assert.equal(Math.round(needleAngle(200, 0, 100, 100)), 45);
  assert.equal(needleAngle(9999, 99, 100, 100), 62);
  assert.equal(needleAngle(-9999, 99, 100, 100), -62);
});

test('rough outlines are deterministic per seed and differ between seeds', () => {
  assert.equal(roughRect(200, 50, 25, 7), roughRect(200, 50, 25, 7));
  assert.notEqual(roughRect(200, 50, 25, 7), roughRect(200, 50, 25, 8));
  assert.match(roughRect(200, 50, 25, 7), /^M[\d.-]+ [\d.-]+ Q/);
});
test('prng stays in [0,1)', () => {
  const r = mulberry32(1);
  for (let i = 0; i < 1000; i++) { const v = r(); assert.ok(v >= 0 && v < 1); }
});

test('hash ⇄ state round-trips', () => {
  assert.deepEqual(parseHash('#about/hobbies'), { panel: 'about', page: 'hobbies' });
  assert.deepEqual(parseHash('#nope'), { panel: null, page: null });
  assert.equal(hashFor({ panel: 'work', page: null }), '#work');
  assert.equal(hashFor({ panel: 'about', page: 'hobbies' }), '#about/hobbies');
});
