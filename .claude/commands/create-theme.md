# Create QuickLaunch Theme

Create a new CSS theme for QuickLaunch (Electron desktop widget launcher, `src/renderer/styles/themes/`). Theme ID: `$ARGUMENTS`

## Design Philosophy (read first)

**A theme is an emotional experience, not a color scheme.** Every decision — colors, animation timing, SVG content, particle style — should make the user FEEL like they're in that franchise's world. The best themes make you forget you're looking at a launcher.

### Core principles:
- **Emotional design**: A horror theme should feel unsettling. A cozy theme should feel warm. A military theme should feel precise. Match the franchise's emotional tone in every detail.
- **Functional minimalism**: Every visual element must justify its existence. If an SVG label or particle doesn't reinforce the theme identity, cut it. Empty space is atmosphere, not waste.
- **Dark Mode 2.0**: Don't just make things dark — use sophisticated layering: subtle gradient overlays, neon/warm accent highlights against deep backgrounds, vignette depth. The background should feel like it has LAYERS and DEPTH, not a flat color with an SVG on top.
- **Micro-interactions that match personality**: The tile hover, title flicker, and 88% sync flash should reflect the theme's character. Glitch `steps(1)` for tech/aggressive. Gentle `ease-in-out` for organic/warm. Sharp snap for military. The app should feel ALIVE.
- **Visual hierarchy through depth**: Use opacity layers, glow halos, and vignette gradients to create a sense of looking INTO something, not AT a flat surface. The fractal noise grain, the vignette, and the SVG all work together as depth layers.
- **Accessibility is non-negotiable**: The luma readability check (eff luma >= 72) is the minimum. Important text must be immediately readable. Decorative text fades into atmosphere. Icons must always be clearly visible over the background.
- **Not everything is dark cyberpunk**: Some themes should be warm, some cold, some transparent, some dense. Some should be monochrome, some vibrant. Some textured, some clean. Match the franchise.

### Transparency / Glassmorphism (available to ALL themes)

The Electron window is `transparent: true` with `backdrop-filter: blur(18px)` already in base.css. To make a theme translucent:
- Set `--bg` to a semi-transparent rgba: `rgba(R, G, B, 0.45–0.70)` — lower = more desktop visible
- Set `--panel-bg` and `--overlay-bg` to slightly more opaque (0.80–0.90) for readability
- The desktop wallpaper bleeds through with a frosted glass effect automatically
- Works best for: holographic/HUD themes (Ghost in the Shell), ethereal themes, glass/crystal themes
- **Not every theme should be transparent.** Use it when it serves the franchise identity.

### Visual paradigms to experiment with (not an exhaustive list):

- **Dark + colored accents** — the default. STOP defaulting to this for everything.
- **Translucent/glassmorphic** — desktop bleeds through (Ghost in the Shell). Use `--bg: rgba(..., 0.45-0.70)`.
- **Foggy/monochrome** — almost no color, LIGHT grey background, heavy grain. The opposite of dark mode. (Silent Hill)
- **Neon wireframe** — pure black + 1-2 hard neon colors, geometric lines, no soft glow. (Tron)
- **Warm mid-tone** — amber/sand/cream backgrounds that feel like firelight or parchment, NOT dark. (Dune, Indiana Jones)
- **Desaturated/muted** — barely any saturation, cold or warm grey palette. Eerie.
- **High-contrast duo** — only 2 colors used at maximum vividity. Everything else is black.
- **Textured/material** — the grain/pattern IS the visual identity (paper, concrete, wood, sand).
- **Static/zen** — NO animation at all. Completely still. Peaceful or unsettling depending on context.

### Before finalizing, ask:
1. Would a fan of this franchise feel "at home" seeing this theme?
2. Does every visual element serve the theme identity?
3. Are the app icons clearly readable against the background?
4. Does the 88% flash moment feel thematically appropriate (not just generic)?
5. Is this theme's VISUAL PARADIGM different from the last 3-4 themes I made?

## Steps

1. Create `src/renderer/styles/themes/<theme-id>.css`
2. Register in `src/renderer/app.js`
3. Bump `package.json` version
4. Commit, tag, build, publish

---

## 1. CSS file structure

### `:root` variables — copy ALL of these, change values only

```css
:root {
  --radius: 2px;
  --app-clip: none;
  --overlay-clip: none;
  --bg: #...;
  --panel-bg: rgba(..., 0.99);
  --overlay-bg: rgba(..., 0.97);
  --header-bg: rgba(..., 0.04);
  --font: 'Font', fallback, sans-serif;   /* or serif */
  --text: #...;
  --text-dim: rgba(..., 0.45);
  --accent-c: #...;   /* primary accent */
  --accent-m: #...;   /* secondary */
  --accent-y: #...;   /* highlight */
  --border: rgba(..., 0.22);
  --border-h: rgba(..., 0.55);
  --glow-c: 0 0 7px rgba(...,.65), 0 0 20px rgba(...,.22);
  --glow-m: 0 0 6px rgba(...,.55), 0 0 16px rgba(...,.18);
  --glow-y: 0 0 7px rgba(...,.55), 0 0 20px rgba(...,.18);
  --pulse-glow: inset 0 0 22px rgba(...,.07);
  --scanlines: none;
  --drag-over-glow: inset 0 0 24px rgba(...,.10);
  --title-anim: <name> <duration>s ease-in-out infinite;
  --tile-hover-bg: rgba(..., 0.09);
  --tile-hover-border: rgba(..., 0.45);
  --tile-hover-shadow: 0 0 12px rgba(..., 0.20);
  --tile-active-bg: rgba(..., 0.18);
  --tile-icon-glow: drop-shadow(...) drop-shadow(...);
  --tile-icon-fx: brightness(0.92) saturate(1.2) contrast(1.1);
  --tile-icon-shape: polygon(...);   /* MUST BE UNIQUE — see rules below */
  --tile-label-spacing: 1.5px;
  --tile-label-transform: uppercase;
  --tile-label-weight: 400;
  --tile-label-style: normal;        /* or italic */
  --banner-icon-anim: banner-pulse 6s ease-in-out infinite;
  --app-entrance-anim: entrance-fade 1.8s ease-out forwards;
  --btn-hover-bg: rgba(..., 0.10);
  --btn-active-bg: rgba(..., 0.20);
  --drop-hint-border: rgba(..., 0.25);
  --drop-icon-color: rgba(..., 0.35);
  --hint-sub-color: rgba(..., 0.32);
  --rename-dashed: rgba(..., 0.40);
  --rename-input-bg: rgba(..., 0.07);
  --edit-bar-bg: rgba(..., 0.07);
  --edit-bar-border: rgba(..., 0.42);
  --edit-label-color: #...;
  --edit-label-glow: var(--glow-m);
  --btn-done-color: #...;
  --btn-done-border: rgba(..., 0.38);
  --btn-done-hover-bg: rgba(..., 0.09);
  --btn-done-hover-glow: var(--glow-m);
  --btn-add-border: rgba(..., 0.38);
  --update-bg: rgba(..., 0.05);
  --update-border: rgba(..., 0.30);
  --update-color: var(--accent-y);
  --update-btn-border: rgba(..., 0.25);
  --update-btn-hover-bg: rgba(..., 0.08);
  --update-btn-hover-glow: var(--glow-y);
  --btn-close-color: var(--accent-c);
  --btn-close-border: rgba(..., 0.38);
  --btn-close-hover-bg: rgba(..., 0.10);
  --btn-close-hover-glow: var(--glow-c);
  --picker-search-bg: rgba(..., 0.07);
  --picker-item-hover-bg: rgba(..., 0.09);
  --picker-item-active-bg: rgba(..., 0.17);
  --picker-placeholder-bg: rgba(..., 0.07);
  --skin-btn-active-bg: rgba(..., 0.17);
  --remove-btn-bg: rgba(..., 0.88);
  --remove-btn-border: var(--accent-c);
}
```

### Tile shape — `--tile-icon-shape` MUST be unique

Existing shapes (do NOT reuse):
- `circle(45%)` — old Persona 3
- `polygon(25% 0%, 75% 0%, 100% 20%, 100% 100%, 0% 100%, 0% 20%)` — Persona 3 (coffin lid)
- `polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)` — Ministry of Magic (pentagon)
- `polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)` — Dead Space (octagon)
- `polygon(0% 0%, 100% 0%, 100% 62%, 50% 100%, 0% 62%)` — Game of Thrones (heater shield)
- `inset(3% round 2px)` — Indiana Jones (display case)
- `polygon(0% 28%, 12% 10%, 35% 2%, 50% 0%, 65% 2%, 88% 10%, 100% 28%, 100% 100%, 0% 100%)` — Amnesia (gothic arch)
- `polygon(50% 0%, 72% 12%, 90% 32%, 95% 58%, 82% 80%, 65% 95%, 50% 100%, 35% 95%, 18% 80%, 5% 58%, 10% 32%, 28% 12%)` — Shire (12-point leaf)
- `polygon(5% 0%, 95% 0%, 100% 8%, 100% 62%, 75% 82%, 50% 100%, 25% 82%, 0% 62%, 0% 8%)` — Gryffindor (heraldic achievement shield, angled top corners + split base)
- `polygon(0% 0%, 88% 0%, 100% 15%, 100% 100%, 12% 100%, 0% 85%)` — Persona 5 (diagonal corner slash, opposing corners cut)
- `polygon(6% 0%, 94% 0%, 100% 8%, 100% 100%, 0% 100%, 0% 8%)` — Persona 4 (CRT TV screen, chamfered top corners)
- `polygon(0% 0%, 92% 0%, 100% 12%, 100% 100%, 8% 100%, 0% 88%)` — Alan Wake (torn page corner, opposing diagonal cuts)
- `polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)` — Lovecraft (elongated hexagon, eldritch geometry)
- `polygon(0% 0%, 100% 0%, 100% 80%, 80% 100%, 0% 100%)` — Resident Evil (ID badge, single bottom-right corner cut)
- `polygon(50% 5%, 98% 50%, 50% 95%, 2% 50%)` — Metal Gear Solid (tactical diamond/radar blip)
- `ellipse(47% 45% at 50% 50%)` — Parasite Eve (biological cell)
- `polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)` — FF7 (sword blade trapezoid, narrow top wide bottom)
- `polygon(0% 0%, 100% 0%, 100% 90%, 90% 100%, 10% 100%, 0% 90%)` — S.T.A.L.K.E.R. (PDA screen, chamfered bottom corners)
- `polygon(0% 0%, 100% 0%, 100% 70%, 85% 90%, 50% 100%, 15% 90%, 0% 70%)` — Event Horizon (gothic arch bottom, cathedral vault)
- `polygon(0% 0%, 100% 0%, 100% 75%, 85% 100%, 15% 100%, 0% 75%)` — RoboCop (visor plate, tapered bottom corners)
- `polygon(20% 0%, 80% 0%, 95% 25%, 100% 50%, 95% 75%, 80% 100%, 20% 100%, 5% 75%, 0% 50%, 5% 25%)` — Hufflepuff (barrel/cask, wider at center)
- `polygon(30% 0%, 50% 8%, 70% 0%, 100% 20%, 100% 100%, 0% 100%, 0% 20%)` — Predator (bio-mask, V-notch visor top)

Design for thematic relevance. Common shape ideas: diamond, hexagon, rounded-star, parallelogram, cross, arrowhead, crescent approximation, shield variants.

### Background identity — choose the RIGHT style for the franchise

**Every theme must feel different from every other theme.** The background is what gives each theme its identity. Do NOT default to the same approach every time. Pick the style that best fits the franchise.

#### Style A: Signature Effect (CSS-driven)
A unique, iconic visual motif rendered entirely with CSS gradients and keyframes. No SVG. Must be **Matrix-level iconic** — a single visual that defines the franchise.

**When to use**: ONLY when the franchise has an instantly recognizable, full-screen visual effect that is as iconic and dense as Matrix's digital rain. This is a high bar. Simple color washes, fog, or scanlines alone do NOT qualify.
**Examples**: Matrix (green digital rain — hundreds of falling characters fill the screen).
**Pros**: Minimal visual noise — icons stay very readable. Instantly recognizable. Distinctive.
**The bar**: If the effect wouldn't be immediately recognizable as "that franchise" in a screenshot, it's not Style A material. Use Style B instead.

```css
#grid-container::before {
  content: '';
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background: /* CSS gradients, repeating-linear-gradient, radial-gradient */;
  animation: <theme>-effect <n>s <timing> infinite;
}
```

#### Style B: In-World Device or Interface (SVG + CSS)
A recognizable physical object, device, or interface from the franchise's universe — something a character would actually look at, hold, or interact with. Drawn as an SVG, with CSS effects layered on top.

**When to use**: The franchise has an iconic device, screen, map, scanner, terminal, or physical object. **This is the default choice for most themes.**
**Examples**: Alien (motion tracker radar), Game of Thrones (parchment world map), Pip-Boy (Vault-Tec terminal screen), LCARS (starship panels), Persona 4 (Midnight Channel CRT television with antenna + dials + snow static).

**What makes it Style B (not C)**: You're drawing THE THING, not a spreadsheet about the thing.
- Persona 4 Style B = the TV itself (bezel, antenna, dials, screen, brand badge)
- Persona 4 Style C would be = a dossier listing Investigation Team members and Shadow stats

**The device SVG should include physical details**: bezels, knobs, dials, buttons, wear marks, brand labels, screws — things that make it feel like a real object, not a data readout. Pair the SVG with CSS effects that bring it alive (snow static on the TV screen, radar sweep on the motion tracker, flickering on a terminal).

**Opacity**: 0.55–0.72 depending on visual density. Devices are usually less noisy than lore pannos so can afford higher opacity.

#### Style C: Lore Panno (SVG schematic)
A detailed, information-dense SVG with three-panel layout (left data + center emblem + right roster). Gauges, character names, faction data, status readouts.

**When to use**: The franchise is rich with named characters, stats, factions, and lore that can fill a dossier. **Use sparingly — if every theme has a lore panno, they all look the same and we're back to square one.**
**Examples**: Gryffindor (heraldic codex), Persona 5 (phantom thieves dossier), Shire (hobbit almanac).

**WARNING — visual noise**: Lore pannos compete with launcher icons for attention. When using this style:
- Use **reduced opacity** (0.42–0.55), NOT the standard 0.72
- Scale animation opacity peaks proportionally (never exceed 0.60)
- Verify icon readability against the busiest part of the panno

#### How to choose: ask "what would a fan instantly recognize?"
- Fan recognizes A FULL-SCREEN VISUAL EFFECT that is Matrix-level iconic → Style A
- Fan recognizes A PHYSICAL THING/DEVICE/MAP from the world → Style B **(default choice)**
- Fan recognizes THE LORE/ROSTER/FACTION DATA → Style C (use sparingly)
- **When in doubt, use Style B.** Most franchises have a recognizable device or object.

### General rules for all styles

- **Animation personality**: Use `steps(1)` for glitchy/aggressive themes (cyberpunk, Persona). Use `ease-in-out` for atmospheric/warm themes (Shire, Gryffindor). Both MUST sync the 88% blackout/flash across all 4 animations.
- **Particles match theme**: Circles for organic/warm themes, diagonal slash lines for aggressive/angular themes, rectangles for tech themes.

### CPU-efficient animations (IMPORTANT)

`base.css` promotes key elements to GPU compositor layers via `will-change`. This means repaints are isolated per-layer instead of repainting the entire window. Follow these rules to keep idle CPU under 1%:

**Property cost tiers** (cheapest → most expensive):
1. `opacity`, `transform` — **free** (GPU-composited, zero main-thread cost)
2. `background-position` — **cheap** (promoted via `will-change` in base.css)
3. `color`, `text-shadow` — **low** (small repaint area on text elements)
4. `filter: brightness/saturate` — **moderate** (GPU shader, promoted in base.css)
5. `box-shadow` — **expensive** (full-element repaint, even on its own layer)
6. `clip-path` — **expensive** (geometry recalc + repaint)

**Rules for theme animations**:
- **Prefer `opacity` and `transform`** for continuous animations (particles, breathing effects, fades)
- **`box-shadow` on `#app`**: keep keyframe count low and duration ≥ 7s. The layer is promoted but each shadow change still triggers a repaint within that layer
- **`filter` on `#header::before`**: already promoted — safe to use, but prefer `steps(1)` over smooth easing when possible (e.g., `hdr-bar-glitch` is cheaper than `hdr-bar-pulse`)
- **`clip-path`**: only use with `steps(1)` so it changes a handful of times per cycle, not every frame
- **`#particles` scrolling**: `background-position` is fine — the layer is promoted. Use `linear` timing for constant-speed scrolling (no easing overhead)
- **Duration**: longer = fewer repaints/second. Prefer ≥ 5s for ambient animations. Reserve < 3s for small elements only (banner icon, title blink)
- **Do NOT add `will-change` in theme CSS** — `base.css` already declares it on `#app`, `#app::before`, `#header::before`, `#particles`, `#grid-container::before/::after`, `#title`, and `#theme-banner::before`. Duplicate `will-change` wastes GPU memory

---

## 2. Required visual elements

### `#app::after` — depth layers (Dark Mode 2.0)

This is the DEPTH FOUNDATION of the theme. These layers work together to create the sense of looking INTO a world, not at a flat surface. Think of it as 5 atmospheric layers stacked:

1. **Grain texture** (tiled SVG) — surface material feel (paper, metal, static, organic)
2. **Subtle line pattern** (repeating-linear-gradient) — directional energy (horizontal for calm, diagonal for aggressive)
3. **Ambient glow** (radial-gradient) — where the light source is (center? below? above?)
4. **Corner accents** (radial-gradient) — color bleeds that add warmth/danger/mystery at edges
5. **Vignette** (radial-gradient) — darkens edges, draws focus to center, creates depth

```css
#app::after {
  background:
    url("data:image/svg+xml,%3Csvg...feColorMatrix type='matrix' values='R G B ...'...%3E"),
    repeating-linear-gradient(...),   /* directional energy lines */
    radial-gradient(...),             /* primary ambient glow */
    radial-gradient(...),             /* corner accent 1 */
    radial-gradient(...),             /* corner accent 2 */
    radial-gradient(ellipse 100% 96% at 50% 50%, transparent 15%, <bg> 100%); /* vignette */
  background-size: 200px 200px, auto, auto, auto, auto, auto;
}
```
The fractalNoise SVG uses `feColorMatrix type='matrix'` to tint the grain. Tune values to match theme color. The vignette opacity controls how "enclosed" the space feels — higher for claustrophobic themes, lower for open/cosmic themes.

### `#header::before` — accent bar
```css
#header::before {
  background: linear-gradient(to bottom, <accent-hex>, rgba(..., 0.25));
  box-shadow: 0 0 9px rgba(...),.65), 0 0 26px rgba(...,.22);
}
```

### `#grid-container::before` — main background element

This pseudo-element carries the theme's visual identity. Its content depends on the chosen background style (see "Background identity" above).

**If Style A (Signature Effect):** Use CSS gradients/patterns + animation. No SVG needed.

**If Style B (In-World Device):** SVG device drawing + CSS effects.
SVG at 500x380 internal units. **Always use `contain`** so the SVG scales to fit any window size.
Use `background: url("...") center / contain no-repeat;`
Opacity: **0.82 base** on `#grid-container::before`. SVG text fill opacities should be **0.35–0.55** for labels — they get multiplied by the container opacity, so 0.45 × 0.82 = 0.37 effective. Text MUST be easily readable at a glance.

**If Style C (Lore Panno):** Opacity: **0.70 base**. Use the full SVG schematic spec below.

#### SVG composition — EVERY THEME MUST BE STRUCTURALLY UNIQUE

SVG at 500x380 internal units. **Always use `contain`**.
Use `background: url("...") center / contain no-repeat;`

**CRITICAL: Do NOT reuse the same layout structure.** Check the last 3-4 themes. If they all used "center emblem + side panels," you MUST pick a different composition. The STRUCTURE is what makes themes feel unique, not just the content painted on them.

**Layout compositions to choose from** (and invent new ones):
- **Three-panel** — left + center + right (classic, but DON'T overuse)
- **Circular/radial** — content arranged in rings around a center (radar, clock, orbit)
- **Asymmetric split** — one large element dominates one side, scattered details on the other
- **Full-bleed device** — the object fills the viewport edge-to-edge, no side panels
- **Diagonal axis** — elements arranged along a diagonal line
- **Grid/mosaic** — small repeating cells like a control panel dashboard
- **Scattered/organic** — elements placed irregularly, like notes pinned to a board
- **Top-heavy or bottom-heavy** — content clusters in one half, other half is atmosphere
- **Concentric rings** — data in expanding rings (target, orbit, tree rings)
- **L-shaped or T-shaped** — content fills two edges, negative space as design
- **Overlapping layers** — elements that visually overlap for depth, no clean columns

**Also consider mixing styles**: a device (B) with lore text woven into it. An abstract pattern (A) that suggests a device without drawing one literally. A panno (C) where the data IS the illustration.

**Building blocks** (use as needed, not all required):
- Fill-bar gauges, dotted leader lines, label/value hierarchy
- Border frames, corner ticks (but NOT mandatory — some themes are better frameless)
- In-universe vocabulary for labels
- Small symbolic drawings in dead space
- Status strips (but position them creatively — not always at the bottom)

### Opacity values — READABILITY IS NON-NEGOTIABLE

All SVG background text MUST be easily readable at a glance. The container opacity and SVG fill opacities multiply together — if both are low, text becomes invisible.

**Style B (devices):**
- Container: `opacity: 0.82` base
- SVG text fills: `0.35–0.55` (effective: 0.29–0.45)
- Keyframe pattern:
```css
@keyframes <theme>-device {
  0%, 100% { opacity: 0.82; }
  28%       { opacity: 0.88; }
  65%       { opacity: 0.75; }
  88%       { opacity: 0.04; }   /* synchronized blackout */
  89%       { opacity: 0.90; }
  92%       { opacity: 0.82; }
}
```

**Style C (pannos):**
- Container: `opacity: 0.70` base
- SVG text fills: `0.40–0.55` (effective: 0.28–0.39)
- Keyframe pattern:
```css
@keyframes <theme>-panno {
  0%, 100% { opacity: 0.70; }
  28%       { opacity: 0.78; }
  65%       { opacity: 0.62; }
  88%       { opacity: 0.04; }   /* synchronized blackout */
  89%       { opacity: 0.80; }
  92%       { opacity: 0.70; }
}
```

### `#header::after` — flavor text
```css
#header::after {
  content: 'LABEL // LABEL // LABEL // LABEL';
  position: absolute; left: 200px; top: 50%; transform: translateY(-50%);
  font-size: 7.5px; letter-spacing: 2.5px; color: rgba(..., 0.72);
  pointer-events: none; white-space: nowrap;
}
```
**Readability check**: `Luma × alpha ≥ 72` where `Luma = 0.299×R + 0.587×G + 0.114×B`

### `#grid-container::after` — ASCII terminal ghost text
```css
#grid-container::after {
  content: 'LINE 1\ALINE 2\A--------\AKEY: VALUE\AKEY: VALUE';
  display: flex; align-items: flex-end; justify-content: flex-end;
  padding: 0 12px 10px 0;
  font-family: 'Courier New', Consolas, monospace;
  font-size: 12px; line-height: 1.70; text-align: right; letter-spacing: 1px;  /* minimum 12px */
  color: rgba(..., 0.13); white-space: pre;
  animation: <theme>-readout <n>s ease-in-out infinite;
}

@keyframes <theme>-readout {
  0%, 100% { color: rgba(..., 0.13); }
  28%       { color: rgba(..., 0.17); }
  65%       { color: rgba(..., 0.10); }
  88%       { color: rgba(0, 0, 0, 0); }   /* blackout synced with SVG */
  89%       { color: rgba(..., 0.20); }
  92%       { color: rgba(..., 0.13); }
}
```

### `#edit-bar::after` — short flavor quote
### `#title` — font + letter-spacing (use theme font)
### Title keyframes — named `<theme>-title` or relevant name, with flash at 88%

```css
@keyframes <name> {
  0%, 100% { color: <base>; text-shadow: ...; }
  35%       { color: <bright>; text-shadow: ...; }  /* moonrise/buildup */
  65%       { color: <dim>; }
  88%       { color: <flash>; text-shadow: intense; opacity: 0.90; }  /* SYNC POINT */
  89%       { color: <base>; }
}
```

### App border animation — synchronized
```css
#app { animation: <name> <n>s ease-in-out infinite; }
@keyframes <name> {
  0%, 100% { box-shadow: 0 0 0 1px rgba(...,.20), inset 0 0 24px rgba(...,.06); }
  40%       { box-shadow: 0 0 0 1px rgba(...,.55), inset 0 0 42px rgba(...,.12); }
  88%       { box-shadow: 0 0 0 2px rgba(255,255,255,.82), inset 0 0 64px rgba(...,.22), 0 0 22px rgba(...,.30); }
  89%       { box-shadow: 0 0 0 1px rgba(...,.48), ...; }
}
```

### Banner
```css
#theme-banner { background: rgba(..., 0.99); border-top-color: rgba(..., 0.25); }
#theme-banner::before { content: '<ICON>'; color: <accent-hex>; font-size: 20px; }
#theme-banner-text { color: rgba(..., 0.XX); }  /* eff luma ≥ 72 */
```

### Tile hover + particles — micro-interactions that match personality

The hover effect and particles are micro-interactions — they make the interface feel "alive." Match them to the theme's emotional character:

**Hover effect styles** (`.app-tile::before` + `.app-tile:hover::before`):
- `tile-flicker` + `steps(1)` — **aggressive/glitchy** (cyberpunk, Persona, Chaos, Control)
- `tile-scan-v` — **military/tactical** (MGS, S.T.A.L.K.E.R., Star Wars, RoboCop)
- `tile-radial` — **organic/mystical** (Lovecraft, Eldar, Parasite Eve, Shire)

**Particle styles** (`#particles`):
- **Circles** — organic, warm, mystical themes (Shire pollen, Lifestream motes, cosmic dust)
- **Rectangles** — tech, military, industrial themes (S.T.A.L.K.E.R., MGS, Necrons)
- **Diagonal slashes** — aggressive, angular themes (Persona 5, Chaos)
- **Rotated squares** — debris, horror (Control Hiss debris, corrupted fragments)

**Particle motion**: `linear` timing for constant drift (cheapest). Match direction to theme — upward for rising energy/heat, downward for rain/falling, lateral for wind/space.

---

## 3. SVG encoding rules (CRITICAL)

- Wrap: `url("data:image/svg+xml,<encoded>")`
- `<` → `%3C`, `>` → `%3E`
- All attribute values: **single quotes**
- All colors: **`rgba()`** — no hex `#` in SVG attributes
- Filter refs: `filter='url(%23n)'` (`#` → `%23`)
- **NO `%` in SVG text content** — use `PCT`, `ALT`, or fractions instead
- No `&` in text content
- Spaces in attribute values are fine as-is
- `stroke-dasharray`, path `d=`, `points=` all encode normally

---

## 4. Register in `app.js`

In `THEME_BANNERS` (before closing `};`):
```javascript
  '<theme-id>': [
    'QUOTE 1 — ALL CAPS.',
    'QUOTE 2.',
    'QUOTE 3.',
    'QUOTE 4.',
    'QUOTE 5.',
  ],
```

In `THEME_NAMES` (before closing `};`):
```javascript
  '<theme-id>':  'DISPLAY NAME',
```

---

## 5. Version bump and publish

```bash
# Read current version from package.json first, then bump
# Edit package.json "version" field

git add src/renderer/styles/themes/<theme-id>.css src/renderer/app.js package.json
git commit -m "vX.Y.Z — <Theme Name> theme"
git tag vX.Y.Z
export GH_TOKEN=$(powershell.exe -Command "[Environment]::GetEnvironmentVariable('GH_TOKEN','User')" | tr -d '\r\n') && npm run build
```

`cleanup-releases.js` runs automatically post-build and keeps 4 most recent releases.
