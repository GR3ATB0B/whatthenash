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
