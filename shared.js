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
