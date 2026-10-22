// tests/table.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeCards, cardPose, coveredFraction, spread, LOOP } from '../js/table-math.js';

const cards = makeCards(16);

test('every path loops exactly (seamless scroll wrap)', () => {
  cards.forEach(c => {
    const a = cardPose(c, 0.37), b = cardPose(c, 0.37 + LOOP);
    assert.ok(Math.abs(a.x - b.x) < 1e-9 && Math.abs(a.y - b.y) < 1e-9 && Math.abs(a.rot - b.rot) < 1e-9);
  });
});

test('cards stay roughly on the table', () => {
  for (let ph = 0; ph < LOOP; ph += 0.01) cards.forEach(c => {
    const p = cardPose(c, ph);
    assert.ok(p.x > -0.05 && p.x < 1.05 && p.y > -0.05 && p.y < 1.05);
  });
});

test('they never clump: the table stays spread out at every phase', () => {
  let min = Infinity;
  for (let ph = 0; ph < LOOP; ph += 0.005) min = Math.min(min, spread(cards.map(c => cardPose(c, ph))));
  assert.ok(min > 0.15, `min spread ${min}`);
});

test('stacking order keeps changing (cards slide over and under)', () => {
  const order = ph => cards.map((c, i) => [cardPose(c, ph).z, i]).sort((a, b) => a[0] - b[0]).map(x => x[1]).join();
  const seen = new Set();
  for (let ph = 0; ph < LOOP; ph += 0.1) seen.add(order(ph));
  assert.ok(seen.size > 20);
});

test('coveredFraction: none, partial, full', () => {
  const a = { x: 0, y: 0, w: 10, h: 10 };
  assert.equal(coveredFraction(a, []), 0);
  assert.equal(coveredFraction(a, [{ x: 5, y: 0, w: 10, h: 10 }]), 0.5);
  assert.equal(coveredFraction(a, [{ x: -1, y: -1, w: 20, h: 20 }]), 1);
});
