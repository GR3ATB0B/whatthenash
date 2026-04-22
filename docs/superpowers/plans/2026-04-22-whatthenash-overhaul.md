# whatthenash.com Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild whatthenash.com with a premium-light design system and a scroll-narrative homepage whose signature moment is the 3D head exploding into 18 hobby bubbles.

**Architecture:** Vanilla HTML/CSS/JS (no build step, GitHub Pages). Shared design tokens in `style.css`. Shared nav/footer inlined per page. Scroll engine = GSAP 3.12 + ScrollTrigger + CustomEase + Lenis via CDN. Pure-JS logic (bubble layout, sqrt easing) tested with `node:test` — zero dev dependencies. Scroll effects verified manually with explicit browser checklists.

**Tech Stack:** HTML, CSS (custom properties), vanilla JS, GSAP 3.12.5, ScrollTrigger, CustomEase, Lenis 1.1, Google Fonts (Inter + Instrument Serif), `<model-viewer>` 3.4.

**Spec:** `docs/superpowers/specs/2026-04-22-whatthenash-overhaul-design.md`

---

## File Structure

**Files created:**

- `style.css` — **rewritten from scratch**: design tokens (`:root`), resets, typography, shared components (nav, footer, buttons, cards, progress bars, badges), page-specific utility classes.
- `shared.js` — Lenis init, nav hamburger toggle, GSAP plugin registration, reduced-motion helpers, shared scroll-reveal setup.
- `index.html` — **rewritten from scratch**: the 7-beat scroll narrative.
- `projects.html` — **rewritten from scratch**: filter grid.
- `reach.html` — **rewritten from scratch**: split hero + channel cards.
- `projects/banana.html` — new placeholder page for Banana / Peel 1.
- `tests/bubble-layout.test.js` — unit test for bubble-placement algorithm.
- `tests/easing.test.js` — unit test for sqrt-curve easing.
- `scripts/dev-serve.sh` — one-liner to serve locally for browser QA.
- `src/bubble-layout.js` — pure ES module exporting the collision-free placement algorithm (imported by `shared.js` and `tests/`).
- `src/easing.js` — pure ES module exporting the sqrt easing curve.

**Files modified:**

- 18 files in `hobbies/*.html` — swap nav + footer markup, swap stylesheet link.
- 10 files in `projects/*.html` — same sweep.

**Files deleted:**

- `index.html.new` (stale draft)
- `style.css.new` (stale draft)

---

# Phase 1 — Foundation

Goal: new design system live across all 30+ pages. No scroll narrative yet. Shippable at end of phase.

---

### Task 1: Baseline cleanup + snapshot

**Files:**
- Delete: `index.html.new`, `style.css.new`

- [ ] **Step 1: Snapshot current index.html (for reference during rewrite)**

```bash
cp index.html index.html.snapshot-before-overhaul
```

- [ ] **Step 2: Delete stale drafts**

```bash
rm index.html.new style.css.new
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Remove stale .new drafts, snapshot current index for reference"
```

---

### Task 2: Write design tokens + base styles

**Files:**
- Rewrite: `style.css`

- [ ] **Step 1: Replace `style.css` contents with design tokens + reset**

```css
/* =======================================================
   whatthenash.com — Premium Light design system
   ======================================================= */

:root {
  /* palette */
  --canvas:     #FAFAF7;
  --surface:    #FFFFFF;
  --ink:        #0A0A0A;
  --ink-muted:  #525252;
  --ink-faint:  #737373;
  --border:     #E5E5E5;
  --sage:       #6B8E68;
  --sage-soft:  rgba(107, 142, 104, 0.12);
  --warm:       #D4A574;

  /* spacing (8px base) */
  --sp-1:  4px;
  --sp-2:  8px;
  --sp-3:  12px;
  --sp-4:  16px;
  --sp-5:  24px;
  --sp-6:  32px;
  --sp-7:  48px;
  --sp-8:  64px;
  --sp-9:  96px;
  --sp-10: 128px;
  --sp-11: 192px;

  /* radius */
  --r-sm: 8px;
  --r-md: 16px;
  --r-lg: 24px;

  /* shadow */
  --sh-rest:  0 1px 3px rgba(10,10,10,0.03);
  --sh-hover: 0 20px 60px rgba(10,10,10,0.08);
  --sh-float: 0 8px 30px rgba(10,10,10,0.12);

  /* motion */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --dur-micro:   250ms;
  --dur-ui:      450ms;
  --dur-reveal:  800ms;
}

/* reset */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--canvas);
  color: var(--ink);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}
img, svg { display: block; max-width: 100%; }
a { color: inherit; text-decoration: none; }
button { font: inherit; color: inherit; background: none; border: none; cursor: pointer; }
:focus-visible { outline: 2px solid var(--sage); outline-offset: 4px; border-radius: 4px; }

/* reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: Open `style.css` in a browser preview via any existing page; confirm no syntax errors**

```bash
# quickest check
python3 -c "import re; open('style.css').read()" && echo OK
```

Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "Add design tokens, resets, reduced-motion handling"
```

---

### Task 3: Typography + layout utilities

**Files:**
- Append to: `style.css`

- [ ] **Step 1: Append typography + layout classes to `style.css`**

```css
/* =======================================================
   Typography
   ======================================================= */

h1, h2, h3, h4 { line-height: 1.12; letter-spacing: -0.03em; color: var(--ink); }

.display-xl { font-size: clamp(3rem, 7vw, 5rem);    font-weight: 800; letter-spacing: -0.04em; line-height: 1.02; }
.display-l  { font-size: clamp(2.2rem, 4.5vw, 3.2rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; }
.heading    { font-size: clamp(1.3rem, 2.5vw, 1.5rem); font-weight: 700; letter-spacing: -0.02em; }

.body-l { font-size: 1.05rem; line-height: 1.75; color: var(--ink-muted); }
.body   { font-size: 1rem;    line-height: 1.65; color: var(--ink-muted); }

.serif-italic {
  font-family: 'Instrument Serif', Georgia, serif;
  font-style: italic;
  font-weight: 400;
  letter-spacing: -0.01em;
}

.eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: var(--sage);
}

.caption {
  font-size: 0.78rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ink-faint);
}

/* =======================================================
   Layout
   ======================================================= */

.container { max-width: 1200px; margin: 0 auto; padding: 0 var(--sp-5); }

main { display: block; }
section { padding: var(--sp-9) 0; }

.reveal { opacity: 0; transform: translateY(30px); }

@media (max-width: 768px) {
  section { padding: var(--sp-8) 0; }
  .container { padding: 0 var(--sp-4); }
}
```

- [ ] **Step 2: Commit**

```bash
git add style.css
git commit -m "Add typography scale + layout utilities"
```

---

### Task 4: Shared nav — markup, CSS, JS

**Files:**
- Append to: `style.css`
- Create: `shared.js`

- [ ] **Step 1: Append nav CSS to `style.css`**

```css
/* =======================================================
   Nav
   ======================================================= */

.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  padding: var(--sp-3) var(--sp-5);
  background: rgba(250, 250, 247, 0.8);
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  border-bottom: 1px solid rgba(229, 229, 229, 0.5);
  transition: transform var(--dur-ui) var(--ease-out);
}

.nav-inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; justify-content: space-between; align-items: center;
  gap: var(--sp-5);
}

.nav-logo {
  display: inline-flex; align-items: center; gap: var(--sp-2);
  font-weight: 800; letter-spacing: -0.03em; font-size: 1.125rem;
  color: var(--ink);
}

.nav-head {
  width: 32px; height: 32px;
  --poster-color: transparent;
}

.nav-links {
  display: flex; gap: var(--sp-5);
  list-style: none;
}

.nav-links a {
  position: relative;
  font-size: 0.88rem; font-weight: 500; color: var(--ink-muted);
  transition: color var(--dur-micro) var(--ease-out);
}
.nav-links a::after {
  content: ''; position: absolute; bottom: -4px; left: 0;
  width: 0; height: 2px; background: var(--sage); border-radius: 1px;
  transition: width var(--dur-micro) var(--ease-out);
}
.nav-links a:hover, .nav-links a[aria-current="page"] { color: var(--ink); }
.nav-links a:hover::after, .nav-links a[aria-current="page"]::after { width: 100%; }

.nav-hamburger { display: none; width: 28px; height: 20px; position: relative; z-index: 1001; }
.nav-hamburger span {
  position: absolute; left: 0; width: 100%; height: 2px; background: var(--ink);
  border-radius: 1px; transition: all var(--dur-micro) var(--ease-out);
}
.nav-hamburger span:nth-child(1) { top: 0; }
.nav-hamburger span:nth-child(2) { top: 9px; }
.nav-hamburger span:nth-child(3) { top: 18px; }
.nav-hamburger.active span:nth-child(1) { top: 9px; transform: rotate(45deg); }
.nav-hamburger.active span:nth-child(2) { opacity: 0; }
.nav-hamburger.active span:nth-child(3) { top: 9px; transform: rotate(-45deg); }

@media (max-width: 768px) {
  .nav-links {
    position: fixed; inset: 0;
    background: rgba(250, 250, 247, 0.98);
    backdrop-filter: blur(20px);
    flex-direction: column; justify-content: center; align-items: center; gap: var(--sp-6);
    opacity: 0; pointer-events: none;
    transition: opacity var(--dur-ui) var(--ease-out);
  }
  .nav-links.mobile-open { opacity: 1; pointer-events: auto; }
  .nav-links.mobile-open a { font-size: 1.4rem; font-weight: 600; color: var(--ink); }
  .nav-links.mobile-open a::after { display: none; }
  .nav-hamburger { display: block; }
}
```

- [ ] **Step 2: Create `shared.js` with hamburger handler**

```js
/* shared.js — loaded on every page */

/* ---- hamburger ---- */
(function initHamburger() {
  const btn = document.querySelector('.nav-hamburger');
  const menu = document.querySelector('.nav-links');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('active');
    menu.classList.toggle('mobile-open', open);
    btn.setAttribute('aria-expanded', open);
  });
})();

/* ---- reduced-motion helper ---- */
export const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

- [ ] **Step 3: Document the canonical nav snippet for copy-paste into pages**

Create file `docs/superpowers/plans/_nav-snippet.html` (reference only, not served):

```html
<nav class="nav">
  <div class="nav-inner">
    <a href="/" class="nav-logo">
      <model-viewer src="/assets/Face.glb" auto-rotate disable-zoom class="nav-head" alt="Nash"></model-viewer>
      <span>Nash</span>
    </a>
    <ul class="nav-links">
      <li><a href="/projects.html">Projects</a></li>
      <li><a href="/#hobbies">Hobbies</a></li>
      <li><a href="/#about">About</a></li>
      <li><a href="/reach.html">Reach</a></li>
    </ul>
    <button class="nav-hamburger" aria-label="Menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
```

- [ ] **Step 4: Commit**

```bash
git add style.css shared.js docs/superpowers/plans/_nav-snippet.html
git commit -m "Add shared nav component — CSS + hamburger JS + reference snippet"
```

---

### Task 5: Shared footer

**Files:**
- Append to: `style.css`

- [ ] **Step 1: Append footer CSS**

```css
/* =======================================================
   Footer
   ======================================================= */

.footer {
  padding: var(--sp-9) 0 var(--sp-7);
  text-align: center;
  border-top: 1px solid var(--border);
  margin-top: var(--sp-7);
}
.footer-links {
  display: flex; justify-content: center; flex-wrap: wrap;
  gap: var(--sp-6);
  margin-bottom: var(--sp-5);
}
.footer-links a {
  font-size: 0.88rem; font-weight: 500; color: var(--ink-muted);
  transition: color var(--dur-micro) var(--ease-out);
}
.footer-links a:hover { color: var(--ink); }
.footer-copy { font-size: 0.78rem; color: var(--ink-faint); letter-spacing: 0.01em; }
```

- [ ] **Step 2: Document the canonical footer snippet**

Create `docs/superpowers/plans/_footer-snippet.html`:

```html
<footer class="footer">
  <div class="footer-links">
    <a href="/projects.html">Projects</a>
    <a href="/#hobbies">Hobbies</a>
    <a href="/#about">About</a>
    <a href="/reach.html">Reach</a>
    <a href="https://github.com/GR3ATB0B" target="_blank" rel="noopener">GitHub</a>
  </div>
  <div class="footer-copy">© 2026 Nash · whatthenash.com · built with curiosity</div>
</footer>
```

- [ ] **Step 3: Commit**

```bash
git add style.css docs/superpowers/plans/_footer-snippet.html
git commit -m "Add shared footer component"
```

---

### Task 6: Button + card + progress components

**Files:**
- Append to: `style.css`

- [ ] **Step 1: Append button/card/progress CSS**

```css
/* =======================================================
   Buttons
   ======================================================= */

.btn {
  display: inline-flex; align-items: center; gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-5);
  border-radius: 999px;
  font-weight: 600; font-size: 0.9rem;
  transition: transform var(--dur-micro) var(--ease-out),
              box-shadow var(--dur-micro) var(--ease-out),
              background var(--dur-micro) var(--ease-out);
  border: 1.5px solid transparent;
}
.btn-primary { background: var(--ink); color: var(--canvas); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: var(--sh-float); color: var(--canvas); }
.btn-ghost { background: var(--canvas); color: var(--ink); border-color: var(--border); }
.btn-ghost:hover { background: var(--surface); border-color: var(--ink); }
.btn-sage { background: var(--sage); color: var(--surface); }
.btn-sage:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(107,142,104,0.3); }

/* =======================================================
   Card
   ======================================================= */

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  padding: var(--sp-6);
  box-shadow: var(--sh-rest);
  transition: transform var(--dur-ui) var(--ease-out),
              box-shadow var(--dur-ui) var(--ease-out),
              border-color var(--dur-ui) var(--ease-out);
}
.card:hover {
  transform: translateY(-6px);
  box-shadow: var(--sh-hover);
  border-color: rgba(107, 142, 104, 0.2);
}

/* =======================================================
   Progress + badge
   ======================================================= */

.progress {
  width: 100%; height: 5px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--sage), #4e6f4b);
  border-radius: 3px;
  transition: width 1s var(--ease-out);
}
.progress-label {
  font-size: 0.72rem; color: var(--ink-faint);
  margin-top: var(--sp-2); font-weight: 500;
}
.badge-complete {
  display: inline-block;
  background: var(--sage-soft); color: var(--sage);
  font-size: 0.72rem; font-weight: 700;
  padding: var(--sp-1) var(--sp-3);
  border-radius: 999px;
  text-transform: uppercase; letter-spacing: 0.06em;
}
```

- [ ] **Step 2: Commit**

```bash
git add style.css
git commit -m "Add button, card, progress, badge components"
```

---

### Task 7: Pure JS module — sqrt easing

**Files:**
- Create: `src/easing.js`
- Create: `tests/easing.test.js`

- [ ] **Step 1: Write the failing test**

```js
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
```

- [ ] **Step 2: Run test, verify failure**

```bash
node --test tests/easing.test.js
```

Expected: fails with `Cannot find module '../src/easing.js'`.

- [ ] **Step 3: Write minimal implementation**

```js
// src/easing.js

/**
 * Square-root easing. Fast initial velocity, smooth asymptote.
 * f(0) = 0, f(1) = 1, derivative at 0 = +infinity, derivative at 1 = 0.5.
 */
export function easeSqrt(t) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return Math.sqrt(t);
}
```

- [ ] **Step 4: Run tests, verify pass**

```bash
node --test tests/easing.test.js
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/easing.js tests/easing.test.js
git commit -m "Add sqrt-curve easing function with tests"
```

---

### Task 8: Pure JS module — bubble layout (collision-free placement)

**Files:**
- Create: `src/bubble-layout.js`
- Create: `tests/bubble-layout.test.js`

- [ ] **Step 1: Write the failing test**

```js
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
```

- [ ] **Step 2: Run test, verify failure**

```bash
node --test tests/bubble-layout.test.js
```

Expected: fails with module not found.

- [ ] **Step 3: Write minimal implementation**

```js
// src/bubble-layout.js

/**
 * Places `sizes` circles inside a container with no overlaps.
 * Returns [{ x, y, size }] in the same order as the input.
 *
 * @param {number[]} sizes        Diameter of each bubble, in px.
 * @param {number}   containerW   Container width in px.
 * @param {number}   containerH   Container height in px.
 * @param {() => number} [rng]    Optional RNG returning [0,1). Defaults to Math.random.
 * @param {number}   [padding=8]  Minimum pixel gap between bubble edges.
 * @param {number}   [maxAttempts=300] Max placement attempts per bubble.
 */
export function layoutBubbles(sizes, containerW, containerH, rng = Math.random, padding = 8, maxAttempts = 300) {
  const placed = [];
  for (const size of sizes) {
    let x = 0, y = 0, ok = false;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      x = rng() * Math.max(0, containerW - size);
      y = rng() * Math.max(0, containerH - size);
      if (!collides({ x, y, size }, placed, padding)) { ok = true; break; }
    }
    // Fallback: pack to the nearest available corner if we never found a slot.
    if (!ok) { x = Math.min(x, containerW - size); y = Math.min(y, containerH - size); }
    placed.push({ x, y, size });
  }
  return placed;
}

function collides(b, others, padding) {
  const bx = b.x + b.size / 2, by = b.y + b.size / 2;
  for (const p of others) {
    const px = p.x + p.size / 2, py = p.y + p.size / 2;
    const dx = bx - px, dy = by - py;
    if (Math.hypot(dx, dy) < (b.size / 2 + p.size / 2 + padding)) return true;
  }
  return false;
}
```

- [ ] **Step 4: Run tests, verify pass**

```bash
node --test tests/bubble-layout.test.js
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/bubble-layout.js tests/bubble-layout.test.js
git commit -m "Add collision-free bubble layout algorithm with tests"
```

---

### Task 9: Local dev server helper

**Files:**
- Create: `scripts/dev-serve.sh`

- [ ] **Step 1: Write the server script**

```bash
#!/usr/bin/env bash
# scripts/dev-serve.sh — serve the site locally for browser QA.
# Usage: scripts/dev-serve.sh [port]
set -e
PORT="${1:-8000}"
cd "$(dirname "$0")/.."
echo "Serving whatthenash.com at http://localhost:${PORT}"
python3 -m http.server "${PORT}"
```

- [ ] **Step 2: Make it executable + smoke-test**

```bash
chmod +x scripts/dev-serve.sh
# Start server in background, curl index, kill. Proves the script serves files.
scripts/dev-serve.sh 8765 &
SERVER_PID=$!
sleep 1
curl -sf http://localhost:8765/ > /dev/null && echo "serve OK" || echo "serve FAIL"
kill $SERVER_PID
```

Expected: `serve OK`.

- [ ] **Step 3: Commit**

```bash
git add scripts/dev-serve.sh
git commit -m "Add local dev server script for browser QA"
```

---

### Task 10: Migrate hobby pages to new design system

**Files:**
- Modify all 18 files in `hobbies/*.html`

- [ ] **Step 1: Inspect the current structure of one hobby page**

```bash
head -40 hobbies/photography.html
```

Note the existing `<head>` and body structure — we will preserve the *content* (below nav, above footer) and only replace nav, footer, and stylesheet reference.

- [ ] **Step 2: Define the canonical head for all subpages**

Every subpage's `<head>` becomes:

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{PAGE TITLE}} — Nash</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🍌%3C/text%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Instrument+Serif:ital@1&display=swap" rel="stylesheet">
  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></script>
  <link rel="stylesheet" href="/style.css">
</head>
```

- [ ] **Step 3: Write a one-page migration on `hobbies/photography.html`**

Keep the existing content (titles, paragraphs, galleries). Replace only:
- `<head>` → canonical head above with title "Photography"
- Opening nav (whatever it currently is) → `_nav-snippet.html`
- Closing footer → `_footer-snippet.html`
- Body end script: add `<script type="module" src="/shared.js"></script>` immediately before `</body>`

- [ ] **Step 4: Browser verify**

```bash
scripts/dev-serve.sh 8000 &
```

Visit `http://localhost:8000/hobbies/photography.html`. Verify:
- Nav appears fixed at top with banana favicon + "Nash" wordmark + 32px rotating 3D head
- Hobby content displays with new Inter font
- Footer is present with link row + copyright
- Hamburger shows + opens on mobile width (resize browser)

Kill the server.

- [ ] **Step 5: Apply the same migration to the remaining 17 hobby pages**

Pages: `3d-printing.html`, `ai.html`, `camping.html`, `coding.html`, `electronics.html`, `flower-making.html`, `fly-fishing.html`, `forging.html`, `lego.html`, `magic.html`, `math.html`, `music.html`, `rc.html`, `reading.html`, `spanish-languages.html`, `thrifting.html`, `weightlifting.html`.

For each, use the title from the existing page's `<h1>` or filename-derived title.

- [ ] **Step 6: Browser verify every page loads without layout break**

```bash
scripts/dev-serve.sh 8000 &
for page in hobbies/*.html; do
  echo "Checking $page..."
  curl -sf "http://localhost:8000/$page" > /dev/null && echo "  ✓" || echo "  ✗ FAIL"
done
```

Expected: all 18 show `✓`.

- [ ] **Step 7: Commit**

```bash
git add hobbies/
git commit -m "Migrate all 18 hobby pages to new design system"
```

---

### Task 11: Migrate project detail pages to new design system

**Files:**
- Modify all 10 files in `projects/*.html`

- [ ] **Step 1: Apply the Task 10 migration to each project detail page**

Pages: `ares-ii.html`, `bio.html`, `bob.html`, `house-point-counter.html`, `project1.html`, `project2.html`, `project3.html`, `project4.html`, `project5.html`, `skystream.html`.

Each gets the canonical `<head>`, nav snippet, footer snippet, and `<script type="module" src="/shared.js"></script>`.

- [ ] **Step 2: Browser verify each page**

```bash
scripts/dev-serve.sh 8000 &
for page in projects/*.html; do
  curl -sf "http://localhost:8000/$page" > /dev/null && echo "$page ✓" || echo "$page ✗"
done
```

Expected: all 10 `✓`.

- [ ] **Step 3: Commit**

```bash
git add projects/
git commit -m "Migrate all 10 project detail pages to new design system"
```

---

### Task 12: Create Banana / Peel 1 placeholder project page

**Files:**
- Create: `projects/banana.html`

- [ ] **Step 1: Write the placeholder page**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Banana / Peel 1 — Nash</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🍌%3C/text%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Instrument+Serif:ital@1&display=swap" rel="stylesheet">
  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></script>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <!-- PASTE CANONICAL NAV (see docs/superpowers/plans/_nav-snippet.html) -->

  <main class="container" style="padding-top: 160px; padding-bottom: 120px; max-width: 760px;">
    <div class="caption" style="margin-bottom: var(--sp-3);">← <a href="/projects.html">Projects</a></div>
    <h1 class="display-l">Banana <span class="serif-italic">/ Peel 1</span></h1>
    <p class="body-l" style="margin-top: var(--sp-5); max-width: 600px;">
      The company I'm building. Peel 1 is the first app — iOS, launching soon. More details coming.
    </p>
    <div style="margin-top: var(--sp-7); padding: var(--sp-7); background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); text-align: center;">
      <div style="font-size: 2.5rem;">🍌</div>
      <p class="body" style="margin-top: var(--sp-4);">Work in progress. Check back soon.</p>
    </div>
  </main>

  <!-- PASTE CANONICAL FOOTER -->
  <script type="module" src="/shared.js"></script>
</body>
</html>
```

Replace the two comment markers with the actual nav and footer snippets from `docs/superpowers/plans/_nav-snippet.html` and `_footer-snippet.html`.

- [ ] **Step 2: Browser verify**

Open `http://localhost:8000/projects/banana.html`. Confirm typography, nav, footer all render correctly.

- [ ] **Step 3: Commit**

```bash
git add projects/banana.html
git commit -m "Add Banana / Peel 1 placeholder project page"
```

---

### Task 13: Phase 1 deploy checkpoint

**Files:**
- None (deploy step)

- [ ] **Step 1: Run all tests**

```bash
node --test tests/*.test.js
```

Expected: all pass.

- [ ] **Step 2: Browser sweep — every page loads, no console errors**

Start dev server. Open each of: `/`, `/projects.html`, `/reach.html`, one hobby, one project page. At this point `index.html`, `projects.html`, and `reach.html` are still their *old* selves — that's expected. Verify the 28 subpages look consistent with the new system.

Note: `index.html` will still look old until Phase 2. That is OK — Phase 1 ships the design system to subpages only.

- [ ] **Step 3: Git status + push**

```bash
git status
git log --oneline -15
git push origin main
```

Verify GitHub Pages deploys (wait ~60s, hit https://whatthenash.com). If push fails with 403, use the `gh api` workaround from repo history.

- [ ] **Step 4: Tag the phase 1 completion**

```bash
git tag phase-1-foundation
git push origin phase-1-foundation
```

---

# Phase 2 — Homepage Scroll Narrative

Goal: `index.html` has the 7-beat scroll narrative with the head-explosion signature moment. Shippable at end of phase.

---

### Task 14: New index.html skeleton with 7 empty beats

**Files:**
- Rewrite: `index.html`
- Append to: `style.css`

- [ ] **Step 1: Append index-specific CSS scaffolding**

```css
/* =======================================================
   index.html — scroll narrative
   ======================================================= */

/* Beat 01 — Hero */
.hero {
  min-height: 100vh;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: var(--sp-9) var(--sp-5) var(--sp-7);
  position: relative;
}
.hero-head {
  width: 360px; height: 360px;
  margin-bottom: var(--sp-6);
  --poster-color: transparent;
}
.hero .eyebrow { margin-bottom: var(--sp-4); }
.hero h1 { margin-bottom: var(--sp-3); }
.hero-subtitle { font-size: clamp(1.2rem, 2.2vw, 1.5rem); color: var(--ink-muted); max-width: 540px; }
.hero-scroll-hint {
  position: absolute; bottom: var(--sp-6); left: 50%; transform: translateX(-50%);
  font-size: 0.72rem; color: var(--ink-faint); letter-spacing: 0.18em;
}

/* Beat 03 — Manifesto */
.manifesto {
  min-height: 100vh;
  display: flex; align-items: center;
  position: relative; overflow: hidden;
}
.manifesto-inner { max-width: 900px; padding: 0 var(--sp-5); position: relative; z-index: 2; }
.manifesto h2 { margin-top: var(--sp-4); }
.manifesto-bg { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
.manifesto-bg .blob {
  position: absolute; border-radius: var(--r-md);
}
.manifesto-bg .blob-sage  { top: 20%;  right: 10%; width: 140px; height: 140px; background: var(--sage); opacity: 0.18; border-radius: 50%; }
.manifesto-bg .blob-warm  { bottom: 15%; left: 8%;  width: 110px; height: 160px; background: var(--warm); opacity: 0.22; }
.manifesto-bg .blob-cream { top: 45%;  right: 30%; width: 90px;  height: 90px;  background: var(--border); opacity: 0.6; }

/* Beat 04 — Explosion + bubble cluster */
.explosion {
  min-height: 110vh;
  position: relative;
}
.explosion-stage {
  position: relative;
  width: 100%; max-width: 1100px; margin: 0 auto;
  height: 720px;
}
#explosion-head {
  position: absolute; left: 50%; top: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 250px; height: 250px;
  --poster-color: transparent;
}
.hobby-bubble {
  position: absolute;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: var(--surface);
  border: 1.5px solid var(--border);
  color: var(--ink);
  font-weight: 600; font-size: 0.82rem;
  text-align: center; padding: var(--sp-2); line-height: 1.2;
  text-decoration: none;
  transition: transform var(--dur-micro) var(--ease-out),
              box-shadow var(--dur-micro) var(--ease-out),
              border-color var(--dur-micro) var(--ease-out);
  transform: scale(0);
}
.hobby-bubble.current {
  background: var(--sage); color: var(--surface); border-color: #4e6f4b; font-weight: 700;
}
.hobby-bubble:hover {
  transform: scale(1.12) !important;
  box-shadow: var(--sh-float);
  border-color: var(--sage);
}

/* Beat 05 — Horizontal rail */
.rail-pin { height: 100vh; display: flex; align-items: center; overflow: hidden; }
.rail-inner { display: flex; gap: var(--sp-5); padding-left: var(--sp-6); will-change: transform; }
.rail-card {
  flex: 0 0 380px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  padding: var(--sp-6);
  box-shadow: var(--sh-rest);
  transition: transform var(--dur-ui) var(--ease-out), box-shadow var(--dur-ui) var(--ease-out);
}
.rail-card:hover { transform: translateY(-6px); box-shadow: var(--sh-hover); }
.rail-card-image {
  aspect-ratio: 4/3;
  border-radius: var(--r-sm);
  background: linear-gradient(135deg, var(--border), var(--canvas));
  margin-bottom: var(--sp-4);
}
.rail-card h3 { margin-bottom: var(--sp-2); }
.rail-card .desc { color: var(--ink-muted); font-size: 0.9rem; margin-bottom: var(--sp-4); min-height: 2.6em; }

/* Beat 06 — About + graduation */
.about-section { padding: var(--sp-9) 0; }
.graduation {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: var(--sp-9) var(--sp-7);
  text-align: center;
  max-width: 780px; margin: 0 auto var(--sp-8);
  box-shadow: var(--sh-rest);
}
.graduation-icon { font-size: 3rem; margin-bottom: var(--sp-4); }
.graduation-story { max-width: 560px; margin: 0 auto var(--sp-7); color: var(--ink-muted); font-size: 1.05rem; }
.graduation-ctas { display: flex; gap: var(--sp-3); justify-content: center; flex-wrap: wrap; }
.stats {
  display: flex; gap: var(--sp-9); justify-content: center;
  padding-top: var(--sp-6); border-top: 1px solid var(--border);
  max-width: 780px; margin: 0 auto;
}
.stat-num { font-size: 2.8rem; font-weight: 800; color: var(--sage); line-height: 1; letter-spacing: -0.03em; }
.stat-lbl { font-size: 0.78rem; color: var(--ink-faint); margin-top: var(--sp-2); text-transform: uppercase; letter-spacing: 0.08em; }

@media (max-width: 768px) {
  .hero-head { width: 260px; height: 260px; }
  #explosion-head { width: 160px; height: 160px; }
  .explosion-stage { height: 560px; }
  .rail-card { flex: 0 0 280px; }
  .graduation { padding: var(--sp-7) var(--sp-5); margin: 0 var(--sp-4) var(--sp-7); }
  .stats { gap: var(--sp-6); }
}
```

- [ ] **Step 2: Rewrite `index.html` with empty beats**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>What The Nash!</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🍌%3C/text%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Instrument+Serif:ital@1&display=swap">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Instrument+Serif:ital@1&display=swap" rel="stylesheet">
  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/lenis@1.1/dist/lenis.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/CustomEase.min.js"></script>
  <link rel="stylesheet" href="/style.css">
</head>
<body>

<!-- PASTE CANONICAL NAV -->

<main>
  <section class="hero" id="hero"><!-- Beat 01 --></section>
  <section class="manifesto" id="manifesto"><!-- Beat 03 --></section>
  <section class="explosion" id="explosion"><!-- Beat 04 --></section>
  <section class="rail-pin" id="rail"><!-- Beat 05 --></section>
  <section class="about-section" id="about"><!-- Beat 06 --></section>
</main>

<!-- PASTE CANONICAL FOOTER -->

<script type="module" src="/shared.js"></script>
<script type="module" src="/index.js"></script>
</body>
</html>
```

Paste the nav + footer snippets into place.

- [ ] **Step 3: Create empty `index.js` (beats filled in subsequent tasks)**

```js
// index.js — homepage scroll narrative
import './shared.js';
```

- [ ] **Step 4: Browser verify blank skeleton loads without error**

Visit `/`. Expect: nav + footer rendered, empty content area, no console errors.

- [ ] **Step 5: Commit**

```bash
git add index.html index.js style.css
git commit -m "Rewrite index.html skeleton with 7 empty beats + scroll engine"
```

---

### Task 15: Beat 01 — Hero

**Files:**
- Modify: `index.html` (fill `#hero` section)

- [ ] **Step 1: Fill the `<section class="hero">` with markup**

Replace `<section class="hero" id="hero"><!-- Beat 01 --></section>` with:

```html
<section class="hero" id="hero">
  <div class="eyebrow">Auburn '26 · Builder</div>
  <model-viewer
    class="hero-head"
    src="/assets/Face.glb"
    auto-rotate
    camera-controls
    disable-zoom
    rotation-per-second="30deg"
    alt="3D model of Nash's face"
  ></model-viewer>
  <h1 class="display-xl">Hey, I'm Nash.</h1>
  <p class="hero-subtitle"><span class="serif-italic">builder of things. explorer of ideas.</span></p>
  <div class="hero-scroll-hint">↓ SCROLL</div>
</section>
```

- [ ] **Step 2: Browser verify**

Visit `/`. Check:
- Head renders + auto-rotates
- Eyebrow in sage, uppercase
- "Hey, I'm Nash." renders in Inter 800 bold
- Subtitle is italic serif
- Hint visible at bottom

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Implement Beat 01 — hero with 3D head and manifesto type"
```

---

### Task 16: Beat 02 — Head morph (scroll-scrubbed)

**Files:**
- Modify: `index.js`
- Modify: `index.html` (hide nav head initially)

- [ ] **Step 1: Add inline style to hide the nav `model-viewer` until morph completes**

In the nav snippet inside `index.html`, add `id="nav-head"` and style `visibility: hidden; opacity: 0;` to the `model-viewer` inside `.nav-logo`:

```html
<a href="/" class="nav-logo">
  <model-viewer id="nav-head" src="/assets/Face.glb" auto-rotate disable-zoom class="nav-head"
                style="visibility: hidden; opacity: 0;" alt="Nash"></model-viewer>
  <span>Nash</span>
</a>
```

Also add an `id="nav"` to the `<nav class="nav">` element if not already present.

- [ ] **Step 2: Add head-morph script to `index.js`**

```js
// index.js
import './shared.js';
import { prefersReducedMotion } from './shared.js';

gsap.registerPlugin(ScrollTrigger);

const heroHead = document.querySelector('.hero-head');
const navHead  = document.getElementById('nav-head');
const navEl    = document.getElementById('nav');

/* ---------- Beat 02 — Head morph ---------- */
(function setupHeadMorph() {
  if (!heroHead || !navHead || !navEl) return;

  if (prefersReducedMotion) {
    // Snap to final state — nav head visible, hero head gone.
    navHead.style.visibility = 'visible';
    navHead.style.opacity = '1';
    heroHead.style.opacity = '0';
    return;
  }

  // Start with nav nav nav hidden, hero head full size.
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate(self) {
      const p = self.progress; // 0 → 1 as you scroll past the hero
      // Hero head shrinks + fades out
      gsap.set(heroHead, {
        scale: 1 - p * 0.92,   // 1 → ~0.08 (visual), but we fade earlier
        opacity: 1 - p * 1.4,
        yPercent: -p * 30,
      });
      // Nav head fades in starting at p = 0.65
      const navP = Math.max(0, (p - 0.65) / 0.35);
      navHead.style.visibility = navP > 0 ? 'visible' : 'hidden';
      navHead.style.opacity = String(navP);
      // Nav bar itself fades in
      gsap.set(navEl, { opacity: Math.max(p, 0.0), y: (1 - p) * -8 });
    },
  });

  // Initial state
  gsap.set(navEl, { opacity: 0, y: -8 });
})();
```

- [ ] **Step 3: Browser verify**

Visit `/`. Slowly scroll from top:
- Nav bar starts invisible, fades in as you scroll past the hero
- Hero head shrinks + fades out
- Nav head (small) fades in once hero is ~⅔ off-screen
- Scroll back up: reverses smoothly

- [ ] **Step 4: Reduced-motion verify**

In browser devtools, enable "Emulate CSS media feature prefers-reduced-motion: reduce". Reload. Expect: nav visible immediately, nav head visible, hero head hidden. No scroll animation.

- [ ] **Step 5: Commit**

```bash
git add index.html index.js
git commit -m "Implement Beat 02 — head morph from hero to nav logo"
```

---

### Task 17: Beat 03 — Manifesto (pinned) with parallax

**Files:**
- Modify: `index.html`
- Modify: `index.js`

- [ ] **Step 1: Fill the manifesto section markup**

Replace `<section class="manifesto" id="manifesto"><!-- Beat 03 --></section>` with:

```html
<section class="manifesto" id="manifesto">
  <div class="manifesto-bg" aria-hidden="true">
    <div class="blob blob-sage"  data-parallax="0.3"></div>
    <div class="blob blob-warm"  data-parallax="0.55"></div>
    <div class="blob blob-cream" data-parallax="0.75"></div>
  </div>
  <div class="manifesto-inner container">
    <div class="eyebrow">01 / What I do</div>
    <h2 class="display-xl reveal">I build things.</h2>
    <h2 class="display-xl serif-italic reveal" style="margin-top: var(--sp-2);">because I can't help it.</h2>
  </div>
</section>
```

- [ ] **Step 2: Add pin + parallax + reveal script to `index.js`**

Append to `index.js`:

```js
/* ---------- Beat 03 — Manifesto pin + parallax + reveal ---------- */
(function setupManifesto() {
  const section = document.querySelector('#manifesto');
  if (!section) return;

  const reveals = section.querySelectorAll('.reveal');
  if (prefersReducedMotion) {
    reveals.forEach(r => { r.style.opacity = '1'; r.style.transform = 'none'; });
    return;
  }

  // Pin the section briefly so the reveal gets to play
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: '+=80%',
    pin: true,
    pinSpacing: true,
  });

  // Line-by-line reveal on entry
  gsap.to(reveals, {
    opacity: 1,
    y: 0,
    duration: 0.9,
    stagger: 0.18,
    ease: 'power3.out',
    scrollTrigger: { trigger: section, start: 'top 80%' },
  });

  // Parallax blobs — each element moves a fraction of scroll distance
  section.querySelectorAll('[data-parallax]').forEach(el => {
    const speed = parseFloat(el.dataset.parallax);
    gsap.to(el, {
      y: () => window.innerHeight * speed * -0.5,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
})();
```

- [ ] **Step 3: Browser verify**

- Scroll into manifesto: section pins
- Headlines reveal staggered (first, then italic line)
- Background blobs drift at different speeds as you scroll
- Unpins after ~80% of viewport and lets next section in

- [ ] **Step 4: Commit**

```bash
git add index.html index.js
git commit -m "Implement Beat 03 — manifesto pin with parallax + line reveal"
```

---

### Task 18: Beat 04 — Head explosion signature moment

**Files:**
- Modify: `index.html`
- Modify: `index.js`
- Create: `data/hobbies.js`

- [ ] **Step 1: Extract hobby data to its own module**

Create `data/hobbies.js`:

```js
// data/hobbies.js
export const HOBBIES = [
  { name: "Product Design",           page: "#",                              current: true  },
  { name: "Banana Co",                 page: "/projects/banana.html",          current: true  },
  { name: "Photography",               page: "/hobbies/photography.html"                       },
  { name: "Music",                     page: "/hobbies/music.html"                             },
  { name: "Arduino & Electronics",     page: "/hobbies/electronics.html"                       },
  { name: "Python & Coding",           page: "/hobbies/coding.html"                            },
  { name: "AI",                        page: "/hobbies/ai.html"                                },
  { name: "RC Vehicles",               page: "/hobbies/rc.html"                                },
  { name: "Forging & Metal Casting",   page: "/hobbies/forging.html"                           },
  { name: "3D Printing",               page: "/hobbies/3d-printing.html"                       },
  { name: "Goodwill Hunting",          page: "/hobbies/thrifting.html"                         },
  { name: "Camping",                   page: "/hobbies/camping.html"                           },
  { name: "LEGO",                      page: "/hobbies/lego.html"                              },
  { name: "Weightlifting",             page: "/hobbies/weightlifting.html"                     },
  { name: "Reading",                   page: "/hobbies/reading.html"                           },
  { name: "Fly Fishing",               page: "/hobbies/fly-fishing.html"                       },
  { name: "Magic Tricks",              page: "/hobbies/magic.html"                             },
  { name: "Math",                      page: "/hobbies/math.html"                              },
  { name: "Spanish & Languages",       page: "/hobbies/spanish-languages.html"                 },
  { name: "Flower Making",             page: "/hobbies/flower-making.html"                     },
];
```

- [ ] **Step 2: Fill the explosion section markup**

Replace `<section class="explosion" id="explosion"><!-- Beat 04 --></section>` with:

```html
<section class="explosion" id="explosion">
  <div class="container" style="text-align:center; padding-top: var(--sp-8);">
    <div class="eyebrow">02 / Who I am outside of work</div>
    <h2 class="display-l" style="margin-top: var(--sp-3);">
      18 hobbies. <span class="serif-italic">always learning.</span>
    </h2>
  </div>
  <div class="explosion-stage container" id="explosion-stage">
    <model-viewer
      id="explosion-head"
      src="/assets/Face.glb"
      auto-rotate
      disable-zoom
      alt=""
      aria-hidden="true"
    ></model-viewer>
    <!-- bubbles injected by JS -->
  </div>
</section>
```

- [ ] **Step 3: Append the explosion choreography to `index.js`**

```js
import { HOBBIES } from './data/hobbies.js';
import { layoutBubbles } from './src/bubble-layout.js';

/* ---------- Beat 04 — Head explosion ---------- */
(function setupExplosion() {
  const section = document.querySelector('#explosion');
  const stage   = document.querySelector('#explosion-stage');
  const head    = document.querySelector('#explosion-head');
  if (!section || !stage || !head) return;

  // Register CustomEase (sqrt curve approximation)
  gsap.registerPlugin(CustomEase);
  CustomEase.create('sqrt', 'M0,0 C0.04,0.55 0.15,0.95 1,1');

  // Figure out stage dimensions (runs after layout settles)
  const rect = stage.getBoundingClientRect();
  const W = rect.width;
  const H = rect.height;

  // Build bubbles
  const sizeScale = W < 500 ? 0.7 : 1;
  const sizes = [90, 100, 110, 85, 95, 105, 88, 102, 92, 98, 108, 86, 96, 100, 94, 104, 88, 106]
                  .slice(0, HOBBIES.length).map(s => Math.round(s * sizeScale));

  const positions = layoutBubbles(sizes, W, H);

  const bubbles = HOBBIES.map((h, i) => {
    const el = document.createElement('a');
    el.href = h.page;
    el.className = 'hobby-bubble' + (h.current ? ' current' : '');
    el.textContent = h.name;
    el.style.width  = sizes[i] + 'px';
    el.style.height = sizes[i] + 'px';
    // Start at center of stage (head position)
    el.style.left = `${W / 2 - sizes[i] / 2}px`;
    el.style.top  = `${H / 2 - sizes[i] / 2}px`;
    // Store final position on dataset
    el.dataset.finalX = positions[i].x;
    el.dataset.finalY = positions[i].y;
    stage.appendChild(el);
    return el;
  });

  if (prefersReducedMotion) {
    // Static fallback — just place bubbles at final positions, no explosion.
    bubbles.forEach(el => {
      el.style.left = `${el.dataset.finalX}px`;
      el.style.top  = `${el.dataset.finalY}px`;
      el.style.transform = 'scale(1)';
    });
    head.style.opacity = '0';
    return;
  }

  // Master timeline driven by scroll
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 70%',
      end: 'top 10%',
      scrub: 1.2,
    },
  });

  // Head grows from 0 → 1 as the section enters
  tl.to(head, { scale: 1, duration: 0.25, ease: 'power2.out' }, 0);
  // Brief hold with subtle wobble
  tl.to(head, { rotate: 5, duration: 0.05 }, 0.28);
  tl.to(head, { rotate: -5, duration: 0.05 }, 0.33);
  tl.to(head, { rotate: 0, duration: 0.04 }, 0.38);

  // Explosion: each bubble launches with sqrt easing (fast then slow)
  // AND scales from 0 → 1 on the same curve. No opacity change.
  bubbles.forEach((el, i) => {
    const stagger = Math.random() * 0.05; // 0–50ms within the explosion window
    tl.to(el, {
      left: `${el.dataset.finalX}px`,
      top:  `${el.dataset.finalY}px`,
      scale: 1,
      duration: 0.35,
      ease: 'sqrt',
    }, 0.42 + stagger);
  });

  // Head shell dissolves away (scale to 0) alongside the explosion
  tl.to(head, { scale: 0, duration: 0.25, ease: 'power2.in' }, 0.55);

  // After explosion settles, start idle float (CSS animation added in Step 4)
  ScrollTrigger.create({
    trigger: section,
    start: 'top 5%',
    onEnter: () => bubbles.forEach((el, i) => el.classList.add('floating')),
    onLeaveBack: () => bubbles.forEach(el => el.classList.remove('floating')),
  });
})();
```

- [ ] **Step 4: Append the floating idle CSS**

Append to `style.css`:

```css
/* idle float (applied after explosion settles) */
.hobby-bubble.floating { animation: hobby-float 9s ease-in-out infinite; }
.hobby-bubble.floating:nth-child(3n)  { animation-duration: 11s; animation-delay: -1s; }
.hobby-bubble.floating:nth-child(3n+1){ animation-duration: 13s; animation-delay: -3s; }
.hobby-bubble.floating:nth-child(3n+2){ animation-duration: 10s; animation-delay: -6s; }

@keyframes hobby-float {
  0%, 100% { transform: translate(0, 0); }
  25%      { transform: translate(12px, -14px); }
  50%      { transform: translate(-8px, -10px); }
  75%      { transform: translate(10px, 12px); }
}

@media (prefers-reduced-motion: reduce) {
  .hobby-bubble.floating { animation: none; }
}
```

- [ ] **Step 5: Browser verify — desktop**

Visit `/`. Scroll to Beat 04:
- Section enters → head grows to center + wobbles
- Bubbles burst from head center with sharp-then-smooth motion (sqrt feel)
- Bubbles do NOT fade — they're solid the whole time
- Head shell vanishes
- Bubbles settle + start gentle float
- Scroll back up → plays in reverse

- [ ] **Step 6: Browser verify — mobile (resize to 375px)**

Sizes are reduced by 0.7×. Explosion still plays. Bubbles fit stage. No layout breaking.

- [ ] **Step 7: Reduced-motion verify**

Enable `prefers-reduced-motion` in devtools. Reload. Expect: bubbles appear static at final positions, no explosion, no float.

- [ ] **Step 8: Commit**

```bash
git add index.html index.js style.css data/hobbies.js
git commit -m "Implement Beat 04 — signature head-explosion moment with sqrt easing"
```

---

### Task 19: Beat 05 — Horizontal projects rail

**Files:**
- Modify: `index.html`
- Modify: `index.js`

- [ ] **Step 1: Fill the rail section markup**

Replace `<section class="rail-pin" id="rail"><!-- Beat 05 --></section>` with:

```html
<section class="rail-pin" id="rail">
  <div class="rail-inner" id="rail-inner">
    <div style="flex: 0 0 auto; width: 30vw; max-width: 420px; padding-right: var(--sp-5);">
      <div class="eyebrow">03 / What I've built</div>
      <h2 class="display-l" style="margin-top: var(--sp-3);">
        25 projects. <span class="serif-italic">scroll sideways →</span>
      </h2>
    </div>
    <a class="rail-card" href="/projects/banana.html">
      <div class="rail-card-image" style="background: linear-gradient(135deg, var(--warm), #f4d9b2);"></div>
      <h3 class="heading">Banana / Peel 1</h3>
      <p class="desc">The company I'm building. iOS app — launching soon.</p>
      <span class="badge-complete" style="background: var(--warm); color: var(--ink);">IN PROGRESS</span>
    </a>
    <a class="rail-card" href="/projects/bob.html">
      <div class="rail-card-image" style="background: linear-gradient(135deg, var(--sage), #a8d5c2);"></div>
      <h3 class="heading">BOB</h3>
      <p class="desc">Discord bot with personality.</p>
      <span class="badge-complete">COMPLETE</span>
    </a>
    <a class="rail-card" href="/projects/skystream.html">
      <div class="rail-card-image" style="background: linear-gradient(135deg, #B09A7A, var(--warm));"></div>
      <h3 class="heading">Skystream</h3>
      <p class="desc">Weather API + visualizer.</p>
      <span class="badge-complete">COMPLETE</span>
    </a>
    <a class="rail-card" href="/projects/ares-ii.html">
      <div class="rail-card-image" style="background: linear-gradient(135deg, var(--border), #c8c8c8);"></div>
      <h3 class="heading">ARES II</h3>
      <p class="desc">Robotic arm — precision tool.</p>
      <div class="progress" style="margin-top: var(--sp-3);"><div class="progress-fill" style="width: 65%;"></div></div>
      <div class="progress-label">65% · in progress</div>
    </a>
    <a class="rail-card" href="/projects/house-point-counter.html">
      <div class="rail-card-image" style="background: linear-gradient(135deg, var(--sage), var(--warm));"></div>
      <h3 class="heading">House Point Counter</h3>
      <p class="desc">Hardware + dashboard.</p>
      <span class="badge-complete">COMPLETE</span>
    </a>
    <a class="rail-card" href="/projects.html" style="display: flex; align-items: center; justify-content: center; text-align: center;">
      <div>
        <div class="eyebrow">See everything</div>
        <div class="display-l" style="margin-top: var(--sp-3); font-size: 2rem;">All 25 projects →</div>
      </div>
    </a>
  </div>
</section>
```

- [ ] **Step 2: Append rail pin-and-translate script to `index.js`**

```js
/* ---------- Beat 05 — Horizontal rail ---------- */
(function setupRail() {
  const section = document.querySelector('#rail');
  const inner   = document.querySelector('#rail-inner');
  if (!section || !inner) return;

  if (prefersReducedMotion) {
    // Allow normal overflow scroll
    section.style.overflowX = 'auto';
    inner.style.transform = 'none';
    return;
  }

  const travel = () => inner.scrollWidth - window.innerWidth;

  gsap.to(inner, {
    x: () => -travel(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${travel()}`,
      scrub: true,
      pin: true,
      invalidateOnRefresh: true,
    },
  });
})();
```

- [ ] **Step 3: Browser verify**

Visit `/`. Scroll to rail section:
- Section pins
- Vertical scroll translates the rail sideways
- Cards pass by left-to-right
- Last card "All 25 projects →" routes to `/projects.html`
- Rail unpins when all cards have passed
- Hovering a card lifts it

- [ ] **Step 4: Mobile verify**

Resize to 375px. Rail should still scrub horizontally, but with smaller cards. Acceptable.

- [ ] **Step 5: Reduced-motion verify**

Rail becomes a plain horizontal scroll (`overflow-x: auto`). User scrolls sideways manually. No pin, no scrub.

- [ ] **Step 6: Commit**

```bash
git add index.html index.js
git commit -m "Implement Beat 05 — horizontal projects rail with pinned scroll"
```

---

### Task 20: Beat 06 — About + Graduation + Stats

**Files:**
- Modify: `index.html`
- Modify: `index.js`

- [ ] **Step 1: Fill the about section markup**

Replace `<section class="about-section" id="about"><!-- Beat 06 --></section>` with:

```html
<section class="about-section" id="about">
  <div class="container">
    <div class="graduation reveal">
      <div class="graduation-icon">🎓</div>
      <h2 class="display-l">I'm Graduating May 2026</h2>
      <p class="graduation-story">
        After four incredible years at Auburn Engineering — building, breaking, and learning — I'm crossing the stage. If you want to celebrate with me, here are some ways:
      </p>
      <div class="graduation-ctas">
        <a class="btn btn-primary" href="https://buymeacoffee.com/qydtpyrqtfz" target="_blank" rel="noopener">☕ Buy Me a Coffee</a>
        <a class="btn btn-ghost"   href="https://cash.app/$NashVtanz" target="_blank" rel="noopener">💸 Cash App</a>
        <a class="btn btn-ghost"   href="https://www.amazon.com/hz/wishlist/ls/1F0O3WNAW3M46?ref_=wl_share" target="_blank" rel="noopener">🎁 Amazon Wishlist</a>
      </div>
    </div>

    <div class="stats">
      <div>
        <div class="stat-num" data-count="25">0</div>
        <div class="stat-lbl">Projects</div>
      </div>
      <div>
        <div class="stat-num" data-count="18">0</div>
        <div class="stat-lbl">Hobbies</div>
      </div>
      <div>
        <div class="stat-num">∞</div>
        <div class="stat-lbl">Curiosity</div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append reveal + counter script to `index.js`**

```js
/* ---------- Beat 06 — Graduation reveal + stat counters ---------- */
(function setupAbout() {
  const section = document.querySelector('#about');
  if (!section) return;

  const reveals = section.querySelectorAll('.reveal');
  const counters = section.querySelectorAll('[data-count]');

  if (prefersReducedMotion) {
    reveals.forEach(r => { r.style.opacity = '1'; r.style.transform = 'none'; });
    counters.forEach(c => { c.textContent = c.dataset.count + '+'; });
    return;
  }

  gsap.to(reveals, {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: { trigger: section, start: 'top 80%' },
  });

  counters.forEach(el => {
    const target = Number(el.dataset.count);
    gsap.to(el, {
      innerText: target,
      duration: 1.4,
      ease: 'power2.out',
      snap: { innerText: 1 },
      onUpdate() { el.textContent = Math.round(Number(el.innerText)) + '+'; },
      scrollTrigger: { trigger: section, start: 'top 70%' },
    });
  });
})();
```

- [ ] **Step 3: Browser verify**

Scroll to about section:
- Graduation card fades up with reveal
- Stats count from 0 → 25+ and 0 → 18+
- Three CTA buttons work (open in new tab)

- [ ] **Step 4: Reduced-motion verify**

Counters jump to final values; card is static.

- [ ] **Step 5: Commit**

```bash
git add index.html index.js
git commit -m "Implement Beat 06 — graduation card + animated stat counters"
```

---

### Task 21: Lenis smooth scroll integration

**Files:**
- Modify: `shared.js`

- [ ] **Step 1: Add Lenis initialization to `shared.js`**

Append to `shared.js`:

```js
/* ---- Lenis smooth scroll (shared across all pages) ---- */
(function initLenis() {
  if (prefersReducedMotion) return;
  if (typeof Lenis === 'undefined') return; // pages without lenis CDN simply use native scroll

  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Tell ScrollTrigger to use Lenis
  if (typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Expose for debugging
  window.__lenis = lenis;
})();
```

- [ ] **Step 2: Add the Lenis CDN to subpages' `<head>`**

This is a search-replace sweep. For each file in `hobbies/*.html` and `projects/*.html`, add immediately after the `model-viewer` script tag:

```html
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1/dist/lenis.min.js"></script>
```

- [ ] **Step 3: Browser verify**

- Scrolling on `/` feels smoother (slight easing on wheel)
- Scrolling on `/hobbies/photography.html` feels smoother too
- Enable reduced-motion → scrolling reverts to native (instant wheel)
- Scroll effects (head morph, explosion) still sync correctly with Lenis scroll position

- [ ] **Step 4: Commit**

```bash
git add shared.js hobbies/ projects/
git commit -m "Add Lenis smooth-scroll to all pages with ScrollTrigger sync"
```

---

### Task 22: Phase 2 deploy checkpoint

- [ ] **Step 1: Run all tests**

```bash
node --test tests/*.test.js
```

Expected: all pass.

- [ ] **Step 2: Full browser QA sweep on `/`**

Open `/` in Chrome + Safari + Firefox (if available). Run through every beat 01–07. No console errors. No jank. Head-explosion feels sharp-then-smooth.

- [ ] **Step 3: Mobile QA**

Resize browser to 375px × 667px (iPhone SE). Scroll the whole homepage. Every beat adapts correctly.

- [ ] **Step 4: Push + tag**

```bash
git push origin main
git tag phase-2-narrative
git push origin phase-2-narrative
```

Verify at https://whatthenash.com (~60s after push).

---

# Phase 3 — Projects + Reach

Goal: new `projects.html` and `reach.html`. End-of-phase = complete overhaul shipped.

---

### Task 23: Rewrite projects.html — hero + filter chips

**Files:**
- Rewrite: `projects.html`
- Append to: `style.css`

- [ ] **Step 1: Append projects-page CSS to `style.css`**

```css
/* =======================================================
   projects.html
   ======================================================= */

.projects-hero {
  padding: 160px var(--sp-5) var(--sp-7);
  text-align: left;
  max-width: 900px; margin: 0 auto;
}
.projects-hero .eyebrow { margin-bottom: var(--sp-3); }
.projects-hero p { color: var(--ink-muted); max-width: 520px; margin-top: var(--sp-4); font-size: 1.05rem; }

.filter-chips {
  display: flex; flex-wrap: wrap; gap: var(--sp-2);
  max-width: 1200px; margin: 0 auto var(--sp-7); padding: 0 var(--sp-5);
}
.chip {
  padding: var(--sp-2) var(--sp-4);
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 0.85rem; font-weight: 500;
  cursor: pointer;
  transition: all var(--dur-micro) var(--ease-out);
}
.chip[aria-pressed="true"] { background: var(--ink); color: var(--canvas); border-color: var(--ink); }
.chip:hover { border-color: var(--ink); }

.projects-grid {
  max-width: 1200px; margin: 0 auto; padding: 0 var(--sp-5) var(--sp-10);
  display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--sp-4);
}
.project-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  padding: var(--sp-5);
  color: var(--ink);
  box-shadow: var(--sh-rest);
  transition: transform var(--dur-ui) var(--ease-out), box-shadow var(--dur-ui) var(--ease-out);
  display: flex; flex-direction: column;
  min-height: 260px;
}
.project-card:hover { transform: translateY(-6px); box-shadow: var(--sh-hover); }
.project-card-image {
  aspect-ratio: 4/3;
  background: linear-gradient(135deg, var(--border), var(--canvas));
  border-radius: var(--r-sm);
  margin-bottom: var(--sp-4);
}
.project-card h3 { margin-bottom: var(--sp-2); }
.project-card .desc { color: var(--ink-muted); font-size: 0.9rem; margin-bottom: var(--sp-4); flex: 1; }
.project-card[hidden] { display: none; }
```

- [ ] **Step 2: Rewrite `projects.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Projects — Nash</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🍌%3C/text%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Instrument+Serif:ital@1&display=swap" rel="stylesheet">
  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/lenis@1.1/dist/lenis.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <link rel="stylesheet" href="/style.css">
</head>
<body>

<!-- PASTE CANONICAL NAV — mark `Projects` link with aria-current="page" -->

<main>
  <section class="projects-hero">
    <div class="eyebrow">Everything I've built</div>
    <h1 class="display-xl">25 projects.</h1>
    <h1 class="display-xl serif-italic" style="margin-top: var(--sp-2);">still counting.</h1>
    <p>Robotic arms. Chat bots. Weather APIs. Things that work, things that don't.</p>
  </section>

  <div class="filter-chips" role="group" aria-label="Filter projects">
    <button class="chip" data-filter="all"      aria-pressed="true">All 25</button>
    <button class="chip" data-filter="hardware" aria-pressed="false">Hardware</button>
    <button class="chip" data-filter="software" aria-pressed="false">Software</button>
    <button class="chip" data-filter="ai"       aria-pressed="false">AI</button>
    <button class="chip" data-filter="progress" aria-pressed="false">In progress</button>
    <button class="chip" data-filter="complete" aria-pressed="false">Complete</button>
  </div>

  <div class="projects-grid" id="projects-grid">
    <!-- cards injected by JS from data/projects.js -->
  </div>
</main>

<!-- PASTE CANONICAL FOOTER -->

<script type="module" src="/shared.js"></script>
<script type="module" src="/projects.js"></script>
</body>
</html>
```

- [ ] **Step 3: Commit**

```bash
git add projects.html style.css
git commit -m "Projects page shell: hero, filter chips, grid container"
```

---

### Task 24: Projects data + grid rendering + filtering

**Files:**
- Create: `data/projects.js`
- Create: `projects.js`

- [ ] **Step 1: Create `data/projects.js`**

```js
// data/projects.js
export const PROJECTS = [
  { slug: 'banana',              name: 'Banana / Peel 1',     desc: 'iOS app, launching soon.',            tags: ['software'],           status: 'progress', progress: 40 },
  { slug: 'bob',                 name: 'BOB',                  desc: 'Discord bot with personality.',       tags: ['software', 'ai'],     status: 'complete' },
  { slug: 'skystream',           name: 'Skystream',            desc: 'Weather API + visualizer.',           tags: ['software'],           status: 'complete' },
  { slug: 'ares-ii',             name: 'ARES II',              desc: 'Robotic arm — precision tool.',       tags: ['hardware'],           status: 'progress', progress: 65 },
  { slug: 'house-point-counter', name: 'House Point Counter',  desc: 'Hardware + dashboard.',               tags: ['hardware'],           status: 'complete' },
  // Additional projects below use the existing project page stubs. Nash can fill in real data later.
  { slug: 'project1', name: 'Project 1', desc: 'TBD.', tags: ['hardware'], status: 'progress', progress: 20 },
  { slug: 'project2', name: 'Project 2', desc: 'TBD.', tags: ['software'], status: 'progress', progress: 50 },
  { slug: 'project3', name: 'Project 3', desc: 'TBD.', tags: ['ai'],       status: 'progress', progress: 30 },
  { slug: 'project4', name: 'Project 4', desc: 'TBD.', tags: ['hardware'], status: 'complete' },
  { slug: 'project5', name: 'Project 5', desc: 'TBD.', tags: ['software'], status: 'complete' },
];

export const CATEGORY_MATCHES = {
  all:      () => true,
  hardware: p => p.tags.includes('hardware'),
  software: p => p.tags.includes('software'),
  ai:       p => p.tags.includes('ai'),
  progress: p => p.status === 'progress',
  complete: p => p.status === 'complete',
};
```

Note: this covers 10 projects (the existing detail pages). If Nash has 15 more not yet in detail pages, they can be added later — the "25" headline is aspirational and matches the original site's stats.

- [ ] **Step 2: Create `projects.js` — render + filter**

```js
// projects.js
import './shared.js';
import { prefersReducedMotion } from './shared.js';
import { PROJECTS, CATEGORY_MATCHES } from './data/projects.js';

gsap.registerPlugin(ScrollTrigger);

const grid = document.getElementById('projects-grid');

/* Render cards */
function renderCards() {
  grid.innerHTML = PROJECTS.map(p => `
    <a class="project-card" href="/projects/${p.slug}.html" data-tags="${p.tags.join(' ')}" data-status="${p.status}">
      <div class="project-card-image"></div>
      <h3 class="heading">${p.name}</h3>
      <p class="desc">${p.desc}</p>
      ${p.status === 'complete'
        ? `<span class="badge-complete">COMPLETE</span>`
        : `<div class="progress"><div class="progress-fill" style="width:${p.progress}%"></div></div>
           <div class="progress-label">${p.progress}% · in progress</div>`
      }
    </a>
  `).join('');
}

/* Filter logic */
function applyFilter(key) {
  const match = CATEGORY_MATCHES[key];
  grid.querySelectorAll('.project-card').forEach(card => {
    const tags = card.dataset.tags.split(' ');
    const status = card.dataset.status;
    const project = { tags, status };
    card.hidden = !match(project);
  });
}

document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', 'false'));
    chip.setAttribute('aria-pressed', 'true');
    applyFilter(chip.dataset.filter);
  });
});

renderCards();

/* Scroll reveal on cards */
if (!prefersReducedMotion) {
  gsap.from('.project-card', {
    opacity: 0,
    y: 30,
    duration: 0.6,
    stagger: 0.06,
    ease: 'power2.out',
    scrollTrigger: { trigger: grid, start: 'top 85%' },
  });
}
```

- [ ] **Step 3: Browser verify**

Visit `/projects.html`:
- Hero shows new headline
- Chips render; clicking filters cards (show/hide)
- Cards scroll-reveal staggered on entry
- Cards hover-lift
- Clicking a card routes to `/projects/<slug>.html`
- Reduced motion: static reveal, filtering still works

- [ ] **Step 4: Commit**

```bash
git add projects.html projects.js data/projects.js
git commit -m "Projects page: data-driven grid with client-side filtering"
```

---

### Task 25: Rewrite reach.html

**Files:**
- Rewrite: `reach.html`
- Append to: `style.css`

- [ ] **Step 1: Append reach-page CSS**

```css
/* =======================================================
   reach.html
   ======================================================= */

.reach {
  min-height: 90vh;
  padding: 160px var(--sp-5) var(--sp-9);
  display: grid; grid-template-columns: 1.1fr 1fr;
  gap: var(--sp-9); align-items: center;
  max-width: 1200px; margin: 0 auto;
}
.reach-intro .eyebrow { margin-bottom: var(--sp-3); }
.reach-intro p { color: var(--ink-muted); max-width: 420px; margin-top: var(--sp-5); font-size: 1.05rem; }
.channels { display: flex; flex-direction: column; gap: var(--sp-3); }
.channel {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md);
  padding: var(--sp-5);
  display: flex; justify-content: space-between; align-items: center;
  transition: transform var(--dur-ui) var(--ease-out), box-shadow var(--dur-ui) var(--ease-out),
              border-color var(--dur-ui) var(--ease-out);
}
.channel:hover { transform: translateY(-4px); box-shadow: var(--sh-hover); border-color: var(--sage); }
.channel-name { font-weight: 700; font-size: 1rem; color: var(--ink); }
.channel-sub  { color: var(--ink-muted); font-size: 0.88rem; margin-top: var(--sp-1); }
.channel-arrow { font-size: 1.5rem; color: var(--ink-muted); transition: transform var(--dur-micro) var(--ease-out); }
.channel:hover .channel-arrow { transform: translateX(4px); color: var(--ink); }

@media (max-width: 768px) {
  .reach { grid-template-columns: 1fr; gap: var(--sp-7); padding-top: 140px; }
}
```

- [ ] **Step 2: Rewrite `reach.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reach Me — Nash</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🍌%3C/text%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Instrument+Serif:ital@1&display=swap" rel="stylesheet">
  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/lenis@1.1/dist/lenis.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <link rel="stylesheet" href="/style.css">
</head>
<body>

<!-- PASTE CANONICAL NAV — mark `Reach` link with aria-current="page" -->

<main>
  <section class="reach">
    <div class="reach-intro">
      <div class="eyebrow">Say hi</div>
      <h1 class="display-xl">Let's talk.</h1>
      <h1 class="display-xl serif-italic" style="margin-top: var(--sp-2);">about anything.</h1>
      <p>Internships, collaborations, project ideas, or just a good banana pun.</p>
    </div>
    <div class="channels">
      <a class="channel reveal" href="mailto:NashVogeltanz@icloud.com">
        <div>
          <div class="channel-name">Email</div>
          <div class="channel-sub">NashVogeltanz@icloud.com</div>
        </div>
        <span class="channel-arrow" aria-hidden="true">→</span>
      </a>
      <a class="channel reveal" href="https://github.com/GR3ATB0B" target="_blank" rel="noopener">
        <div>
          <div class="channel-name">GitHub</div>
          <div class="channel-sub">@GR3ATB0B</div>
        </div>
        <span class="channel-arrow" aria-hidden="true">→</span>
      </a>
      <a class="channel reveal" href="https://instagram.com" target="_blank" rel="noopener">
        <div>
          <div class="channel-name">Instagram</div>
          <div class="channel-sub">@nashvogeltanz</div>
        </div>
        <span class="channel-arrow" aria-hidden="true">→</span>
      </a>
      <a class="channel reveal" href="https://buymeacoffee.com/qydtpyrqtfz" target="_blank" rel="noopener">
        <div>
          <div class="channel-name">Buy me a coffee</div>
          <div class="channel-sub">fuel the grad season</div>
        </div>
        <span class="channel-arrow" aria-hidden="true">→</span>
      </a>
    </div>
  </section>
</main>

<!-- PASTE CANONICAL FOOTER -->

<script type="module" src="/shared.js"></script>
<script type="module" src="/reach.js"></script>
</body>
</html>
```

- [ ] **Step 3: Create `reach.js`**

```js
// reach.js
import './shared.js';
import { prefersReducedMotion } from './shared.js';

gsap.registerPlugin(ScrollTrigger);

if (!prefersReducedMotion) {
  gsap.to('.channel.reveal', {
    opacity: 1,
    y: 0,
    duration: 0.7,
    stagger: 0.1,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.channels', start: 'top 85%' },
  });
} else {
  document.querySelectorAll('.channel.reveal').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
}
```

- [ ] **Step 4: Browser verify**

Visit `/reach.html`:
- Split layout on desktop, stacked on mobile
- 4 channel cards render
- Cards drift in with stagger
- Hover: lift + arrow slides right
- Clicking Email opens mailto
- All external links open new tab
- Reduced motion: static, no drift

- [ ] **Step 5: Commit**

```bash
git add reach.html reach.js style.css
git commit -m "Rewrite reach.html with split hero and channel cards"
```

---

### Task 26: Final QA + phase 3 deploy

- [ ] **Step 1: All tests pass**

```bash
node --test tests/*.test.js
```

- [ ] **Step 2: Full site browser sweep**

Serve locally. Visit in order:
- `/` — every beat works, head explosion feels right, no console errors
- `/projects.html` — filter works, cards reveal
- `/reach.html` — channels render, hover works
- `/projects/banana.html` — placeholder page renders
- `/hobbies/photography.html` — new shell, original content
- `/projects/ares-ii.html` — new shell, original content

- [ ] **Step 3: Lighthouse**

In Chrome DevTools → Lighthouse → run on `/` (mobile + desktop).

Expected targets:
- Performance: ≥ 85 mobile, ≥ 95 desktop
- Accessibility: ≥ 95
- Best Practices: ≥ 95

If targets fail, record the Lighthouse report and iterate (compress images, lazy-load model-viewer in footer sections, etc.).

- [ ] **Step 4: Reduced-motion full sweep**

With `prefers-reduced-motion: reduce` enabled, visit every page. Confirm nothing moves inappropriately and all content is reachable.

- [ ] **Step 5: Cross-browser check**

Open `/` in Chrome, Safari, Firefox. Each should render the scroll narrative correctly.

- [ ] **Step 6: Push + tag**

```bash
git push origin main
git tag phase-3-complete
git push origin phase-3-complete
```

Verify https://whatthenash.com shows the complete overhaul.

---

## Post-Plan Followups (out of scope, capture as issues)

- Banana / Peel 1 project page content (when Nash is ready).
- Real photographs for hobby pages (currently placeholders on restyled shells).
- Expanded project filter categories if more projects added.
- Bio page (`projects/bio.html`) deeper redesign — currently just inherits the design system.
- Lighthouse regression check in CI (optional — adds a GitHub Action).

---

## Self-Review

**Spec coverage:**
- Premium-light palette → Task 2 ✓
- Typography (Inter + Instrument Serif) → Task 3 ✓
- Shared nav with morphing head → Tasks 4, 16 ✓
- Shared footer → Task 5 ✓
- Buttons / cards / progress / badge → Task 6 ✓
- Motion tokens + reduced-motion → Tasks 2, 16, 17, 18 ✓
- Homepage beats 01–07 → Tasks 15–20 ✓
- Head explosion with sqrt easing, no opacity fade → Task 18 ✓
- Mobile adaptations → embedded in each Beat task ✓
- projects.html → Tasks 23, 24 ✓
- reach.html → Task 25 ✓
- 28 subpages restyled → Tasks 10, 11 ✓
- Banana placeholder page → Task 12 ✓
- Lenis smooth scroll → Task 21 ✓
- Deploy / GitHub Pages → Tasks 13, 22, 26 ✓
- Lighthouse targets → Task 26 ✓
- Testing (node:test) → Tasks 7, 8 ✓

**Placeholder scan:** no `TBD` / `TODO` / `implement later` left in task code. The "Project 1–5" entries in `data/projects.js` intentionally carry `desc: 'TBD.'` as user-facing content awaiting Nash's input — flagged in the post-plan followups.

**Type consistency:** `layoutBubbles`, `easeSqrt`, `prefersReducedMotion`, `HOBBIES`, `PROJECTS`, `CATEGORY_MATCHES` all used consistently across tasks.
