// data/copy.js — every visible line of words, in one place.
// Anything marked TODO is a spot where Nash still needs to say it himself.
// Handwritten pieces point at /img/lettering/<name>-a.svg (+ -b for line boil).

export const TODO = s => `TODO: ${s}`;

export const COPY = {
  loader: {
    line: TODO('loader line in your own words (also write it on the reMarkable)'),
  },

  hero: {
    hello: 'Hey, I’m Nash.',          // lettering: hey-im-nash
    lead: 'I',                         // lettering: i
    verbs: ['create', 'wonder', 'rebuild'], // lettering: create / wonder / rebuild
    after: TODO('anything after the verb? (e.g. nothing, or a word)'),
  },

  character: {
    hint: TODO('click-the-character hint in your own words'),
    controls: 'WASD / arrows to walk, Space to jump', // lettering: wasd / arrows / space
    touchControls: 'hold left or right of him to walk, tap above to jump, tap him to let go',
  },

  menu: ['Work', 'About', 'Hobbies', 'Contact', 'Support'],

  about: {
    title: 'Lab notes',
    // Facts already on the live site (bio.html). Rewrite in your voice.
    facts: [
      'Engineering student at Auburn, first semester.',
      'Atlanta Classical Academy, class of 2026.',
      'Arduino, ESP32, Raspberry Pi, 3D printing, CAD.',
      'ADHD + dyslexia — I learn sideways.',
      'Faith is the foundation for all of it.',
    ],
    body: TODO('a short lab-notes paragraph in your voice'),
    videos: TODO('2–3 short clips of you building something'),
  },

  hatch: {
    label: 'the shed',
    sub: 'coming soon',               // lettering still TODO: the-shed, coming-soon
  },

  contact: {
    title: 'Contact',
    greeting: 'Say hi',
    prefill: TODO('prefilled message in your voice'),
    budgets: TODO('budget options — or drop the picker if it’s not a hire-me site'),
    sent: 'Sent!',
  },

  // Known errors to fix in lettering: "ERAS II" should be "ARES II".
};
