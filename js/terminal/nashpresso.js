/* js/terminal/nashpresso.js — pull a shot. Press Enter to start, Enter to stop.
   The clock runs 10× fast, so a 27-second shot takes 2.7 real seconds.
   Pure scoring here (unit-tested); the terminal drives the timing. */

export const SPEEDUP = 10;
export const SWEET = [25, 30];

export function grade(sec) {
  if (sec < 15) return { label: 'gusher', note: 'that was basically brown water. grind finer.', stars: 0 };
  if (sec < 20) return { label: 'sour', note: 'under-extracted. tastes like a lemon apologizing.', stars: 1 };
  if (sec < SWEET[0]) return { label: 'a touch fast', note: 'close. a hair finer next time.', stars: 2 };
  if (sec <= SWEET[1]) return { label: 'dialed in', note: 'that’s the one. sweet, syrupy, no notes.', stars: 3 };
  if (sec <= 35) return { label: 'a bit long', note: 'getting bitter. grind coarser.', stars: 2 };
  return { label: 'burnt', note: 'choked the machine. we don’t talk about this one.', stars: 0 };
}

/* little progress bar for the live pull: 0..45 s */
export function bar(sec, width = 30) {
  const n = Math.max(0, Math.min(width, Math.round((sec / 45) * width)));
  const a = Math.round((SWEET[0] / 45) * width), b = Math.round((SWEET[1] / 45) * width);
  let s = '';
  for (let i = 0; i < width; i++) s += i < n ? '▓' : (i >= a && i < b ? '·' : '░');
  return `[${s}] ${sec.toFixed(1).padStart(4)}s`;
}
