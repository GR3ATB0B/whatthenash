// tests/bubble-layout.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layoutBubbles } from '../src/bubble-layout.js';

function overlaps(a, b, pad = 0) {
  const ax = a.x + a.size / 2, ay = a.y + a.size / 2;
  const bx = b.x + b.size / 2, by = b.y + b.size / 2;
  const dx = ax - bx, dy = ay - by;
  return Math.hypot(dx, dy) < (a.size / 2 + b.size / 2 + pad);
}

test('returns one position per input size', () => {
  const rng = seededRandom(1);
  const positions = layoutBubbles([80, 80, 80], 600, 400, rng);
  assert.equal(positions.length, 3);
});

test('no positions overlap (with 8px padding)', () => {
  const rng = seededRandom(2);
  const positions = layoutBubbles([90, 100, 110, 85, 95, 105, 88, 102, 92, 98], 800, 600, rng);
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      assert.ok(!overlaps(positions[i], positions[j], 8),
        `bubbles ${i} and ${j} overlap`);
    }
  }
});

test('all bubbles stay inside container', () => {
  const rng = seededRandom(3);
  const sizes = [100, 90, 80, 110, 95];
  const positions = layoutBubbles(sizes, 500, 400, rng);
  for (const p of positions) {
    assert.ok(p.x >= 0 && p.x + p.size <= 500);
    assert.ok(p.y >= 0 && p.y + p.size <= 400);
  }
});

/* deterministic RNG for reproducible tests */
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
