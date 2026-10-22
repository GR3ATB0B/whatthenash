// tests/loader.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';

await import('../js/loader.js'); // classic script; publishes globalThis.LoaderMath
const { step, percent, targetFor, SPEED_PX_S } = globalThis.LoaderMath;

test('walks at a fixed px/sec regardless of distance', () => {
  assert.equal(step(0, 1000, 0.5, SPEED_PX_S), SPEED_PX_S * 0.5);
  assert.equal(step(0, 5000, 0.5, SPEED_PX_S), SPEED_PX_S * 0.5);
});

test('never passes the target', () => {
  assert.equal(step(90, 100, 1, SPEED_PX_S), 100);
});

test('never walks backwards when the target drops', () => {
  assert.equal(step(80, 50, 0.1, SPEED_PX_S), 80);
});

test('percent is clamped 0..100 and rounds', () => {
  assert.equal(percent(0, 200), 0);
  assert.equal(percent(101, 200), 51);
  assert.equal(percent(999, 200), 100);
  assert.equal(percent(5, 0), 100);
});

test('before the asset count is known he only creeps a little', () => {
  assert.ok(targetFor(0, 0, 200, false) < 200 * 0.2);
});

test('fail-open sends him all the way', () => {
  assert.equal(targetFor(1, 50, 200, true), 200);
});

test('target tracks loaded / total', () => {
  assert.equal(targetFor(5, 10, 200, false), 100);
  assert.equal(targetFor(12, 10, 200, false), 200);
});
