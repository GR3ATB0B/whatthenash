# Desk redesign: where I left off

Branch `redesign/desk`, parked on purpose. **Not live.** `main` (and whatthenash.com) are still the original site.

## See it
```bash
git checkout redesign/desk
python3 tools/dev-serve.py 8000      # http://localhost:8000
node tools/dev-worker.mjs            # optional: local contact-form backend on :8787
node --test tests/*.test.js          # 64 tests
```
Go back to the live version anytime with `git checkout main`.

## What's built (stages 0–4)
- **Loader:** handwritten % counter; stick figure carries a plug to a socket; fails open at 8s.
- **Hero:** face in the centre (2D flip-book that turns with the cursor) over a table of my own photos that shuffle as you scroll. Buried photos swap to new ones. The scroll loops forever.
  "Hey, I'm Nash" / typed "I love to" + rebuild · create · wonder written on stroke by stroke.
  `data/config.js → photosClearOfWords` keeps the photos out from behind the words (set `false` to undo).
- **Menu:** slide-in drawer, hand-drawn pills, multimeter needle follows the cursor, Menu/Close swap, Back arrow.
- **Panels:**
  - Work: wobbly cards with captions running around the border
  - About: notebook with Lab notes + Hobbies pages
  - Contact: pager → compose form with Turnstile
- **Little me:** click him, then WASD/arrows + Space. He walks on the photos, my face, the cards and the notebook. On phones: hold left/right of him to walk, tap above to jump.
- **Terminal:** the little CRT bottom-right (or the ` key) opens a green phosphor screen: boot flicker, grain, scan bar, your real "last login".
  - `help` only shows the basics; words in the output (auburn, esp32, toes, clack…) are hidden commands.
  - The found counter (n/24) is remembered per visitor.
  - `ls -a` → `cat .espresso` → `nashpresso`: pull a shot, Enter to start/stop, aim for 25–30s.
- Old `bio/reach/projects/hobbies` pages redirect into the panels. The project/hobby detail pages and Support are unchanged.

## Not done yet
- **Stage 5: polish.** Lighthouse, 60fps profile, accessibility pass, reduced-motion check in a real browser, iPhone scroll test.
- **Contact backend isn't deployed.** See `worker/README.md`: needs Cloudflare (Turnstile + Worker) and Resend. Put the real Turnstile site key in `data/config.js`.

## Things only I can do
- **Write/draw (reMarkable notebook "Whatthenash lettering"; draw anything that swaps on hover twice):**
  - ARES II (I wrote "ERAS")
  - loader line
  - click-the-character hint
  - 5 walk-cycle frames (feet on one line)
  - multimeter / plug / socket / power strip
  - second takes of the menu icons
- **Fill the TODOs:**
  - `data/copy.js`: lab-notes paragraph, contact prefill, photo captions, budget options
  - `worker/src/validate.js`: the budget options live here too (`BUDGETS`)
  - `js/terminal/commands.js`: TODO lines in whois, stack, keys, bob, auburn, grandpa, clack
  - CRT button drawing in `index.html` (`.crt-btn`)
- **Photos still needed:** Banana / Peel 1, BOB, Claude Approver (Work cards); a couple of short building clips for the notebook.

## Where things live
| What | Where |
|---|---|
| Page shell | `index.html` |
| Styles | `css/` |
| Hero loop + photo table | `js/hero*.js`, `js/table*.js` |
| Menu, routing | `js/menu.js`, `js/state.js`, `js/route.js` |
| Panels | `js/panels/` |
| Character (physics, masks, world) | `js/character/` |
| Terminal (commands, nashpresso, CRT) | `js/terminal/`, `css/terminal.css` |
| Contact backend | `worker/` |
| Words / settings / photos list | `data/` |
| Handwriting SVGs + re-slicing tools | `img/lettering/`, `tools/lettering/` |
| Regenerate loader frames + lettering sizes | `python3 tools/build.py` |
| Source 3D face (kept out of the repo) | `~/Projects/face-source/Face.glb` |
