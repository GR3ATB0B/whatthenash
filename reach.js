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
