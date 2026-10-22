/* js/write-on.js — draw Nash's handwriting stroke by stroke, in the order he
   actually wrote it on the reMarkable (the SVG keeps pen order), so a word
   looks like it's being written in place. */

const cache = new Map();

/* inline an /img/lettering SVG so its paths can be animated */
export async function inlineLettering(name) {
  if (!cache.has(name)) cache.set(name, fetch(`/img/lettering/${name}.svg`).then(r => r.text()));
  const box = document.createElement('div');
  box.innerHTML = await cache.get(name);
  const svg = box.querySelector('svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('ink');
  return svg;
}

/* write it on: each stroke drawn in turn, timed by its length */
export function writeOn(svg, totalMs = 900) {
  const paths = [...svg.querySelectorAll('path')];
  const lens = paths.map(p => p.getTotalLength());
  const sum = lens.reduce((a, b) => a + b, 0) || 1;
  const gap = 18;                                   // pen lift between strokes
  const draw = Math.max(200, totalMs - gap * paths.length);
  let t = 0;
  return Promise.all(paths.map((p, i) => {
    const dur = (lens[i] / sum) * draw;
    p.style.strokeDasharray = lens[i];
    p.style.strokeDashoffset = lens[i];
    const a = p.animate([{ strokeDashoffset: lens[i] }, { strokeDashoffset: 0 }],
      { duration: dur, delay: t, easing: 'cubic-bezier(.3,.1,.4,1)', fill: 'forwards' });
    t += dur + gap;
    return a.finished.catch(() => {});
  }));
}

export function showWritten(svg) {
  svg.querySelectorAll('path').forEach(p => { p.getAnimations().forEach(a => a.cancel()); p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; });
}
