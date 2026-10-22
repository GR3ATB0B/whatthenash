# Lettering pipeline

Source: reMarkable notebook "Whatthenash lettering", exported as vector SVG → `source.svg`.

1. `python3 slice.py source.svg <work>` — clusters strokes into lines/words, writes `<work>/groups.json` and a numbered contact sheet `<work>/sheet.html`.
2. Edit the name → group-index map (`W`) and doodle regions (`D`) in `export.py`, then
   `python3 export.py source.svg <work>` → `<work>/named.json`.
3. `python3 write_svgs.py <work>/named.json ../../img/lettering` — one SVG per piece,
   `stroke="currentColor"`, points simplified (RDP).

Suffix `-a` / `-b` / `-c` = separate handwritten takes, used as line-boil frames.
Re-export the notebook after adding pages and re-run; group indices will shift, so re-check the contact sheet.
