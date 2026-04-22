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
