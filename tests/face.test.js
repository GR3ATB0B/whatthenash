// tests/face.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = { matchMedia: () => ({ matches: false }) };
globalThis.document = { querySelector: () => null, querySelectorAll: () => [] };
const { frameForPointer } = await import('../js/face.js');

test('pointer at element center faces front (middle frames)', () => {
  const f = frameForPointer(500, 500, 500);
  assert.ok(f === 17 || f === 18);
});

test('pointer far left clamps to first frame', () => {
  assert.equal(frameForPointer(-9999, 500, 500), 0);
});

test('pointer far right clamps to last frame', () => {
  assert.equal(frameForPointer(9999, 500, 500), 35);
});
