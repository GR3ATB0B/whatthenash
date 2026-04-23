// index.js
import './shared.js';
import { prefersReducedMotion } from './shared.js';
import { HOBBIES } from './data/hobbies.js';
import { layoutBubbles } from './src/bubble-layout.js';

gsap.registerPlugin(ScrollTrigger);

const heroHead = document.querySelector('.hero-head');

/* ---------- Beat 02 — Hero head shrink on scroll ---------- */
(function setupHeroShrink() {
  if (!heroHead || prefersReducedMotion) return;

  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate(self) {
      const p = self.progress;
      gsap.set(heroHead, {
        scale: 1 - p * 0.3,
        opacity: 1 - p * 1.2,
        yPercent: -p * 20,
      });
    },
  });
})();

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
  const sizePool = [90, 100, 110, 85, 95, 105, 88, 102, 92, 98, 108, 86, 96, 100, 94, 104, 88, 106];
  const sizes = HOBBIES.map((_, i) => Math.round(sizePool[i % sizePool.length] * sizeScale));

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
