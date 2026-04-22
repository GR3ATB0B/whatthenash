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
