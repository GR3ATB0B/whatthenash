/* js/main.js — the desk page. */

import { hydrateHw } from './hw.js';
import { buildDesk } from './desk.js';
import { initHero } from './hero.js';
import './menu.js';
import './face.js';
import './panels/work.js';
import './panels/about.js';
import './panels/contact.js';

hydrateHw();
buildDesk();
initHero();
