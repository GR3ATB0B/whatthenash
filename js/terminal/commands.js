/* js/terminal/commands.js — the CRT's shell (no DOM, unit-tested).

   `help` shows the obvious commands. The rest are hiding in plain sight:
   words that show up in other commands' output are commands too, so
   reading carefully pays off. A counter tracks how many you've found.
   Anything Nash hasn't told us yet is marked TODO, never made up.        */

const TODO = s => `TODO(Nash): ${s}`;

export function createShell({ projects = [], email = '' } = {}) {
  const files = projects.map(p => `${p.slug}.txt`);
  const bySlug = Object.fromEntries(projects.map(p => [p.slug, p]));

  /* name → { hidden?, run(args) → { out: string[], effect? } } */
  const C = {
    help: {
      run: () => ({ out: [
        'things you can type:',
        '  whois      who runs this desk',
        '  projects   what I’ve built',
        '  ls / cat   poke at the files',
        '  stack      what I build with',
        '  keys       the keyboard I built',
        '  contact    how to reach me',
        '  clear      wipe the screen',
        '  exit       back to the desk',
        '',
        'that’s not all of them. some words do things. read closely.',
      ] }),
    },
    whois: {
      run: () => ({ out: [
        'nash vogeltanz',
        'engineering student at auburn. first semester.',
        'I build stuff with an esp32, a raspberry pi, a 3d printer and too much coffee.',
        'adhd + dyslexia, so I learn sideways.',
        'supervisor at chick-fil-a, where I speak spanish in the kitchen every day.',
        'I still build things with my grandpa.',
        'ask me about my toes.',
        TODO('one more line about you, in your words'),
      ] }),
    },
    projects: {
      run: () => ({ out: [
        ...projects.map(p => `  ${p.slug.padEnd(20)} ${p.status === 'complete' ? 'done' : `${p.progress}% there`}`),
        '',
        'try: cat <name>   (e.g. cat bob)',
      ] }),
    },
    ls: {
      run: args => ({ out: args[0] === '-a'
        ? ['.  ..  .espresso', ...files]
        : [files.join('  ')] }),
    },
    'ls -a': { hidden: true, alias: 'ls' },
    cat: {
      run: args => {
        const name = (args[0] || '').replace(/\.txt$/, '');
        if (!name) return { out: ['cat: which one? try ls'] };
        if (name === '.espresso') return { out: [
          'dose 18g. yield 36g. 25–30 seconds.',
          'or just type nashpresso and find out.',
        ], unlock: '.espresso' };
        const p = bySlug[name];
        if (!p) return { out: [`cat: ${args[0]}: no such file`] };
        return { out: [
          p.name.toUpperCase(),
          p.desc,
          `status: ${p.status === 'complete' ? 'done' : `in progress, ${p.progress}%`}`,
          `notes: /projects/${p.slug}.html`,
        ] };
      },
    },
    stack: {
      run: () => ({ out: [
        'hardware   esp32 · arduino · raspberry pi · soldering iron · multimeter',
        'making     cad · 3d printing · forging (when the forge is lit)',
        'code       python · javascript · claude (that’s how bob happens)',
        TODO('anything you swear by that isn’t here'),
      ] }),
    },
    keys: {
      run: () => ({ out: [
        'yes, I built the keyboard.',
        TODO('switches, keycaps, layout, what went wrong'),
        'it makes a noise. type clack.',
      ] }),
    },
    contact: {
      run: () => ({ out: [
        email ? `email   ${email}` : TODO('email to show here'),
        'or type page to open the pager and send me something.',
      ] }),
    },
    clear: { run: () => ({ out: [], effect: 'clear' }) },
    exit:  { run: () => ({ out: ['bye.'], effect: 'exit' }) },

    // ---- hidden: found by reading other output ----
    page:       { hidden: true, run: () => ({ out: ['warming up the pager…'], effect: 'contact' }) },
    bob:        { hidden: true, run: () => ({ out: [
      'BOB is my personal AI agent, built on Claude. a few agents that run my digital life.',
      TODO('what BOB did today, or a line BOB would say'),
    ] }) },
    nashpresso: { hidden: true, run: () => ({ out: [], effect: 'nashpresso' }) },
    coffee:     { hidden: true, run: () => ({ out: ['there’s a machine for that. type nashpresso.'] }) },
    auburn:     { hidden: true, run: () => ({ out: ['war eagle.', TODO('major / what you’re studying exactly')] }) },
    esp32:      { hidden: true, run: () => ({ out: [
      'favorite tiny computer. wifi + bluetooth for a few bucks.',
      'the claude approver runs on one: it lights up and plays a jingle when claude finishes a task.',
    ] }) },
    grandpa:    { hidden: true, run: () => ({ out: ['building things with my grandfather.', TODO('a favorite thing you two built')] }) },
    spanish:    { hidden: true, run: () => ({ out: ['hablo español en la cocina todos los días.'] }) },
    'chick-fil-a': { hidden: true, run: () => ({ out: ['my pleasure.'] }) },
    clack:      { hidden: true, run: () => ({ out: ['clack clack clack clack', TODO('switch name / sound test link')] }) },
    toes:       { hidden: true, run: () => ({ out: ['two of my pinkie toes don’t touch the ground. it’s hereditary. weird? yes. awesome? also yes.'] }) },
    sudo:       { hidden: true, run: () => ({ out: ['nice try.'] }) },
    banana:     { hidden: true, run: () => ({ out: ['banana is my company. try cat banana.'] }) },
  };

  // words people will naturally type that mean the same command
  const ALIASES = { 'chickfila': 'chick-fil-a', 'cfa': 'chick-fil-a', 'q': 'exit', 'quit': 'exit', 'cls': 'clear', '?': 'help', 'man': 'help' };

  const names = Object.keys(C).filter(n => !C[n].alias);
  const discovered = new Set();

  function resolve(line) {
    const raw = line.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!raw) return null;
    if (C[raw]?.alias) return { name: C[raw].alias, args: raw.split(' ').slice(1), key: raw };
    const [head, ...args] = raw.split(' ');
    const name = ALIASES[head] || head;
    return C[name] && !C[name].alias ? { name, args, key: name } : { name: null, head, args };
  }

  return {
    total: names.length + 1,            // + the hidden .espresso file
    discovered,
    names: () => names.filter(n => !C[n].hidden || discovered.has(n)),
    restore(list) { list.forEach(n => (names.includes(n) || n === '.espresso') && discovered.add(n)); },
    run(line) {
      const r = resolve(line);
      if (!r) return { out: [] };
      if (!r.name) return { out: [`${r.head}: command not found. try help`] };
      const res = C[r.name].run(r.args);
      const isNew = !discovered.has(r.name);
      discovered.add(r.name);
      if (res.unlock) discovered.add(res.unlock);
      return { ...res, found: isNew ? r.name : null };
    },
  };
}
