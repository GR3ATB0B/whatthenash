# whatthenash.com — Premium-Light Overhaul Design

**Date:** 2026-04-22
**Site:** whatthenash.com
**Repo:** github.com/GR3ATB0B/my-website
**Status:** Design approved — ready for implementation plan

## Goal

Rebuild whatthenash.com to feel like a "real tech company" site — Stripe/Apple/Notion premium-light aesthetic — driven by a continuous scroll narrative on the homepage. The signature moment: the 3D head model explodes into 18 hobby bubbles.

The three top-level pages (`index.html`, `projects.html`, `reach.html`) get the full scroll-effect treatment. The other 28 pages (10 project details + 18 hobbies) adopt the new design system — typography, palette, nav, footer — but keep their current content-first layouts.

## Non-Goals

- No new playground/games feature (e.g., Pong, FBI Most Wanted from the old brief).
- No build step, no bundler, no framework. Remains vanilla HTML/CSS/JS on GitHub Pages.
- No redesign of the `bio.html` page beyond the design-system polish.
- No CMS, no backend, no analytics added in this pass.

## Design System

### Palette

| Token       | Hex       | Use                                        |
|-------------|-----------|--------------------------------------------|
| Canvas      | `#FAFAF7` | Page background. Warm off-white.            |
| Surface     | `#FFFFFF` | Cards, elevated elements.                   |
| Ink         | `#0A0A0A` | Primary text, headings.                     |
| Ink Muted   | `#525252` | Secondary text, body copy.                  |
| Ink Faint   | `#737373` | Tertiary, eyebrow meta.                     |
| Border      | `#E5E5E5` | Card borders, dividers.                     |
| Sage        | `#6B8E68` | Accent — eyebrows, active state, CTAs.      |
| Warm        | `#D4A574` | Secondary accent — gradients, parallax.     |

### Typography

- **Inter** (Google Fonts): weights 400, 500, 600, 700, 800. Used for everything UI + body.
- **Instrument Serif** (Google Fonts): 400 italic. Used only as accent for specific italic phrases (e.g., "because I can't help it", "still counting").

**Scale:**

| Role          | Size (desktop)         | Weight | Tracking   |
|---------------|------------------------|--------|------------|
| Display XL    | `clamp(3rem, 7vw, 5rem)` | 800    | `-0.04em` |
| Display L     | `clamp(2.2rem, 4.5vw, 3.2rem)` | 800 | `-0.03em` |
| Heading       | `clamp(1.3rem, 2.5vw, 1.5rem)` | 700 | `-0.02em` |
| Body L        | `1.05rem`              | 400    | `0`        |
| Body          | `1rem`                 | 400    | `0`        |
| Eyebrow       | `0.75rem`              | 700    | `0.22em`, uppercase |
| Caption       | `0.78rem`              | 500    | `0.08em`, uppercase |

Line height: 1.1–1.15 for display, 1.6–1.75 for body.

### Spacing + Radius + Shadow

- **Spacing scale** (8px base): 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192.
- **Radius:** 8 (sm), 16 (md), 24 (lg).
- **Shadow:** `0 1px 3px rgba(10,10,10,0.03)` (card rest), `0 20px 60px rgba(10,10,10,0.08)` (card hover), `0 8px 30px rgba(10,10,10,0.12)` (float/tooltip).
- **Container max-width:** 1200px, 24px gutter.

### Motion

- **Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` (gentle ease-out) for standard transitions.
- **Hero-explosion easing:** square-root displacement — very fast initial velocity decelerating to asymptote. Implement via GSAP `CustomEase` approximating `y = √x` (e.g. `CustomEase.create("sqrt", "M0,0 C0.05,0.6 0.15,0.95 1,1")`), applied to both position AND scale for each bubble. No opacity fade — bubbles are solid opacity throughout.
- **Duration:** 0.25s (micro), 0.45s (UI), 0.8s (section reveals), 1.0–1.4s (hero-explosion total).
- **Scroll engine:** GSAP 3.12 + ScrollTrigger (already loaded on `index.html` — extend to all pages). Add **Lenis** smooth-scroll (~4kb via CDN) for buttery feel.
- **Reduced motion:** respect `prefers-reduced-motion: reduce`. All scroll-linked transforms snap to final state; explosion becomes a static fade-in at final bubble positions.

## Homepage Scroll Narrative (`index.html`)

Single continuous vertical scroll. Total height ≈ 5× viewport.

### Beat 01 — Hero

- 100vh. Centered composition.
- Eyebrow: "AUBURN '26 · BUILDER" (sage, wide tracking).
- Display XL: "Hey, I'm Nash." + Instrument Serif italic subtitle "builder of things. explorer of ideas."
- 3D head (`assets/Face.glb` via `model-viewer`), 360×360px, auto-rotating.
- Subtle radial glow (sage, 8% opacity) behind the head — decorative only.
- Scroll hint below.
- Nav is **invisible** at this point.

### Beat 02 — Head Morph (scroll progress 0 → 1)

- As user scrolls past the hero, the head progressively:
  - Scales: `360px → 32px`
  - Translates: center of viewport → top-left nav position
  - Z-axis rotation: untouched (auto-rotate continues)
- Scroll-linked (not time-linked) — driven by ScrollTrigger with `scrub: true`.
- Nav fades in (opacity 0 → 1) over the same scroll range.
- Hero text fades + translates up slightly.
- By the end of the morph, the head is the nav logo, positioned top-left next to "Nash" wordmark.

### Beat 03 — Manifesto (pinned)

- Section pins for ~1.5× viewport of scroll.
- Eyebrow: "01 / WHAT I DO"
- Display XL: "I build things." + Instrument Serif italic "because I can't help it."
- Parallax layers behind: sage circle, warm tan rounded rectangle, cream square — each drifts at a different speed (30%, 50%, 70% of scroll).
- Headline reveals line-by-line as you enter the pinned section.

### Beat 04 — Signature Moment: Head → Hobbies

**Scroll choreography:**

1. Nav-logo head detaches from nav, animates to center of viewport, scales to 250px. Nav fades the head out (but keeps wordmark) for the duration of this beat.
2. Brief hold (~200ms) with subtle wobble.
3. **Explosion:**
   - 18 bubbles instantiate at the head's center position at scale 0.
   - Each bubble is assigned a final `(x, y, radius)` position (same collision-free random layout as current `bubble-container` logic, ported to the new dimensions).
   - Each bubble animates from (center, scale 0) → (final x/y, final scale) using the sqrt-curve CustomEase. Total duration ~1.0s. Stagger: 0–120ms randomized.
   - No opacity fade — bubbles are solid white/sage throughout.
   - Original head "shell" scales down to 0 simultaneously.
4. Nav-logo head fades back in at top-left.
5. Once settled, bubbles enter idle float state (same 3-keyframe CSS float animations as current site).

**Content:** 18 bubbles from current `index.html` hobbies array. Currently-active hobbies (`Banana Co`, `Product Design`) render with sage fill. Each bubble is an `<a>` linking to `hobbies/<slug>.html`.

**Reverse scroll:** plays in reverse — bubbles collapse back to center, head re-forms, flies back to hero. Same sqrt-curve easing applied to the inverse.

**Mobile (<768px):** same sequence with smaller center head (160px) and bubbles settling into a 3-column tight cluster (min 44px tap target). Bubbles use shorter radial distances.

**Reduced motion:** head appears statically at final nav position. Bubbles fade in at rest positions (0.3s). No explosion.

### Beat 05 — Projects Rail (pinned horizontal)

- Section pins for ~3× viewport of scroll.
- Vertical scroll drives horizontal translation of a card rail.
- Eyebrow: "02 / WHAT I'VE BUILT"
- Display L: "25 projects." + Instrument Serif italic "scroll sideways →"
- Rail content: 6–8 featured projects as full cards (image, title, one-line desc, status badge). Final card: "See all 25 →" linking to `projects.html`.
- Each card: hover → lift 6px + shadow deepen. Click → routes to `projects/<slug>.html`.

### Beat 06 — About + Graduation

- Graduation card (existing content preserved, restyled):
  - Icon 🎓, "I'm Graduating May 2026", story paragraph, three CTA buttons (Coffee, Cash App, Wishlist).
  - Enters with soft parallax + reveal.
- Stats strip: "25+ projects · 18 hobbies · ∞ curiosity". Numbers animate from 0 on scroll-into-view.
- About paragraph: one short paragraph, social links (GitHub, Instagram, Coffee).

### Beat 07 — Footer

- Link row (Projects, Hobbies, About, Reach, GitHub).
- Copyright: "© 2026 Nash · whatthenash.com · built with curiosity".
- Nav + head logo remain pinned at top throughout.

## `projects.html`

Full project index. Not a horizontal rail — exhaustive grid.

**Sections:**

1. Hero (compact, ~60vh): eyebrow "EVERYTHING I'VE BUILT", headline "25 projects. / still counting." (Instrument Serif italic second line), intro paragraph.
2. Filter chips: All / Hardware / Software / AI / In progress / Complete. Client-side filtering (show/hide cards).
3. Grid: 3-column on desktop (`auto-fill, minmax(320px, 1fr)`), single column mobile.
4. Each card: image/gradient placeholder, title, one-line desc, progress bar (in-progress) OR "COMPLETE" badge (done). Scroll-reveal staggered on entry.
5. Shared nav + footer.

No pinning, no horizontal scroll. Just a clean grid with scroll reveals.

## `reach.html`

Minimal contact page. No form (spam avoidance).

**Layout:**

- Hero is a split: left column editorial headline "Let's talk. / about anything." + short paragraph. Right column: channel cards (Email, GitHub, Instagram, Buy Me a Coffee).
- Each channel card is a `<a>` with title, subtitle, `→` arrow. Hover lifts card.
- Channel cards drift in with soft parallax stagger on scroll into view.
- Shared nav + footer.

## Subpage Template (10 project details + 18 hobbies)

Consistent shell across all 28 pages:

- Shared nav (with morphed-head logo, static — no morph animation on subpages).
- Breadcrumb row: `← Hobbies · Photography` or `← Projects · ARES II`.
- Editorial title + short intro paragraph.
- Flexible content area: each existing page keeps its unique content (photo grid, progress notes, gallery, project description). No layout surgery beyond restyling to the new design system.
- Per-page scroll reveal applied to images/cards only (no pinning, no rails).
- Shared footer.

## Technical Architecture

### File structure

```
my-website/
├── index.html            # Rewritten — uses style.css, inline script tag for page-specific scroll
├── projects.html         # Rewritten
├── reach.html            # Rewritten
├── style.css             # Design tokens + shared components (nav, footer, cards, buttons)
├── shared.js             # Shared behavior — nav hamburger, head-morph setup, Lenis init
├── projects/*.html       # Shells updated to use style.css + shared nav/footer; content preserved
├── hobbies/*.html        # Shells updated to use style.css + shared nav/footer; content preserved
├── assets/Face.glb       # Unchanged
├── clean-urls.js         # Unchanged
├── CNAME                 # Unchanged
└── images/               # Unchanged (continue using existing photos)
```

**Deleted:** `index.html.new`, `style.css.new` (stale drafts).

### Dependencies (all CDN, no npm)

| Library            | Version | Purpose                              |
|--------------------|---------|--------------------------------------|
| GSAP               | 3.12.5  | Animation engine                     |
| ScrollTrigger      | 3.12.5  | Scroll-driven animation              |
| CustomEase         | 3.12.5  | sqrt-curve easing for explosion      |
| Lenis              | ~1.1    | Smooth scroll                        |
| model-viewer       | 3.4.0   | 3D head rendering                    |
| Google Fonts       | —       | Inter + Instrument Serif             |

CustomEase is part of GSAP's free plugins bundle — confirm licensing before including; fallback is `expo.out` which approximates sqrt well enough.

### Nav component

Every page has the same nav markup:

```html
<nav class="nav" id="nav">
  <a href="/" class="nav-logo">
    <model-viewer id="nav-head" src="assets/Face.glb" auto-rotate disable-zoom class="nav-head"></model-viewer>
    <span>Nash</span>
  </a>
  <ul class="nav-links">
    <li><a href="/projects.html">Projects</a></li>
    <li><a href="/#hobbies">Hobbies</a></li>
    <li><a href="/#about">About</a></li>
    <li><a href="/reach.html">Reach</a></li>
  </ul>
  <button class="nav-hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
</nav>
```

On `index.html`, the nav `model-viewer` is hidden on load and only appears after the morph completes. On all other pages, it appears immediately at its final small size.

Hamburger menu behavior same as today (toggles `.mobile-open` class).

### Scroll systems by page

| Page              | Lenis | ScrollTrigger | Pinning | Horizontal rail | Head morph | Explosion |
|-------------------|-------|---------------|---------|-----------------|------------|-----------|
| `index.html`      | yes   | yes           | yes     | yes             | yes        | yes       |
| `projects.html`   | yes   | yes (reveals) | no      | no              | no         | no        |
| `reach.html`      | yes   | yes (reveals) | no      | no              | no         | no        |
| `projects/*.html` | yes   | yes (reveals) | no      | no              | no         | no        |
| `hobbies/*.html`  | yes   | yes (reveals) | no      | no              | no         | no        |

### Performance

- Google Fonts: preconnect + `display=swap`; preload Inter 800 for hero LCP.
- `Face.glb` already cached. Set `loading="eager"` on hero `model-viewer`.
- Parallax layers: `will-change: transform`. Remove after ScrollTrigger completes.
- Bubbles: absolute-positioned `<a>` elements; animate via GSAP (transforms only, no layout).
- Target Lighthouse performance: ≥ 85 mobile, ≥ 95 desktop.
- No animation blocks paint — hero renders immediately, then scripts take over.

### Accessibility

- All interactive elements keyboard-focusable with visible focus ring (`outline: 2px solid var(--sage); outline-offset: 4px`).
- Nav skip link to `#main` content.
- `prefers-reduced-motion: reduce` disables Lenis and all scroll-linked scrubs; replaces explosion with static fade.
- Color contrast: Ink on Canvas = ~19.5:1 (AAA). Sage on Canvas for non-text UI only; any sage text larger than 24px to meet AA.
- `model-viewer` hero gets `alt="3D model of Nash's face"`.

### Deploy

Same as today: push to `main` on `github.com/GR3ATB0B/my-website`, GitHub Pages serves `whatthenash.com`. If HTTPS push returns 403, use `gh api` Contents API workaround per existing repo conventions.

## Content Decisions

**Kept:**
- 3D head model (`Face.glb`)
- All 18 hobbies (same names, same detail pages)
- All 10 project detail pages (content untouched)
- Graduation card copy + CTAs
- "Currently into: Banana Co / Peel" active-hobby concept (implemented via `current: true` on bubble data)
- Footer copyright phrasing "built with curiosity"
- Wordmark "Nash" (replaces "What The Nash!" in nav for cleaner look — kept in `<title>`)

**Replaced:**
- Current bubble-only hobbies section → Head-explosion moment terminating in bubble cluster
- Current static hero → Morphing hero that transitions into nav

**Deleted:**
- `index.html.new`, `style.css.new`

## Open Questions (resolve during implementation)

1. **CustomEase licensing.** GSAP CustomEase is in the free bonus plugins bundle. If a license concern arises, fall back to `expo.out`.
2. **Model-viewer in nav.** `model-viewer` at 32px has some overhead. If perf suffers on mobile, swap the nav logo to a static rasterized PNG of the head once the morph completes — the full `model-viewer` only lives in the hero during the morph.
3. **Favicon.** Current favicon is a banana emoji SVG. Keep or update to a Nash-face icon? Default: keep.
4. **Reach-page email.** Spec shows `nash@whatthenash.com` — confirm the real address before implementation.

## Success Criteria

1. Homepage scroll narrative plays smoothly at 60fps on a 2022 MacBook Air in Safari + Chrome. No visual stutters during head morph or explosion.
2. All 3 main pages + 28 subpages share the same design tokens, nav, and footer — visual consistency across the site.
3. Head explosion feels sharp-then-smooth (sqrt curve), not linear and not jerky. Bubbles never fade opacity.
4. `prefers-reduced-motion` users get a fully functional static version.
5. Mobile experience works — head morph, explosion, and horizontal rail all behave correctly on iPhone SE through iPad.
6. Lighthouse performance ≥ 85 mobile, ≥ 95 desktop on `index.html`.
7. Every existing hobby + project detail page still loads correctly with its original content and new shell.
