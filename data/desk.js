// data/desk.js — everything that sits on the desk.
// `src` points at a placeholder until the real cut-out photo exists.
// Swap `img/desk/<id>.TODO.svg` → `img/desk/<id>.webp` and drop `todo`.
// x/y are % of the desk; rot in degrees; z stacks (higher = on top).

export const DESK = [
  { id: 'scope',           src: '/img/desk/scope.TODO.svg',           x: 8,  y: 14, w: 26, rot: -4,  z: 1, todo: true },
  { id: 'keyboard',        src: '/img/desk/keyboard.TODO.svg',        x: 38, y: 62, w: 30, rot: 2,   z: 2, todo: true },
  { id: 'notebook-closed', src: '/img/desk/notebook-closed.TODO.svg', x: 72, y: 10, w: 16, rot: 7,   z: 2, todo: true, opens: 'about' },
  { id: 'pager',           src: '/img/desk/pager.TODO.svg',           x: 78, y: 58, w: 12, rot: -9,  z: 3, todo: true, opens: 'contact' },
  { id: 'crt-terminal',    src: '/img/desk/crt-terminal.TODO.svg',    x: 50, y: 8,  w: 16, rot: 0,   z: 1, todo: true, opens: 'terminal' },
  { id: 'multimeter',      src: '/img/desk/multimeter.TODO.svg',      x: 2,  y: 52, w: 10, rot: 12,  z: 2, todo: true },
  { id: 'soldering-iron',  src: '/img/desk/soldering-iron.TODO.svg',  x: 14, y: 80, w: 24, rot: -14, z: 3, todo: true },
  { id: 'pcb-1',           src: '/img/desk/pcb-1.TODO.svg',           x: 30, y: 30, w: 15, rot: 6,   z: 2, todo: true, opens: 'work' },
  { id: 'pcb-2',           src: '/img/desk/pcb-2.TODO.svg',           x: 46, y: 38, w: 13, rot: -11, z: 3, todo: true },
  { id: 'pcb-3',           src: '/img/desk/pcb-3.TODO.svg',           x: 20, y: 44, w: 11, rot: 18,  z: 3, todo: true },
  { id: 'portafilter',     src: '/img/desk/portafilter.TODO.svg',     x: 62, y: 34, w: 20, rot: -22, z: 2, todo: true },
  { id: 'tamper',          src: '/img/desk/tamper.TODO.svg',          x: 86, y: 38, w: 6,  rot: 0,   z: 2, todo: true },
  { id: 'espresso-cup',    src: '/img/desk/espresso-cup.TODO.svg',    x: 90, y: 74, w: 8,  rot: 0,   z: 2, todo: true },
  { id: 'cable-usb',       src: '/img/desk/cable-usb.TODO.svg',       x: 66, y: 76, w: 13, rot: 30,  z: 1, todo: true },
  { id: 'jumper-wires',    src: '/img/desk/jumper-wires.TODO.svg',    x: 2,  y: 4,  w: 12, rot: -6,  z: 1, todo: true },
  { id: 'hatch',           src: '/img/desk/hatch.TODO.svg',           x: 88, y: 2,  w: 10, rot: 3,   z: 0, todo: true, inert: true },
];

// notebook-open is used inside the About panel, not on the desk.
export const NOTEBOOK_PAGE = '/img/desk/notebook-open.TODO.svg';
