/* js/route.js — pure hash ⇄ panel mapping (no DOM, unit-tested). */

export const PANELS = ['work', 'about', 'contact', 'terminal'];

export function parseHash(hash) {
  const [panel, page] = hash.replace(/^#\/?/, '').split('/');
  return PANELS.includes(panel) ? { panel, page: page || null } : { panel: null, page: null };
}

export function hashFor({ panel, page }) {
  return panel ? `#${panel}${page ? '/' + page : ''}` : '';
}
