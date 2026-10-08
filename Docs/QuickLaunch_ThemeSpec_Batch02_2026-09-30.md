# QuickLaunch theme spec, batch 2 (Judy, 2026-09-30)

Status: complete. Batch-level section (0), seven theme sections (1 to 7), fonts that would lift the batch (8), summary (9), open items (10). Uncommitted, as instructed.

Themes: akira, yakuza, parasite-eve, nonary-games, siren, persona-3, persona-5 (audit section 7, batch 2, "Japanese games and anime").
For: Ender. Branch `wip/theme-fidelity`, base `c00600a` (batch 1 build `eb926a6`, batch 1 spec `c00600a`).
Era calls (audit section 3, unchanged): persona-3 is the original 2006 game, not Reload; nonary-games is 999 (Nine Hours, Nine Persons, Nine Doors).

Inputs read: the audit (`QuickLaunch_ThemeAudit_2026-09-30.md`: section 1 shared constraints, the seven entries, batch 2 row, font wishlist), Sergei's rulings (`QuickLaunch_ThemeFidelity_Plan_2026-09-29.md`), Makoto's sheet (Persona and Japanese games section, font licence table), batch 1 spec (sections 0 and 12, with the batch 1 build as merged in `eb926a6`), the seven current theme files, `base.css`, `index.html`, `check-theme-contrast.js`, `create-theme.md`, `THEME_BANNERS` for the seven keys, the gallery mock set, the seven current grid screenshots and the akira hover shot (settings and hover states are rebuilt in the mock, so I did not need the other files), batch 1's shipped persona-4 and cyberpunk CSS and after-shots, and Ender's batch 1 notes and metrics (sigma, right-edge probe, label widths). Fonts were checked against `C:/Windows/Fonts`. Every banner line was checked on the web (0.8). **QuickLaunch was not launched.** Only this file was written in the repo tree; scratch files live in the session scratchpad.

**Shared constraints are not restated.** Every section inherits audit section 1 (C1 to C5, H1 to H8) and batch 1 sections 0 and 12 by reference (0.1 lists them). Where a rule is the same I point to it.

## At a glance

| # | Theme | Direction | Infinite animations, before to after | Lowest ratio (text / non-text) | Type | Squint (expected) |
|---|---|---|---|---|---|---|
| 1 | akira | Flat cel Neo-Tokyo: near-black violet, capsule-red rules, a concrete-grey banner strip with a Neo-Tokyo skyline and red crater sun, a red-and-white capsule (header tag and banner icon) with red katakana, a capsule pill behind the hovered label | 6 (+1 hover) to **0** | 5.58 / 3.80 | Arial Black title, Arial Bold caps, Yu Gothic Bold tag | 4 |
| 2 | yakuza | Kamurocho at night: black, crimson-and-gold trim (mirrored on header and banner), a gold serpent-dragon silhouette, a gold 龍 icon, pink and blue neon sign strips in the outer bands | 6 to **0** | 4.88 / 3.34 | Impact title, Bahnschrift caps, Yu Gothic Bold icon | 4 |
| 3 | parasite-eve | Manhattan on Christmas Eve 1997 through a PS1 window: night navy, a blue window header with a curtain valance and two mitochondria, flesh-red rules, a horizon-glow banner with a skyline, a range-dome wireframe and a snowflake | 6 to **0** | 5.29 / 3.57 | Palatino Linotype | 4 (least sure) |
| 4 | nonary-games (999) | The ship's steel and rust: brown-black ground, a steel line, rivets and rust streaks, a hatch with nine ticks and a 3 x 3 lamp grid, rust drips, an LCD box with a seven-segment 9 as icon, brass accents | 6 to **0** | 5.59 / 6.65 | Consolas Bold title, Bahnschrift caps | 4 |
| 5 | siren | Two channels and rising water: a header split warm and cold by a bright seam with a 屍人 tag, a fine static grain, band lines, a red-water banner with a wave edge and a horn, a cold-channel hover | 6 (+1 hover) to **0** | 4.98 / 3.58 | Segoe UI, Yu Gothic Bold tag | 4 |
| 6 | persona-3 (2006) | Flat cold blue: a slanted bright-blue header block, a clock at twelve and slanted bars, a crescent icon and a big rising full moon in the banner, a slanted white label highlight on hover, purple only in edit mode | 6 to **0** | 6.26 / 6.86 | Bahnschrift SemiCondensed | 4 |
| 7 | persona-5 | Red header and banner surfaces with black sawtooth slabs, red-and-white shards, icons cut on two corners, a white slanted label highlight with a red hard shadow on hover, one red ink burst in the corner | 6 (+1 hover) to **0** | 4.98 / 3.79 | Impact italic, Segoe UI body | 5 |
| | **Batch** | | **42 (+3 hover-only) to 0** | **text 4.88 (yakuza); non-text 3.34 (yakuza focus ring); icons 3.22 (persona-3 hover)** | | |

"Lowest ratio" is the minimum over every pair in that theme's tables (gate pairs, add-on pairs and the generic accent-on-fill roles); text pairs need 4.5, non-text pairs 3. Every pair in every theme clears its threshold. Lowest gate margin: yakuza `--accent-c` at 3.60:1 (needs 3), then siren `--accent-c` at 3.72:1. Icon minima (six mock plates, Terminal excluded, rest, hover and pressed): 3.22 to 4.05.

Art call: all seven are **redraw** (audit section 7). Nothing is "tone down" in this batch.

---

## 0. Batch-level section (applies to all seven)

### 0.1 What is inherited from batch 1 (pointers; not restated)

B1 = `WIP/QuickLaunch/Docs/QuickLaunch_ThemeSpec_Batch01_2026-09-30.md`.

| Rule | Where |
|---|---|
| Header art zone HZ: box 84 x 20 at `right:172px; top:10px` (x 168 to 252, y 10 to 30); the title must end at x 156 or earlier; hidden while the filter chip shows with `#header:has(#filter-chip:not(.hidden))::after { display:none; }` | B1 0.2, 0.1.5 |
| Frame art lives in `#grid-container`'s own `background` (not pseudo-elements: the grid scrolls, and tiles paint over it); frame bands FZ-L (x 1 to 11), FZ-R, FZ-T (container y 1 to 11); tile field and its 4 px keep-out (x 12 to P-12, y 52 to the banner top) hold no art | B1 0.1.1, 0.1.4, 0.2 |
| Banner: top strip BZ-T (up to 7 px), icon slot BZ-I (22 x 22 at x 14, text starts at x 46), art anchored to fixed offsets | B1 0.2 |
| Header lines are drawn **inside** the header (`border-bottom-color` plus `box-shadow: inset 0 -2px 0`); nothing paints below y 40 | B1 12.1 item 2, F3, F4 |
| The settings version value takes `--accent-text`: `#app-version { color: var(--accent-text); }` | B1 12.1 item 4, F2 |
| `#app::after` (z 199) paints above tiles, icons and the header: texture only, low alpha, never bands or ornaments; keep any layer off the header band with `top: var(--header-h)` if a header text could dim | B1 0.1.2, F7 |
| Ghost-text removal (`#grid-container::before/::after`, `#particles`, `#edit-bar::after`, `#header::after` text, `#app` animation, title and banner-icon animations) and the `\A` trap | B1 0.3 (per-theme keyframe names in 0.5 below) |
| Shared tile rules: focus = hover plus ring; no label halo; no sheen sweep; tile layout unchanged (border 1 px, tile height 94.7 to 95.4); opaque backgrounds; `--glow-*`, `--pulse-glow` and `--scanlines` are `none`; `--tile-icon-glow` is the no-op filter | B1 0.4 |
| Contrast method (gate pairs, add-on pairs, generic accent-on-fill roles, icons through the fx filter on rest, hover and pressed grounds; `brightness()` never below 1.0 on a dark theme; the gate reads the **first** `--name:` match, so the five gate variables are opaque hex and never appear in comments above `:root`) | B1 0.5, 0.1.8, 0.1.9, 0.1.11 |
| Texture measure: hidden-tiles shot, mean per-tile luminance sigma; ceiling is the recorded promise-mascot value | B1 0.6 (ceiling now known, 0.2 item 4) |
| Infinite-animation counting and the tier key | B1 0.7 |
| Verification set (grid, hover on CALCULATOR, settings, hidden-tiles, 640 x 420, 1024 x 700, focus ring, filter chip, edit mode, update banner, skin picker, scrolled one row) | B1 0.8 |
| The A/B/C overlap probe (Ender's `probe/A`, `B`, `C` and `AS`, `BS`, `CS`): A hides art and content, B shows art only, C shows content only; art = diff(B,A), content = diff(C,A); overlap must be 0 px and art inside the keep-out 0 px, at 424 x 300, 640 x 420, 1024 x 700 and in the chip, edit-bar, update-bar and focus-ring states | B1 12.3 (Ender's probes), Review 2 |
| Squint test: cover the title and banner text; a fan must still name the franchise; a bold signature element per theme | B1 12.2 |
| Review lessons: never put art within 3 px of a focus ring; no art under text; banner text on one line; check every state, not only the default | B1 12.1, 12.8 |

### 0.2 Facts from batch 1's build that this spec now relies on (settled, not open any more)

1. **Right-hand frame layers are positioned from the window edge (424 at the default size)**, not from the scrollbar: the background positioning box spans the 4 px scrollbar gutter (Ender's edge probe; cyberpunk uses `right 6px`, gryffindor `right 8px`). B1 0.1.13 is closed. The right band is window x 409 to 419, so `right 5px` to `right 15px`.
2. **`:has()` works** in the shipped Electron (`^32`, Chromium 128); the chip-hides-art rule is proven.
3. **`font-stretch` reaches Bahnschrift only as the SemiCondensed face.** Ender measured CALCULATOR at 70.7 px ink at `font-stretch: 87.5%` (SemiCondensed). In Chromium 154, which I used for prototypes, `75%`, `87.5%`, `condensed` and `semi-condensed` all resolve to the same SemiCondensed face and `font-variation-settings: 'wdth' 75` does not reach the width axis of a system font. So true Condensed is unreachable. **This batch uses `font-stretch: 87.5%` only** (persona-3), and every width below is the SemiCondensed measurement. (B1's cyberpunk and dead-space asked for 75% on some strings; they still render SemiCondensed, so nothing there changes.)
4. **Texture ceiling: promise-mascot recorded sigma 3.94.** Batch 1 values: persona-4 0.33, gryffindor 2.92, 2001 0.00, cyberpunk 0.00, stranger-things 0.06, shire 1.35, dead-space 0.35. Every theme here must record at most 3.94; only siren has texture (target 2.0 to 3.0, hard cap 3.0).
5. **Icon numbers to beat.** Ender's batch 1 minima (non-Terminal plates) were 3.21 to 4.01 at rest and 2.99 to 3.34 on hover; promise-mascot's grain left its hover Calculator plate at 2.99 in Ender's final metrics (3.10 in the spec, without texture), a hair under 3 that no review caught (open item 9). This batch's minima are 3.22 to 4.05 in every state; siren, the only textured theme, has its worst case computed with the grain at peak alpha (5.1).

### 0.3 New in batch 2 (rules that batch 1 did not need)

1. **Japanese text through CSS `content`, in three places** (akira header tag, yakuza banner icon, siren header tag). Installed Japanese faces on this machine: **Yu Gothic** (Light, Regular, Medium, Bold: `YuGothL/R/M/B.ttc`, plus the Yu Gothic UI faces in the same files), **MS Gothic / MS UI Gothic / MS PGothic** (`msgothic.ttc`, regular weight only, so a bold request is synthesised and smears), Microsoft YaHei (Simplified Chinese forms), Malgun Gothic, SimSun. **Not installed:** Meiryo, MS Mincho, Yu Mincho, BIZ UD, any Noto CJK. I rendered every glyph used with each face and checked it against two negative controls (Arial and Segoe UI, which correctly return no glyph): U+30CD U+30AA U+6771 U+4EAC (ネオ東京), U+9F8D (龍) and U+5C4D U+4EBA (屍人) are present in Yu Gothic Bold, MS Gothic and YaHei. Stacks: `'Yu Gothic', 'MS Gothic', sans-serif`, weight 700. Write the characters literally (file is UTF-8, no BOM); if the encoding of a tool in the chain is in doubt, the escapes are `\30CD\30AA\6771\4EAC`, `\9F8D` and `\5C4D\4EBA` (safe: each escape is followed by a backslash or a quote, never a hex digit). Neither form contains `\A`.
2. **Header and banner surfaces carry art in this batch** (gradients, sawtooth slabs, curtain valance, skyline, split header). They are layered `background` shorthands with the **colour as the last layer**. For the overlap probe, "art off" therefore means removing the decorative layers while keeping the surface; the exact `art-off` overrides per theme are in each theme's "Done when".
3. **`.btn-remove:hover` gets a background override in every theme.** Base paints `--accent-m` under a white ✕; with light `--accent-m` values that is unreadable (akira yellow 1.6:1, persona-3 lilac 2.1:1, persona-5 white 1.0:1). Each theme states its deep fill and the white-glyph ratio.
4. **Label highlights are shapes on the label, hover and focus only**: akira a capsule (`border-radius: 999px`), persona-3 and persona-5 a slanted parallelogram (`clip-path`, static). Nothing animates.
5. **`#header::before` is repurposed in siren** as the 2 px channel seam and is hidden while the chip shows, like the `::after` art.
6. **Gradient text** (`background-clip: text`) is used once, for siren's two-colour tag. It is static and paints one small text run.
7. **Impact has no italic face**; persona-5 asks for `font-style: italic` on Impact on purpose: Chromium synthesises the slant (about 14 degrees), which is the game's slanted heavy caps. Impact contains Cyrillic.
8. **The banner's right end may carry a big motif** (akira skyline, parasite-eve range dome, persona-3 moon), as promise-mascot's sticker did. Each such theme limits its banner strings so the longest ends at least 30 px before the motif, and gives the fallback if a string cannot be measured that short.

### 0.4 How this spec was verified (new: I could render, without launching QuickLaunch)

I built a **mock window**: the real `base.css` and `index.html` markup, the gallery's 14 mock tiles, one candidate theme file, rendered by headless Edge 154 (not QuickLaunch) at 424 x 300 and 1.5x, inside an iframe of the exact window size. I checked the mock against batch 1: it reproduces the shipped persona-4 grid and hover frames (same layout, scrollbar, tile geometry). On that mock I measured, for all seven candidate files: banner string widths, title right edges, the hidden-tiles sigma, the A/B/C overlap probe at 424 x 300, 640 x 420 and 1024 x 700 plus the states shot (chip, edit bar, update bar, focus ring), and the squint sheets. The **real gate script** (`check-theme-contrast.js`, run on copies in a temp skeleton, no rebaseline) reported **7 checked, 0 errors**; `grep -c infinite` is 0 for all seven; there is no `\A`.

Results of the probe: overlap 0 px and art inside the keep-out 0 px in every size and state. Smallest art-to-content clearance: 2.7 px (parasite-eve, and nonary-games with the focus ring on the first tile), 3.3 px (yakuza, persona-5, default state); values of 0.7 to 1.3 px in the states shot are the last visible tile row meeting the banner's top strip at the container edge, which touches by construction (batch 1 had the same).

**Caveats.** Chromium 154 is not Electron 32; sub-pixel text, filter rounding and `feTurbulence` grain can differ, so Ender's sigma and icon numbers win over mine. The mock's renders are the target look, not a pixel contract. The prototype files (`proto/<theme>.css`) and reference renders (`proto/<theme>-{grid,hover,settings}.png`) are in the session scratchpad at `judy/b2/h/proto/`; use them to diff, but **this spec's text is the contract**.

### 0.5 Deletions per theme (pattern in B1 0.3; here are the seven keyframe sets)

Delete every rule listed in B1 0.3 in each file, plus these `@keyframes`, which nothing else uses: akira `akira-burst`, `akira-speed`, `akira-readout`, `akira-border`, `akira-shockwave`; yakuza `yakuza-title`, `yakuza-signs`, `yakuza-readout`, `yakuza-border`, `yakuza-dragon`, `yakuza-rain`; parasite-eve `pe-title`, `pe-archive`, `pe-readout`, `pe-border`, `pe-motes`; nonary-games `nonary-title`, `nonary-hud`, `nonary-readout`, `nonary-border`, `nonary-data`; siren `siren-title`, `siren-sightjack`, `siren-readout`, `siren-border`, `siren-scan`; persona-3 `dark-hour`, `p3-tartarus-survey`, `p3-sees-readout`, `p3-dark-hour-border`, `p3-moon-motes`; persona-5 `p5-title`, `p5-schematic`, `p5-readout`, `p5-border`, `p5-metaverse`. Also delete each file's `.app-tile::before` shape and `.app-tile:hover::before` animation rules (replaced by `.app-tile::before { display:none; }`), the `--banner-icon-anim` and `--title-anim` values (set to `none`), and set `--app-entrance-anim: entrance-fade 0.8s ease-out forwards` (one-shot, not counted; `entrance-flash` is retired in akira and persona-5, and `entrance-fade 1.5 to 2.5s` elsewhere becomes 0.8 s).

Note for yakuza: `--banner-icon-anim` (banner-flicker) was dead code today, overridden by a direct `animation` on `#theme-banner::before`, which is why `grep -c infinite` reads 7 while the gallery counts 6.

### 0.6 Motion inventory (before to after; method B1 0.7; "hover-only" is counted separately)

Tier key (create-theme.md, cheapest first): 1 opacity or transform, 2 colour or text-shadow, 3 filter, 4 background-position or size, 5 box-shadow, 6 clip-path.

| Theme | Today (infinite, running at capture) | Hover-only today | After |
|---|---|---|---|
| akira | 6: `akira-burst` title text-shadow (2); `banner-throb` banner icon transform, opacity (1); `akira-speed` grid-container::before opacity (1); `akira-readout` ::after colour (2); `akira-border` `#app` box-shadow (5); `akira-shockwave` `#particles` background-size, opacity (4) | `tile-flicker .6s infinite` (opacity, 1) | **0** |
| yakuza | 6: `yakuza-title` colour, opacity, text-shadow (2); `yakuza-dragon` banner icon colour, opacity, text-shadow (2); `yakuza-signs` opacity (1); `yakuza-readout` colour (2); `yakuza-border` box-shadow (5); `yakuza-rain` background-position (4) | none infinite (`tile-flicker .4s forwards`, one-shot) | **0** |
| parasite-eve | 6: `pe-title` (2); `banner-pulse` (1); `pe-archive` (1); `pe-readout` (2); `pe-border` (5); `pe-motes` (4) | none infinite (`tile-radial`, one-shot) | **0** |
| nonary-games | 6: `nonary-title` (2); `banner-pulse` (1); `nonary-hud` (1); `nonary-readout` (2); `nonary-border` (5); `nonary-data` (4) | none infinite (`tile-scan-v`, one-shot) | **0** |
| siren | 6: `siren-title` (2); `banner-flicker` (1); `siren-sightjack` (1); `siren-readout` (2); `siren-border` (5); `siren-scan` (4) | `tile-flicker .4s infinite` (1) | **0** |
| persona-3 | 6: `dark-hour` (2); `banner-pulse` (1); `p3-tartarus-survey` (1); `p3-sees-readout` (2); `p3-dark-hour-border` (5); `p3-moon-motes` (4) | none infinite (`tile-radial`, one-shot) | **0** |
| persona-5 | 6: `p5-title` (2); `banner-throb` (1); `p5-schematic` (1); `p5-readout` (2); `p5-border` (5); `p5-metaverse` (4) | `tile-glitch .5s infinite` (background, 4) | **0** |
| **Batch total** | **42** (gallery `loopingAnimationsAtCapture` 6 in each of the seven) | 3 | **0** |

No new infinite animation is added anywhere. There is no `will-change` in any theme file. The only motion left in any state is the base one-shot `transition` on tiles (0.12 s) and the one-shot entrance fade. Acceptance: `grep -c infinite <theme>.css` is 0 for all seven and the after-run `loopingAnimationsAtCapture` is 0 for all seven (it was 6).

### 0.7 Fonts used (all confirmed present in `C:/Windows/Fonts`; all stock Windows 11)

| Family (CSS) | File(s) | Themes | Cyrillic (negative control Ebrima failed, as it should) |
|---|---|---|---|
| Arial, Arial Bold | `arial.ttf`, `arialbd.ttf` | akira body, labels, banner | yes |
| Arial Black | `ariblk.ttf` | akira title | yes |
| Impact | `impact.ttf` | yakuza title, persona-5 title, labels, banner | yes |
| Bahnschrift (variable; SemiCondensed face through `font-stretch: 87.5%`) | `bahnschrift.ttf` | yakuza labels, banner and body; nonary-games labels, banner and body; persona-3 title, labels, banner and body | yes |
| Palatino Linotype (regular, italic, bold) | `pala.ttf`, `palai.ttf`, `palab.ttf` | parasite-eve title, labels, banner, body | yes |
| Consolas Bold | `consolab.ttf` | nonary-games title | yes |
| Segoe UI, Segoe UI Semibold | `segoeui.ttf`, `seguisb.ttf` | siren title, labels, banner, body; persona-5 body | yes |
| Yu Gothic Bold (fallback MS Gothic) | `YuGothB.ttc`, `msgothic.ttc` | Japanese text: akira tag, yakuza icon, siren tag | yes (Latin and Cyrillic are not shown in these three runs) |

Not used and confirmed absent or non-stock: Yu Mincho, Cascadia, Meiryo, MS Mincho, BIZ UD, and every Office-only or Google face named in audit C2. Cyrillic tile names fall to the theme's first font, which covers U+0416, U+042F and U+0431 in all seven stacks.

### 0.8 Banner lines: what was verified, how, and what was dropped

Method: for each franchise I fetched primary or near-primary pages (Wikiquote, TV Tropes quote and franchise pages, Wikipedia, TheGamer's quote list, the official Akira store listing) and matched every string letter for letter. Case is presentation. Order matters (the gallery freezes on line 1). Type column: **quote** (spoken or written in the work), **tagline** (marketing line), **title** (the work's or a track's title), **term** (a game term or place name, chosen by the studio as a label, not a quote). Anything I could not find is not in the list.

| Theme | Line (in order) | Type | Source |
|---|---|---|---|
| akira | `NEO-TOKYO IS ABOUT TO E.X.P.L.O.D.E.` | tagline | The film's poster tagline; sold under this name in the official Akira store, and used with the dotted spelling as a film-stills post title. Not on Wikiquote's page; medium-high confidence in the dots |
| akira | `THAT'S MISTER KANEDA TO YOU, PUNK!` | quote (English dub) | Wikiquote, Akira (1988 film), Dialogue |
| akira | `I AM TETSUO.` | quote | Wikiquote, Tetsuo |
| akira | `KANEDA!` | quote (repeated line) | Wikiquote, Tetsuo |
| akira | `TETSUO!` | quote (repeated line) | Wikiquote, Kaneda |
| yakuza | `YO... KIRYU-CHAN!` | quote | Majima, Yakuza 0; TheGamer's quotes list (raw page checked) |
| yakuza | `THE DRAGON OF DOJIMA.` | term (epithet) | Kiryu's nickname, Wikipedia (Kazuma Kiryu, raw page checked) |
| yakuza | `THE MAD DOG OF SHIMANO.` | term (epithet) | Majima's nickname, Wikipedia (Goro Majima, raw page checked) |
| yakuza | `BAKA MITAI (I'VE BEEN A FOOL).` | title | The series' karaoke song: Wikipedia (Yakuza franchise) gives "Baka Mitai" (ばかみたい; lit. "I've Been a Fool"), first heard in Yakuza 5's karaoke minigame; the fan wiki titles its page with the same parenthesised form |
| parasite-eve | `I don't care if I die. I just want to get through this show.` | quote | Melissa's diary in the game, quoted on TV Tropes (Parasite Eve) |
| parasite-eve | `I'll even sell my soul to the Devil if I have to.` | quote | Melissa's diary, same page |
| parasite-eve | `Carnegie Hall. December 24th, 1997.` | term (setting label, **studio-composed**) | From the opening scene as Wikipedia's plot section states it; not a quote |
| nonary-games | `NINE HOURS, NINE PERSONS, NINE DOORS.` | title | Wikipedia |
| nonary-games | `WHERE THERE IS SHADOW, THERE IS LIGHT.` | quote | Zero, TV Tropes quotes page (first sentence of a three-sentence line) |
| nonary-games | `I AM RIGHT HERE... I'VE ALWAYS BEEN CLOSE TO YOU.` | quote (late-game, mild spoiler) | Zero, same page |
| siren | `Search the Yoshimura house and well.` | quote (in-game hint text) | TV Tropes (Forbidden Siren), quoted verbatim |
| siren | `Hanuda Village.` | term (**studio label**) | The village; TV Tropes and Wikipedia |
| siren | `Sightjack.` | term (**studio label**) | The core mechanic; Wikipedia, TV Tropes |
| persona-3 | `THE ARCANA IS THE MEANS BY WHICH ALL IS REVEALED.` | quote | The Arcana narration; TV Tropes (Persona 3) |
| persona-3 | `DEATH IS NOT A HUNTER UNBEKNOWNST TO ITS PREY.` | quote | First sentence of the Death arcana narration; same page |
| persona-3 | `BURN MY DREAD.` | title | The opening theme, Wikipedia (Persona 3); song **title** only, no lyric |
| persona-5 | `STEAL BACK YOUR FUTURE.` | tagline | Trailer 2; TV Tropes |
| persona-5 | `TAKE YOUR HEART.` | quote (motto) | Phantom Thieves' motto; Wikiquote |
| persona-5 | `YOU ARE A SLAVE. WANT EMANCIPATION?` | tagline | Teaser; Wikiquote and TV Tropes (the app's old line dropped the "A") |
| persona-5 | `LET US START THE GAME.` | tagline | PS3/PS4 screen; TV Tropes |
| persona-5 | `YOUR REHABILITATION WILL SOON BEGIN.` | quote | Igor; Wikiquote |
| persona-5 | `NO MORE HOLDING BACK!` | quote | Ann; Wikiquote ("You're right. No more holding back!") |

**Dropped for cause.** akira `THE END OF THE WORLD WAS ONLY THE BEGINNING.` (real Wikiquote tagline; 315 px would run into the skyline; reserve line if Sergei drops the skyline). persona-3 `NO ONE CAN ESCAPE TIME; IT DELIVERS US ALL TO THE SAME END.` (Pharos, real; 353 px runs into the moon; reserve). persona-3 `MEMENTO MORI.` (in the app today; I found no source). Every other line in the seven current `THEME_BANNERS` entries was not found in a source and is not kept: akira "What power! This is the power of a god!", "It has begun. The future."; yakuza "That's rad!", "A dragon never yields.", "Majima everywhere.", "Kamurocho never sleeps."; parasite-eve five invented lore lines; nonary-games "Seek a way out.", "The digital root is the key.", "Zero Escape. The Nonary Game begins.", "Trust no one. Suspect everyone."; siren five invented lines; persona-3 "The clock strikes midnight.", "Dark Hour stability confirmed.", "The moment man devoured the fruit of knowledge, he sealed his fate." (real but 68 characters, too long); persona-5 "The show's not over yet.", "I am thou, thou art I." (real, but already persona-4's banner line in batch 1).

**Studio-authored lines:** three, all marked above: parasite-eve `Carnegie Hall. December 24th, 1997.`, siren `Hanuda Village.` and `Sightjack.` They are plain labels made from verified facts, not invented copy. Siren has one real in-game string, not a spoken line. Jane: flag these to Sergei with the promise-mascot labels from batch 1.

**Line counts after:** akira 5, yakuza 4, parasite-eve 3, nonary-games 3, siren 3, persona-3 3, persona-5 6 (the rotation code has no minimum; the comment above `THEME_BANNERS` is stale, watch item 1 of B1 12.8).

**Fit (measured on the mock, real fonts, real tracking; the text box at 424 px is 364 px wide, starts at x 46):** the widest string per theme and where it ends: akira 236 (x 282), yakuza 196 (x 242), parasite-eve 267 (x 313), nonary-games 314 (x 360), siren 197 (x 243), persona-3 299 (x 345), persona-5 207 (x 270, text starts at x 62 there). All fit on one line with at least 50 px to spare. Ender confirms `scrollWidth <= clientWidth` for every string.

### 0.9 Trademark and signature elements: what is drawn and what is not

| Franchise element | What this spec draws | What it does not draw |
|---|---|---|
| Akira's red-and-white capsule (jacket pill, logo) | A generic two-tone pill: horizontal in the header, tilted 45 degrees in the banner, an outlined seam, no lettering, different proportions from the jacket art | The logo, the jacket, any letter or the film's exact capsule |
| Yakuza / Like a Dragon logo and dragon | One kanji (龍) from a stock font, and an original gold serpent-dragon silhouette with horns, whiskers and mane | The series logo, its brush lettering, its red dragon eye, any character or tattoo art |
| Persona logos, evoker, coffin, mask, star, calling card | Persona 3: a stopped clock, two slanted bars, a crescent and a full moon. Persona 5: sawtooth red and black surfaces, red-and-white shards, a tilted plain card with a slash, a small ink burst | Any logo, the P5 star, mask or calling-card artwork, the evoker (no gun shape), coffins, the P3 "25" numerals |
| 999's bracelet numbers and doors | A generic **seven-segment** "9" on an LCD-grey box (the game's bracelet uses a different, bold digit face), a round hatch with nine ticks and a 3 x 3 lamp grid, rivets, rust | The bracelet's face, the numbered door art, the title logo. **Judgement call for Sergei:** if a lone 9 on an LCD box still reads too close to the bracelet, replace the digit with an empty LCD box (a one-line SVG change) |
| Parasite Eve logo, Eve, Aya | Generic mitochondria, a range-dome wireframe, a night skyline, a curtain valance, a snowflake | The logo, any character, the game's UI art |
| Forbidden Siren | A siren horn silhouette, static-band lines, red water | Any Shibito art, the logo |

### 0.10 Where this spec departs from the audit, and why

| Theme | Audit direction | This spec | Reason |
|---|---|---|---|
| akira | capsule as banner icon and tile hover shape; a "ネオ東京" tag in MS Gothic bold; flat rectangles; Arial Black title | Adds a concrete-grey banner with a Neo-Tokyo skyline and red crater sun; the capsule is in the header **and** the banner; the tile hover shape is a capsule label pill; the tag is Yu Gothic Bold | Squint lift (the capsule and the skyline carry the theme); MS Gothic has no bold face and synthetic bold smears at 11 px |
| yakuza | a single-line coiled dragon; two 6 px neon bars | A **filled** gold dragon silhouette; the neon bars run the full height as repeating sign segments | The single line read as a sine wave in the mock; the bars stay 6 px and outside the keep-out |
| parasite-eve | curtain on the header top, skyline on the banner top, dome circle as banner icon, Palatino labels, 4 px tiles | Curtain 6 px (8 px touched the header buttons); skyline along the banner **bottom** (the top strip is only 7 px); the dome is a big wireframe at the banner's right end; the icon is a snowflake; mitochondria in the header; red rules | A skyline needs 13 px; December 24th at Carnegie Hall is the setting; red rules restore the flesh red that the navy hides. Accent `#D03444`, not the audit's `#C42A3A` (the focus ring was 3.1:1) |
| nonary-games | LCD box with a "9" in the banner; round door with ring lock and nine ticks; rust streaks; teal focus; digit face Consolas Bold | The LCD is the banner **icon** (22 px), the hatch has nine ticks plus a 3 x 3 lamp grid, rivet row and drips added; focus is brass | Teal `#1F5A6A` is 2.5:1 against the ground and fails the ring test; the icon slot is the safe home for the LCD |
| siren | header split with a hard seam; three static-band lines; a red-water gradient rising to 12 percent height; Segoe UI Semilight | The **banner** is the red water; the seam is 2 px and hides with the chip; light grain added; Segoe UI regular | A gradient inside the tile field would sit behind opaque tiles and never show; Semilight is hairline at 12 px (B1 12.8 watch item 3) |
| persona-3 | two skewed bars; a hollow "25" in the banner; crescent icon; purple on hover only; condensed caps | Bars plus a clock stopped at twelve in the header; no numerals; crescent icon plus a full moon at the banner's right; hover is a slanted white label highlight; purple marks edit mode; SemiCondensed only | No text in SVG (B1 0.2) and numerals would be logo-adjacent; the full moon is the bold signature; the hover highlight is the game's menu cue |
| persona-5 | header and banner as skewed black polygons via static `clip-path` | Red header and banner **surfaces** with black slabs and sawtooth edges done in `background` | `clip-path` on the header would clip the buttons and any focus outline; backgrounds cost nothing and cannot cover content |
| all | frame art in gutters and the frame | Frame art only in the bands, header and banner; gutters unused | B1 0.10 |

### 0.11 Suggested implementation order for Ender

1. **akira**, then **persona-3** and **persona-5** (the Atlus pair shares the slanted label highlight).
2. **yakuza**, **parasite-eve**, **nonary-games**: art is background layers and small SVGs.
3. **siren** last: it is the only theme with texture, so record its sigma and tune the grain coefficient (5.3).
4. After each theme: `npm run check:contrast` (no `--rebaseline`), `grep -c infinite`, the gallery after-run, the hidden-tiles shot, the A/B/C probe at the three sizes plus the states shot, and the theme's "Done when".

---

## 1. akira (AKIRA): DONE

**Audit:** score 2, redraw. It is the generic red-neon-on-black version: a dark red screen with a faint grid, circular icons, tan caps, a plain red disc as banner icon, and a burst and shockwave animation; cyan `#00A8FF` is Cyberpunk's colour, not this film's.
**Direction:** flat cel Neo-Tokyo. A near-black violet ground, capsule red for rules and focus, concrete grey for the banner strip, hazard yellow only where the app talks (values and edit mode), white type. The film's two cues carry the theme: a red-and-white capsule (header tag and banner icon) and a Neo-Tokyo skyline with a red crater sun at the banner's right end, on a flat grey strip. Hover puts a capsule-shaped red pill behind the label. No glow, no texture, no animation.

### 1.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 2px;
  --app-clip: none;
  --overlay-clip: none;
  --bg: #0D0D12;
  --panel-bg: #14141B;
  --overlay-bg: #0D0D12;
  --header-bg: #15151C;
  --font: Arial, 'Segoe UI', sans-serif;
  --text: #F5F5F5;
  --text-dim: #A6A8B8;
  --accent-c: #E60012;
  --accent-m: #F5C400;
  --accent-y: #F5F5F5;
  --accent-text: #F5C400;
  --border: #3A3A48;
  --border-h: #E60012;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #E60012;
  --title-anim: none;
  --tile-hover-bg: #1D1216;
  --tile-hover-border: #E60012;
  --tile-hover-shadow: none;
  --tile-active-bg: #1D1216;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: contrast(1.1) saturate(1.1);
  --tile-icon-shape: none;
  --tile-label-spacing: 0.4px;
  --tile-label-transform: uppercase;
  --tile-label-weight: 700;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #2A1418;
  --btn-active-bg: #3A181E;
  --drop-hint-border: #4A4A5A;
  --drop-icon-color: #8A8C9A;
  --hint-sub-color: #A6A8B8;
  --rename-dashed: #E60012;
  --rename-input-bg: #1D1216;
  --edit-bar-bg: #211C06;
  --edit-bar-border: #F5C400;
  --edit-label-color: #F5C400;
  --edit-label-glow: none;
  --btn-done-color: #F5C400;
  --btn-done-border: #F5C400;
  --btn-done-hover-bg: #3A3208;
  --btn-done-hover-glow: none;
  --btn-add-border: #8A8C9A;
  --update-bg: #1A1A22;
  --update-border: #F5F5F5;
  --update-color: #F5F5F5;
  --update-btn-border: #F5F5F5;
  --update-btn-hover-bg: #2E2E3A;
  --update-btn-hover-glow: none;
  --btn-close-color: #F5C400;
  --btn-close-border: #F5C400;
  --btn-close-hover-bg: #3A3208;
  --btn-close-hover-glow: none;
  --picker-search-bg: #1D1216;
  --picker-item-hover-bg: #1D1216;
  --picker-item-active-bg: #2A1418;
  --picker-placeholder-bg: #1D1216;
  --skin-btn-active-bg: #2A1418;
  --remove-btn-bg: #B8000F;
  --remove-btn-border: #F5C400;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; I also ran the real script on the prototype file: 0 errors):

| Gate pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| --text on --bg | `#F5F5F5` on `#0D0D12` | 4.5:1 | **17.78:1** |
| --text-dim on --bg | `#A6A8B8` on `#0D0D12` | 4.5:1 | **8.23:1** |
| --accent-c on --bg | `#E60012` on `#0D0D12` | 3:1 | **4.04:1** |
| --accent-text on --bg | `#F5C400` on `#0D0D12` | 3:1 | **11.79:1** |
| --hint-sub-color on --bg | `#A6A8B8` on `#0D0D12` | 4.5:1 | **8.23:1** |

**Add-on pairs** (each text or control colour on its real surface; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#F5F5F5` on `#14141B` | 4.5:1 | **16.81:1** |
| Tile label on hover pill | `#FFFFFF` on `#C8000F` | 4.5:1 | **6.06:1** |
| Tile label on hover pill (pressed state) | `#FFFFFF` on `#C8000F` | 4.5:1 | **6.06:1** |
| Title on header | `#F5F5F5` on `#15151C` | 4.5:1 | **16.66:1** |
| Title dot (`.accent`) on header | `#FF4D57` on `#15151C` | 4.5:1 | **5.58:1** |
| Header version on header | `#A6A8B8` on `#15151C` | 4.5:1 | **7.71:1** |
| Header button glyph on header | `#F5F5F5` on `#15151C` | 4.5:1 | **16.66:1** |
| Header button glyph on button hover | `#FFFFFF` on `#2A1418` | 4.5:1 | **17.33:1** |
| Filter chip text on chip | `#F5C400` on `#1D1216` | 4.5:1 | **11.11:1** |
| Banner text on banner | `#0D0D12` on `#9C9EAD` | 4.5:1 | **7.30:1** |
| Header tag (katakana) on header | `#FF4D57` on `#15151C` | 4.5:1 | **5.58:1** |
| Edit label on edit bar | `#F5C400` on `#211C06` | 4.5:1 | **10.36:1** |
| Done / close button text on edit bar | `#F5C400` on `#211C06` | 4.5:1 | **10.36:1** |
| + FILE / + INSTALLED text on edit bar | `#F5F5F5` on `#211C06` | 4.5:1 | **15.62:1** |
| Done button text on its hover fill | `#FFFFFF` on `#3A3208` | 4.5:1 | **12.81:1** |
| Settings text on overlay | `#F5F5F5` on `#0D0D12` | 4.5:1 | **17.78:1** |
| Settings text on panel | `#F5F5F5` on `#14141B` | 4.5:1 | **16.81:1** |
| Settings label (text-dim) on panel | `#A6A8B8` on `#14141B` | 4.5:1 | **7.78:1** |
| Settings value / cheat key (accent-text) on panel | `#F5C400` on `#14141B` | 4.5:1 | **11.15:1** |
| Settings version value (accent-text, F2 rule) on overlay | `#F5C400` on `#0D0D12` | 4.5:1 | **11.79:1** |
| Settings CLOSE text on panel | `#F5C400` on `#14141B` | 4.5:1 | **11.15:1** |
| Settings CLOSE text on its hover fill | `#FFFFFF` on `#3A3208` | 4.5:1 | **12.81:1** |
| Hotkey error text (accent-m) on panel | `#F5C400` on `#14141B` | 4.5:1 | **11.15:1** |
| Hotkey input text on input fill | `#F5C400` on `#1D1216` | 4.5:1 | **11.11:1** |
| Picker row text on hover fill | `#F5F5F5` on `#1D1216` | 4.5:1 | **16.74:1** |
| Update banner text on update bar | `#F5F5F5` on `#1A1A22` | 4.5:1 | **15.86:1** |
| Update button text on hover fill | `#FFFFFF` on `#2E2E3A` | 4.5:1 | **13.39:1** |
| Drop-hint text (text-dim) on grid ground | `#A6A8B8` on `#0D0D12` | 4.5:1 | **8.23:1** |
| Remove glyph (#FFFFFF) on remove button | `#FFFFFF` on `#B8000F` | 3.0:1 | **6.90:1** |
| Remove glyph on remove button hover fill | `#FFFFFF` on `#B8000F` | 3.0:1 | **6.90:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#E60012` on `#14141B` | 3.0:1 | **3.82:1** |
| Focus ring on grid ground (non-text) | `#E60012` on `#0D0D12` | 3.0:1 | **4.04:1** |
| Hover border on grid ground (non-text) | `#E60012` on `#0D0D12` | 3.0:1 | **4.04:1** |
| Hover border on hover fill (non-text) | `#E60012` on `#1D1216` | 3.0:1 | **3.80:1** |
| Theme-picker row hover/active text (accent-text) on picker hover fill | `#F5C400` on `#1D1216` | 4.5:1 | **11.11:1** |
| Theme-picker selected row text (accent-text) on picker active fill | `#F5C400` on `#2A1418` | 4.5:1 | **10.55:1** |
| Picker / skin search input text (accent-text) on search fill | `#F5C400` on `#1D1216` | 4.5:1 | **11.11:1** |
| Rename / hotkey input text (accent-text) on input fill | `#F5C400` on `#1D1216` | 4.5:1 | **11.11:1** |
| Search placeholder (text-dim) on search fill | `#A6A8B8` on `#1D1216` | 4.5:1 | **7.75:1** |
| Hotkey recording text (accent-m) on input fill | `#F5C400` on `#1D1216` | 4.5:1 | **11.11:1** |
| Update dismiss glyph (text-dim) on update bar | `#A6A8B8` on `#1A1A22` | 4.5:1 | **7.34:1** |

**Lowest ratio in this theme: 3.80:1 (Hover border on hover fill (non-text)).** Lowest text ratio: 5.58:1 (Title dot (`.accent`) on header). Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (mock plates from the gallery, rest ground `#14141B`):

| Icon plate (mock) | After fx | Tile ground | Ratio | Needs 3:1 |
|---|---|---|---|---|
| Notepad `#5b7fa6` | `#5480AF` | `#14141B` | 4.44:1 | pass |
| Calculator `#6b6f76` | `#696D76` | `#14141B` | 3.53:1 | pass |
| Paint `#b07a4f` | `#BA7844` | `#14141B` | 5.11:1 | pass |
| Terminal `#3d4450` | `#353E4C` | `#14141B` | 1.70:1 | excluded (app art baseline, see 0.1.8) |
| Browser `#4f8a8b` | `#458C8D` | `#14141B` | 4.70:1 | pass |
| Files `#c09a3e` | `#CA9D2D` | `#14141B` | 7.31:1 | pass |

Lowest non-Terminal icon ratio at rest: **3.53:1** (pass). Terminal is 1.70:1 (the mock plate is dark art; the fx does not darken it). On the hover fill `#1D1216`: **3.52:1**; on the pressed fill `#1D1216`: **3.52:1** (both pass).

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex (the header and banner may carry opaque gradients; the lightest stop is the one measured above), so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.


Notes: `--accent-c` is capsule red and is used for fills, borders, the focus ring and the slider; `--accent-text` is hazard yellow (all small functional text that used to paint red: values, chip, hotkey field, picker rows); `--accent-m` is yellow too (edit label, hotkey error, done and close). Title, dot and the katakana tag use tints of the red that clear 4.5:1 on the header (`#FF4D57`). `--tile-hover-bg` and `--tile-active-bg` are the same dark red-black `#1D1216` (L 0.0075), dark enough for the mid-grey Calculator plate to keep 3:1.

### 1.2 Type (all stock Windows, verified in `C:/Windows/Fonts`)

| Role | Stack | Weight | Size | Tracking | Case |
|---|---|---|---|---|---|
| Body, settings, pickers (`--font`) | `Arial, 'Segoe UI', sans-serif` | 400 (base) | base | base | base |
| `#title` | `'Arial Black', 'Segoe UI Black', 'Segoe UI', sans-serif` (`ariblk.ttf`) | 900 | 11 px (base) | 2px | uppercase (markup) |
| `.tile-label` | `Arial, 'Segoe UI', sans-serif` (`arialbd.ttf` at weight 700) | 700 (`--tile-label-weight`) | 12 px (base) | 0.4px | uppercase (`--tile-label-transform`) |
| `#theme-banner-text` | `Arial, 'Segoe UI', sans-serif` | 700 | 11 px (base) | 0.5px | uppercase strings, as written in 0.8 |
| header tag (`#header::after`) | `'Yu Gothic', 'MS Gothic', sans-serif` (`YuGothB.ttc`) | 700 | 11 px | 0.5px | ネオ東京 |

Measured: the title is 120 px wide and ends at x 131.6 (art starts x 168: 36 px clear). Labels in Arial Bold 12 px with 0.4 px tracking: NOTEPAD 62, CALCULATOR 88, TERMINAL 65, BROWSER 66 px; the label box is 100 px and the pill adds 5 px of padding each side, so text up to 90 px shows in full and CALCULATOR fits with 2 px to spare (at 1 px tracking it did not fit and read "CALCULA..."; this is why the tracking is 0.4). "SPREADSHEET EDITOR" (146 px) ellipsizes as it does today. The katakana run is 46 px wide in a 50 px content box. Expected `fontsRendered`: `Arial Black, Arial, Yu Gothic`. **Cyrillic:** no Cyrillic text in this theme; Arial, Arial Black and Yu Gothic Bold contain U+0416 (negative control Ebrima failed), so Cyrillic tile names render in Arial Bold.

### 1.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the current grid speed-line SVG, the red bleed gradient, the ghost readout, header text, edit-bar text, particles, scanlines and vignette in `#app::after`, and the `#app` animation (B1 0.3, keyframes in 0.5). The theme has **no texture**: `#app::after { background: none; }` (expected sigma 0.00).

**A. Header, a rule and a tag (HZ).**
- `#header { border-bottom-color:#E60012; box-shadow: inset 0 -2px 0 #E60012; }`: a 3 px capsule-red line inside the header (y 37 to 40); `#header::before { background:#E60012; box-shadow:none; }` (the 2 px bar at the left edge).
- **Tag, `#header::after`**: `content:'ネオ東京'; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px; padding-left:34px; font:700 11px/20px 'Yu Gothic','MS Gothic',sans-serif; letter-spacing:0.5px; white-space:nowrap; color:#FF4D57; background: url(cap_hdr) no-repeat 0 3px / 30px 13px; pointer-events:none;` Hidden while the chip shows. At 424 wide: the capsule (SVG `cap_hdr`, 30 x 13, white left half, red right half, ink seam) sits at x 168 to 198, y 13 to 26; the katakana starts at x 202 and ends at x 248 (inside the 252 limit). "Neo Tokyo" is a plain place name, red on the dark header (`#FF4D57` on `#15151C` is 5.6:1).
- `#title` is white Arial Black with a red dot: `#title { font-family:'Arial Black','Segoe UI Black','Segoe UI',sans-serif; font-weight:900; letter-spacing:2px; color:#F5F5F5; text-shadow:none; } #title .accent { color:#FF4D57; }`.

**B. Banner, a concrete strip with a skyline and a capsule.** `#theme-banner { background: url(sky) right 12px bottom 0 / 84px 34px no-repeat, #9C9EAD; border-top: 3px solid #E60012; }`; the strip is flat concrete grey, text is ink `#0D0D12`.
- **Skyline, SVG `sky`, 84 x 34** at banner x 328 to 412 (window y 266 to 300 at 424 x 300): an ink `#0D0D12` stepped silhouette of fourteen columns (the tallest 31 px) with three antennas and twelve 2 x 1 lit windows in the strip colour, and a red `#E60012` disc of radius 12 centred at (60, 21) behind the towers (the crater sun). The longest akira string ends at x 282 and the skyline starts at x 328, so 46 px clear.
- **Icon, SVG `cap_ban`, 22 x 22** in `#theme-banner::before` (content '', 22 x 22, `font-size:0`, `opacity:1`): the capsule tilted 45 degrees with an ink outline (it must read on grey), white half and red half.
- Decoration only; no text in any SVG.

**C. Tiles.** Square-cornered (radius 2 px), fill `#14141B`, border `#2E2E3A`. Hover and focus: fill `#1D1216`, border `#E60012`, and a **capsule pill behind the label**: `border-radius:999px; padding:0 5px; background:#C8000F; color:#FFFFFF; box-shadow:0 0 0 2px #C8000F;` (white on `#C8000F` is 6.1:1). The pill is on the label in every state, so `padding:0 5px` is always applied.

**D. Nothing else.** No frame art in the bands, no gutter art, no art in the tile field. The strip and the header hold everything.

**Trademark note.** The capsule is a generic two-tone pill (no lettering, different proportions, horizontal in the header, tilted in the banner); it is not the jacket art or the logo. The skyline is an original silhouette.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #B8000F; }

/* window: no texture layer */
#app::after { background: none; }

/* header: 3 px capsule-red rule inside the header */
#header { border-bottom-color: #E60012; box-shadow: inset 0 -2px 0 #E60012; }
#header::before { background: #E60012; box-shadow: none; }
#header::after {
  content: 'ネオ東京';
  position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px; padding-left: 34px;
  font: 700 11px/20px 'Yu Gothic', 'MS Gothic', sans-serif; letter-spacing: 0.5px; white-space: nowrap;
  color: #FF4D57;
  background: @CAPH@ no-repeat 0 3px / 30px 13px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: 'Arial Black', 'Segoe UI Black', 'Segoe UI', sans-serif; font-weight: 900; letter-spacing: 2px; color: #F5F5F5; text-shadow: none; }
#title .accent { color: #FF4D57; }

/* tiles */
.app-tile { background: #14141B; border-color: #2E2E3A; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: var(--tile-hover-bg); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.tile-label { font-family: Arial, 'Segoe UI', sans-serif; padding: 0 5px; border-radius: 999px; }
.app-tile:hover .tile-label, .app-tile:focus-visible .tile-label, .app-tile:hover .tile-label.renameable {
  background: #C8000F; color: #FFFFFF; box-shadow: 0 0 0 2px #C8000F;
}

/* banner: concrete strip, ink text, tilted capsule */
#theme-banner { background: @SKY@ right 12px bottom 0 / 84px 34px no-repeat, #9C9EAD; border-top: 3px solid #E60012; }
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @CAPB@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: Arial, 'Segoe UI', sans-serif; font-weight: 700; letter-spacing: 0.5px; color: #0D0D12; }
```

| Placeholder | Is `url("data:image/svg+xml,...")` of SVG |
|---|---|
| `@SKY@` | `sky` |
| `@CAPH@` | `cap_hdr` |
| `@CAPB@` | `cap_ban` |

**SVG sources** (readable; single-quoted attributes, `rgb()` colours, no `<text>`; encode `<`, `>`, `#` as B1 0.2 says):

**`cap_hdr`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 13'>
<rect x='0.75' y='0.75' width='28.5' height='11.5' rx='5.75' fill='rgb(245,245,245)' stroke='rgb(245,245,245)' stroke-width='1.5'/>
<path d='M15 0.75 H23.5 A5.75 5.75 0 0 1 23.5 12.25 H15 Z' fill='rgb(230,0,18)'/>
<path d='M15 0 V13' stroke='rgb(13,13,18)' stroke-width='1.4'/>
</svg>
```

**`cap_ban`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<g transform='rotate(-45 11 11)'>
<rect x='0.9' y='5.4' width='20.2' height='11.2' rx='5.6' fill='rgb(245,245,245)' stroke='rgb(13,13,18)' stroke-width='1.8'/>
<path d='M11 6.3 H15.4 A4.7 4.7 0 0 1 15.4 15.7 H11 Z' fill='rgb(230,0,18)'/>
<path d='M11 5.4 V16.6' stroke='rgb(13,13,18)' stroke-width='1.5'/>
</g>
</svg>
```

**`sky`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'>
<circle cx='60' cy='21' r='12' fill='rgb(230,0,18)'/>
<path d='M0 34 V20 H8 V13 H14 V22 H18 V15 H27 V6 H33 V17 H40 V24 H44 V3 H50 V10 H53 V20 H61 V12 H68 V25 H72 V18 H78 V9 H84 V34 Z' fill='rgb(13,13,18)'/>
<path d='M30 6 V1 M47 3 V0 M81 9 V4' stroke='rgb(13,13,18)' stroke-width='1'/>
<g fill='rgb(156,158,173)'>
<rect x='20' y='18' width='2' height='1'/><rect x='23' y='22' width='2' height='1'/><rect x='29' y='10' width='2' height='1'/><rect x='29' y='15' width='2' height='1'/>
<rect x='45' y='8' width='2' height='1'/><rect x='45' y='14' width='2' height='1'/><rect x='47' y='20' width='2' height='1'/><rect x='63' y='16' width='2' height='1'/>
<rect x='64' y='21' width='2' height='1'/><rect x='74' y='22' width='2' height='1'/><rect x='80' y='14' width='2' height='1'/><rect x='3' y='25' width='2' height='1'/>
</g>
</svg>
```


### 1.4 Motion

| # | Today (infinite) | Element and property | Fate |
|---|---|---|---|
| 1 | `akira-burst 3s steps(1)` | `#title` text-shadow (tier 2) | removed |
| 2 | `banner-throb 3s` | `#theme-banner::before` transform, opacity (tier 1) | removed |
| 3 | `akira-speed 3s` | `#grid-container::before` opacity (tier 1) | removed |
| 4 | `akira-readout 3s` | `#grid-container::after` colour (tier 2) | removed |
| 5 | `akira-border 5s` | `#app` box-shadow (tier 5) | removed |
| 6 | `akira-shockwave 4s` | `#particles` background-size, opacity (tier 4) | removed |
| hover | `tile-flicker .6s steps(1) infinite` | `.app-tile:hover::before` opacity (tier 1) | removed (no sheen; `::before` is `display:none`) |

**Before 6 (+1 hover-only), after 0.** Nothing is animated; `grep -c infinite akira.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance (`entrance-flash` is retired).

### 1.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** fill `#14141B`, border `#2E2E3A` (1 px), radius 2 px, `::before` off; layout unchanged. Icons: `contrast(1.1) saturate(1.1)` (no darkening), shape `none` (the old 46 percent circle is gone; it made discs of every icon).
- **Hover:** fill `#1D1216`, border `#E60012` (3.8:1 on the hover fill), the capsule pill on the label, no glow, no transform.
- **Selected (focus-visible):** hover plus the base 2 px red ring at offset 2 (4.0:1 on the grid ground, 3.8:1 on the tile): `.app-tile:hover, .app-tile:focus-visible { background:var(--tile-hover-bg); border-color:var(--tile-hover-border); box-shadow:var(--tile-hover-shadow); }`.
- **Pressed:** base scale 0.96 on `#1D1216`.
- **Label:** white `#F5F5F5`, Arial Bold, uppercase, no halo.
- **Filter chip:** base rule (fill `#1D1216`, red border, yellow text 11.1:1). The header tag hides while it shows.
- **Edit bar:** `#211C06` fill, yellow rule and yellow label (no quote). Buttons: `+ FILE` and `+ INSTALLED` white with a grey border, `DONE` yellow. The tile ✕ is `#B8000F` with a yellow ring; on hover it stays deep red (`.btn-remove:hover { background:#B8000F; }`; white ✕ 6.9:1).
- **Settings overlay:** opaque `#0D0D12`, panel `#14141B`, yellow values and version (`#app-version`), red sliders and checkboxes.
- **Update banner:** white text on `#1A1A22` with a white rule (`--accent-y` is `#F5F5F5`).

### 1.6 Done when

1. `npm run check:contrast` passes with no rebaseline; `grep -c infinite akira.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`.
2. Header: a 3 px red line at y 37 to 40 with nothing below it; a white-and-red capsule at x 168 to 198, y 13 to 26 and the red katakana ネオ東京 ending by x 250; typing a letter hides both and shows the chip. `#title` right edge at most 132.
3. Banner: flat `#9C9EAD` with a 3 px red top border; the skyline with its red sun at x 328 to 412 flush with the bottom; a tilted white-and-red capsule at x 14 to 36; ink text on one line (`scrollWidth <= clientWidth` for all five strings).
4. Hover shot (CALCULATOR): a red capsule pill with white text, red border, dark red-black fill, no glow; no ellipsis on CALCULATOR.
5. No cyan or blue pixel anywhere in the grid or settings shot; yellow appears only in values, the version, chip, hotkey and picker text, and edit mode.
6. Settings shot: yellow "64px" and yellow version; the skin arrow is visible.
7. Hidden-tiles sigma 0.00 (no texture). Notepad plate: adjacent-row luminance difference at most 3 levels.
8. A/B/C probe at 424 x 300, 640 x 420, 1024 x 700 and the states shot: overlap 0 px, art in keep-out 0 px. Art-off for the probe: hide `#header::after` and `#theme-banner::before`, and set `#theme-banner { background:#9C9EAD !important; }` (my run: clearance 10.7 px, 10.0 px in the states shot).
9. `fontsRendered` lists `Arial Black`, `Arial` and `Yu Gothic`.

**Expected squint score: 4** (title and banner text covered). What survives: the ink-and-violet ground with two capsule-red rules, a white-and-red pill twice, red katakana, a flat concrete-grey strip carrying a Neo-Tokyo skyline with a red sun. What is missing for a 5: the film's huge red lettering and the bike; both would need a bundled display face (section 8).

---

## 2. yakuza (YAKUZA / LIKE A DRAGON): DONE

**Audit:** score 2, redraw. Pink and cyan neon on purple-black is the Blade Runner or synthwave look Makoto warns against (pink labels, a pink KAMUROCHO plate above the grid); Yakuza is crimson, gold and black with neon as background in a scuffed, humid city. Pink sign cards sat behind four tiles, the plate crowded the CALCULATOR icon, seven animations including rain. The lone 龍 banner glyph was the one good piece.
**Direction:** Kamurocho at night, in print. A black ground; crimson and gold trim (a crimson line inside the header with a gold line under it, mirrored on the banner); a gold serpent-dragon silhouette in the header; the 龍 kanji in gold as the banner icon; neon only as two 6 px vertical sign strips (pink left, blue right) in the outer bands, static and outside the tile field. Impact title, Bahnschrift caps labels, rounded-square tiles. Hover is a gold border with a crimson bar inside the tile's bottom edge. No rain, no glow, no animation.

### 2.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 5px;
  --app-clip: none;
  --overlay-clip: none;
  --bg: #0B0A0C;
  --panel-bg: #151214;
  --overlay-bg: #0B0A0C;
  --header-bg: #141113;
  --font: 'Bahnschrift', 'Segoe UI', sans-serif;
  --text: #F5F0E8;
  --text-dim: #B9B1A2;
  --accent-c: #CF1B21;
  --accent-m: #F0474D;
  --accent-y: #D4A83B;
  --accent-text: #D4A83B;
  --border: #3A3235;
  --border-h: #D4A83B;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #D4A83B;
  --title-anim: none;
  --tile-hover-bg: #1F1416;
  --tile-hover-border: #D4A83B;
  --tile-hover-shadow: inset 0 -3px 0 #CF1B21;
  --tile-active-bg: #1F1416;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: contrast(1.05) saturate(1.05);
  --tile-icon-shape: none;
  --tile-label-spacing: 1.2px;
  --tile-label-transform: uppercase;
  --tile-label-weight: 600;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #2A1A1C;
  --btn-active-bg: #3A2024;
  --drop-hint-border: #4A4044;
  --drop-icon-color: #8C8478;
  --hint-sub-color: #B9B1A2;
  --rename-dashed: #D4A83B;
  --rename-input-bg: #1F1416;
  --edit-bar-bg: #2A0E10;
  --edit-bar-border: #CF1B21;
  --edit-label-color: #F0474D;
  --edit-label-glow: none;
  --btn-done-color: #F0474D;
  --btn-done-border: #CF1B21;
  --btn-done-hover-bg: #4A1A1E;
  --btn-done-hover-glow: none;
  --btn-add-border: #8C8478;
  --update-bg: #0E1A24;
  --update-border: #3A9BD8;
  --update-color: #6DBBEE;
  --update-btn-border: #3A9BD8;
  --update-btn-hover-bg: #183048;
  --update-btn-hover-glow: none;
  --btn-close-color: #F0474D;
  --btn-close-border: #CF1B21;
  --btn-close-hover-bg: #4A1A1E;
  --btn-close-hover-glow: none;
  --picker-search-bg: #1F1416;
  --picker-item-hover-bg: #1F1416;
  --picker-item-active-bg: #2A1A1C;
  --picker-placeholder-bg: #1F1416;
  --skin-btn-active-bg: #2A1A1C;
  --remove-btn-bg: #A8121A;
  --remove-btn-border: #F0474D;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; I also ran the real script on the prototype file: 0 errors):

| Gate pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| --text on --bg | `#F5F0E8` on `#0B0A0C` | 4.5:1 | **17.42:1** |
| --text-dim on --bg | `#B9B1A2` on `#0B0A0C` | 4.5:1 | **9.29:1** |
| --accent-c on --bg | `#CF1B21` on `#0B0A0C` | 3:1 | **3.60:1** |
| --accent-text on --bg | `#D4A83B` on `#0B0A0C` | 3:1 | **8.90:1** |
| --hint-sub-color on --bg | `#B9B1A2` on `#0B0A0C` | 4.5:1 | **9.29:1** |

**Add-on pairs** (each text or control colour on its real surface; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#F5F0E8` on `#161416` | 4.5:1 | **16.16:1** |
| Tile label on tile hover | `#F5F0E8` on `#1F1416` | 4.5:1 | **15.82:1** |
| Tile label on tile pressed (pressed state) | `#F5F0E8` on `#1F1416` | 4.5:1 | **15.82:1** |
| Title on header | `#F5F0E8` on `#141113` | 4.5:1 | **16.54:1** |
| Title dot (`.accent`) on header | `#F0474D` on `#141113` | 4.5:1 | **5.10:1** |
| Header version on header | `#B9B1A2` on `#141113` | 4.5:1 | **8.82:1** |
| Header button glyph on header | `#F5F0E8` on `#141113` | 4.5:1 | **16.54:1** |
| Header button glyph on button hover | `#FFFFFF` on `#2A1A1C` | 4.5:1 | **16.63:1** |
| Filter chip text on chip | `#D4A83B` on `#1F1416` | 4.5:1 | **8.09:1** |
| Banner text on banner | `#F5F0E8` on `#151214` | 4.5:1 | **16.40:1** |
| Banner icon (kanji, gold) on banner | `#D4A83B` on `#151214` | 3.0:1 | **8.39:1** |
| Edit label on edit bar | `#F0474D` on `#2A0E10` | 4.5:1 | **4.89:1** |
| Done / close button text on edit bar | `#F0474D` on `#2A0E10` | 4.5:1 | **4.89:1** |
| + FILE / + INSTALLED text on edit bar | `#F5F0E8` on `#2A0E10` | 4.5:1 | **15.84:1** |
| Done button text on its hover fill | `#FFFFFF` on `#4A1A1E` | 4.5:1 | **14.41:1** |
| Settings text on overlay | `#F5F0E8` on `#0B0A0C` | 4.5:1 | **17.42:1** |
| Settings text on panel | `#F5F0E8` on `#151214` | 4.5:1 | **16.40:1** |
| Settings label (text-dim) on panel | `#B9B1A2` on `#151214` | 4.5:1 | **8.75:1** |
| Settings value / cheat key (accent-text) on panel | `#D4A83B` on `#151214` | 4.5:1 | **8.39:1** |
| Settings version value (accent-text, F2 rule) on overlay | `#D4A83B` on `#0B0A0C` | 4.5:1 | **8.90:1** |
| Settings CLOSE text on panel | `#F0474D` on `#151214` | 4.5:1 | **5.06:1** |
| Settings CLOSE text on its hover fill | `#FFFFFF` on `#4A1A1E` | 4.5:1 | **14.41:1** |
| Hotkey error text (accent-m) on panel | `#F0474D` on `#151214` | 4.5:1 | **5.06:1** |
| Hotkey input text on input fill | `#D4A83B` on `#1F1416` | 4.5:1 | **8.09:1** |
| Picker row text on hover fill | `#F5F0E8` on `#1F1416` | 4.5:1 | **15.82:1** |
| Update banner text on update bar | `#6DBBEE` on `#0E1A24` | 4.5:1 | **8.38:1** |
| Update button text on hover fill | `#FFFFFF` on `#183048` | 4.5:1 | **13.50:1** |
| Drop-hint text (text-dim) on grid ground | `#B9B1A2` on `#0B0A0C` | 4.5:1 | **9.29:1** |
| Remove glyph (#FFFFFF) on remove button | `#FFFFFF` on `#A8121A` | 3.0:1 | **7.59:1** |
| Remove glyph on remove button hover fill | `#FFFFFF` on `#CF1B21` | 3.0:1 | **5.48:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#CF1B21` on `#161416` | 3.0:1 | **3.34:1** |
| Focus ring on grid ground (non-text) | `#CF1B21` on `#0B0A0C` | 3.0:1 | **3.60:1** |
| Hover border on grid ground (non-text) | `#D4A83B` on `#0B0A0C` | 3.0:1 | **8.90:1** |
| Hover border on hover fill (non-text) | `#D4A83B` on `#1F1416` | 3.0:1 | **8.09:1** |
| Theme-picker row hover/active text (accent-text) on picker hover fill | `#D4A83B` on `#1F1416` | 4.5:1 | **8.09:1** |
| Theme-picker selected row text (accent-text) on picker active fill | `#D4A83B` on `#2A1A1C` | 4.5:1 | **7.49:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#D4A83B` on `#1F1416` | 4.5:1 | **8.09:1** |
| Picker / skin search input text (accent-text) on search fill | `#D4A83B` on `#1F1416` | 4.5:1 | **8.09:1** |
| Rename / hotkey input text (accent-text) on input fill | `#D4A83B` on `#1F1416` | 4.5:1 | **8.09:1** |
| Search placeholder (text-dim) on search fill | `#B9B1A2` on `#1F1416` | 4.5:1 | **8.44:1** |
| Hotkey recording text (accent-m) on input fill | `#F0474D` on `#1F1416` | 4.5:1 | **4.88:1** |
| Update dismiss glyph (text-dim) on update bar | `#B9B1A2` on `#0E1A24` | 4.5:1 | **8.28:1** |

**Lowest ratio in this theme: 3.34:1 (Focus ring (accent-c) on tile rest (non-text)).** Lowest text ratio: 4.88:1 (Hotkey recording text (accent-m) on input fill). Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (mock plates from the gallery, rest ground `#161416`):

| Icon plate (mock) | After fx | Tile ground | Ratio | Needs 3:1 |
|---|---|---|---|---|
| Notepad `#5b7fa6` | `#577FAA` | `#161416` | 4.38:1 | pass |
| Calculator `#6b6f76` | `#6A6E76` | `#161416` | 3.58:1 | pass |
| Paint `#b07a4f` | `#B47A4A` | `#161416` | 5.08:1 | pass |
| Terminal `#3d4450` | `#3A414F` | `#161416` | 1.79:1 | excluded (app art baseline, see 0.1.8) |
| Browser `#4f8a8b` | `#4B8C8D` | `#161416` | 4.74:1 | pass |
| Files `#c09a3e` | `#C59B36` | `#161416` | 7.08:1 | pass |

Lowest non-Terminal icon ratio at rest: **3.58:1** (pass). Terminal is 1.79:1 (mock plate art; the fx does not darken it). On the hover fill `#1F1416`: **3.51:1**; on the pressed fill `#1F1416`: **3.51:1** (both pass).

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex (the header and banner may carry opaque gradients; the lightest stop is the one measured above), so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.


Notes: `--accent-c` is crimson `#CF1B21` (audit `#C4161C` gave a 3.0:1 ring on the tile; this clears 3.3:1); `--accent-text` is gold `#D4A83B` (values, chip, hotkey, picker rows, version); `--accent-m` is a lighter crimson `#F0474D` for small red text (edit label, hotkey error, done, close, title dot: 4.9 to 5.1:1). The neon pink `#E83A8C` and blue `#3A9BD8` exist only as strip pixels and as the update banner's blue text (`--accent-y` `#6DBBEE` on `#0E1A24`, 8.4:1); against the ground the strips are 5.1:1 (pink) and 6.5:1 (blue), decoration only.

### 2.2 Type (all stock Windows, verified in `C:/Windows/Fonts`)

| Role | Stack | Weight | Size | Tracking | Case |
|---|---|---|---|---|---|
| Body, settings, pickers (`--font`) | `Bahnschrift, 'Segoe UI', sans-serif` (normal width) | 400 (base) | base | base | base |
| `#title` | `Impact, 'Arial Black', sans-serif` (`impact.ttf`) | 400 (Impact is one weight) | 11 px (base) | 3px | uppercase (markup) |
| `.tile-label` | `Bahnschrift, 'Segoe UI', sans-serif` at weight 600 | 600 (`--tile-label-weight`) | 12 px (base) | 1.2px | uppercase |
| `#theme-banner-text` | same | 600 | 11 px (base) | 1.2px | as written in 0.8 (uppercase) |
| banner icon (`#theme-banner::before`) | `'Yu Gothic', 'MS Gothic', sans-serif` (`YuGothB.ttc`) | 700 | 22 px | none | 龍 |

Measured: the title is 99 px wide and ends at x 111.7 (art at 168: 56 px clear). Labels in Bahnschrift SemiBold 12 px, 1.2 px tracking, normal width: NOTEPAD 60, CALCULATOR 86, TERMINAL 66, BROWSER 64 px, all inside the 100 px box; "SPREADSHEET EDITOR" (145 px) ellipsizes as it does today. The banner strings end at x 156, 196, 212 and 242 (`YO... KIRYU-CHAN!` 110 px, `BAKA MITAI (I'VE BEEN A FOOL).` 196 px). No `font-stretch`. Expected `fontsRendered`: `Impact, Bahnschrift, Yu Gothic`. **Cyrillic:** none in this theme; Impact and Bahnschrift contain U+0416 (negative control failed as it should).

### 2.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the four current SVGs (sign cards, grain, two rain tiles), the neon-blackout keyframes, the ghost readout, header text, edit-bar text, particles, the `#app` neon pulse, and every glow (B1 0.3, keyframes in 0.5). Also delete the `#app::after` bleeds and vignette: `#app::after { background: none; }` (no texture, sigma 0.00).

**A. Header, crimson and gold trim (inside the header) and the dragon (HZ).**
- `#header { border-bottom-color:#D4A83B; box-shadow: inset 0 -2px 0 #CF1B21; }`: from y 37 to 39 crimson, then the 1 px gold border at y 39 to 40. Nothing below y 40. `#header::before { background:#CF1B21; box-shadow:none; }`.
- **Dragon, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px; background:url(dragon) no-repeat 0 0 / 84px 20px; pointer-events:none;`, hidden while the chip shows. SVG `dragon`, `viewBox 0 0 84 20`: an original serpent in gold `rgb(212,168,59)`: a body drawn as one tapered polygon (tail point at (2,16.7), three crests, thickest near the neck, about 4.8 px), six mane spikes on the back, a head with an upper and a lower jaw, two horns, a curled whisker, and one crimson eye `rgb(240,71,77)` r 1 at (75.4, 8.6). Its geometry spans x 1.8 to 83.6 and y 1.6 to 17.7 of the 84 x 20 box. In the mock it reads as a dragon at 1x. This replaces the audit's "single-line coiled dragon", which read as a sine wave when drawn.

**B. Frame, neon sign strips in the two bands (`#grid-container` background; they do not scroll).** Two `repeat-y` layers, 6 x 26 tiles: a lit sign box 6 x 23 in `rgb(232,58,140)` (pink, left) or `rgb(58,155,216)` (blue, right), a 2 x 19 pale core (`rgb(255,176,214)` or `rgb(178,222,250)`), a 3 px gap between boxes.
`background: url(pink) left 3px top 0 / 6px 26px repeat-y, url(blue) right 7px top 0 / 6px 26px repeat-y;`
Window coordinates at 424 wide: pink x 3 to 9, blue x 411 to 417 (right offsets are measured from the window edge, 0.2 item 1). The tile keep-out starts at x 12 and ends at x 408, so each strip is 3 px clear (the probe read 3.3 to 4.0 px to the focus ring), and 3 px from the scrollbar (x 420 to 424). The last box at the bottom is cut by the container edge; that is fine for a sign that continues.

**C. Banner, mirrored trim and a kanji icon.** `#theme-banner { background:#151214; border-top:0; }`.
- **Trim, `#theme-banner::after`**: `content:''; position:absolute; top:0; left:0; right:0; height:4px; background:linear-gradient(#D4A83B 0 1px, #CF1B21 1px 4px); pointer-events:none;` (gold line against the tile field, crimson below it, the mirror of the header). The text starts at banner y 15, so the trim is 11 px clear.
- **Icon, `#theme-banner::before`**: `content:'龍'; width:22px; font:700 22px/22px 'Yu Gothic','MS Gothic',sans-serif; color:#D4A83B; opacity:1; text-align:center;`. A single kanji in a stock font is not the series logo (0.9). Gold on the banner is 8.4:1.

**D. Tiles.** Radius 5 px, fill `#161416`, border `#2E292C`. Hover and focus: fill `#1F1416`, border gold `#D4A83B`, and `--tile-hover-shadow: inset 0 -3px 0 #CF1B21` (a crimson bar inside the tile's bottom edge; the label's line box ends 1 px above it and its glyphs about 3 px above). No transform, no glow.

**The rules** (everything after `:root`; paste as is; encode SVGs per B1 0.2):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #CF1B21; }
#app::after { background: none; }

/* header: crimson 2 px inside, gold 1 px border below it */
#header { border-bottom-color: #D4A83B; box-shadow: inset 0 -2px 0 #CF1B21; }
#header::before { background: #CF1B21; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto; width: 84px; height: 20px;
  background: @DRAGON@ no-repeat 0 0 / 84px 20px; pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: Impact, 'Arial Black', sans-serif; font-weight: 400; letter-spacing: 3px; color: #F5F0E8; text-shadow: none; }
#title .accent { color: #F0474D; }

/* frame: neon sign strips in the left and right bands */
#grid-container {
  background:
    @PINK@ left 3px top 0 / 6px 26px repeat-y,
    @BLUE@ right 7px top 0 / 6px 26px repeat-y;
}

/* tiles */
.app-tile { background: #161416; border-color: #2E292C; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: var(--tile-hover-bg); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.tile-label { font-family: Bahnschrift, 'Segoe UI', sans-serif; }

/* banner */
#theme-banner { background: #151214; border-top: 0; }
#theme-banner::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(#D4A83B 0 1px, #CF1B21 1px 4px); pointer-events: none; }
#theme-banner::before { content: '龍'; width: 22px; font: 700 22px/22px 'Yu Gothic', 'MS Gothic', sans-serif; color: #D4A83B; opacity: 1; text-align: center; }
#theme-banner-text { font-family: Bahnschrift, 'Segoe UI', sans-serif; font-weight: 600; letter-spacing: 1.2px; color: #F5F0E8; }
```

| Placeholder | Is `url("data:image/svg+xml,...")` of SVG |
|---|---|
| `@DRAGON@` | `dragon` |
| `@PINK@` | `pink` |
| `@BLUE@` | `blue` |

**SVG sources** (readable; `dragon` is generated geometry, so its path data is long; keep it exactly):

**`pink`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 6 26'>
<rect x='0' y='0' width='6' height='23' fill='rgb(232,58,140)'/>
<rect x='2' y='2' width='2' height='19' fill='rgb(255,176,214)'/>
</svg>
```

**`blue`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 6 26'>
<rect x='0' y='0' width='6' height='23' fill='rgb(58,155,216)'/>
<rect x='2' y='2' width='2' height='19' fill='rgb(178,222,250)'/>
</svg>
```

**`dragon`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'><path d='M2.2 16.7 L3.3 15.7 L4.9 14.2 L6.6 12.6 L8.3 11.3 L9.8 10.2 L11.3 9.2 L12.7 8.5 L14.1 8.1 L15.5 8.1 L16.9 8.4 L18.3 9.0 L19.6 9.7 L20.8 10.6 L21.9 11.8 L23.1 13.1 L24.4 14.3 L25.9 15.4 L27.4 16.4 L29.1 17.3 L31.1 17.7 L33.0 17.3 L34.8 16.3 L36.4 15.2 L37.9 14.1 L39.3 12.9 L40.6 11.7 L41.7 10.7 L42.8 10.0 L44.0 9.6 L45.3 9.3 L46.6 9.3 L47.6 9.4 L48.5 9.8 L49.4 10.5 L50.5 11.4 L51.7 12.3 L52.8 13.2 L54.0 14.3 L55.4 15.4 L57.1 16.2 L59.0 16.8 L60.8 17.0 L62.7 17.1 L64.6 16.8 L66.4 16.2 L68.1 15.2 L69.4 14.4 L70.3 13.8 L67.7 9.8 L66.8 10.3 L65.6 11.1 L64.4 11.8 L63.4 12.2 L62.4 12.3 L61.2 12.2 L60.0 12.1 L58.9 11.8 L57.9 11.3 L56.9 10.5 L55.6 9.6 L54.3 8.7 L53.0 7.9 L51.7 7.0 L50.2 6.1 L48.4 5.6 L46.5 5.5 L44.7 5.7 L42.9 6.2 L41.2 7.0 L39.7 8.2 L38.4 9.5 L37.3 10.8 L36.1 11.9 L34.7 13.0 L33.3 14.1 L32.0 14.9 L30.9 15.3 L29.8 15.2 L28.5 14.6 L27.0 13.7 L25.6 12.7 L24.3 11.7 L23.1 10.6 L21.8 9.3 L20.4 8.3 L18.8 7.6 L17.2 7.1 L15.6 6.8 L13.9 6.9 L12.3 7.5 L10.7 8.4 L9.2 9.5 L7.7 10.7 L6.1 12.1 L4.4 13.7 L2.9 15.2 L1.8 16.3 Z' fill='rgb(212,168,59)'/><path d='M67 9.2 L71 6.8 L77 7.2 L82.6 9 L80.6 10.3 L74 10.3 L70 12 Z M69 14.4 L73.5 11.2 L79.6 11.8 L76 13.6 L71.5 14.8 Z M71 7 L65 2.6 L69.5 8.2 Z M74.2 7.1 L70 1.6 L75.8 7.6 Z' fill='rgb(212,168,59)'/><path d='M81.2 10.2 C82.6 11 83.4 12.6 83.6 14.6' fill='none' stroke='rgb(212,168,59)' stroke-width='0.9' stroke-linecap='round'/><path d='M27.0 13.7 L28.5 11.8 L30.9 15.3 Z M32.0 14.9 L31.3 12.7 L36.1 11.9 Z M36.1 11.9 L35.0 9.7 L39.7 8.2 Z M41.2 7.0 L41.4 4.6 L46.5 5.5 Z M48.4 5.6 L50.1 3.9 L53.0 7.9 Z M54.3 8.7 L56.2 7.2 L57.9 11.3 Z ' fill='rgb(212,168,59)'/><circle cx='75.4' cy='8.6' r='1' fill='rgb(240,71,77)'/></svg>
```


### 2.4 Motion

| # | Today (infinite) | Element and property | Fate |
|---|---|---|---|
| 1 | `yakuza-title 8s steps(1)` | `#title` colour, opacity, text-shadow (tier 2) | removed |
| 2 | `yakuza-dragon 8s steps(1)` | `#theme-banner::before` colour, opacity, text-shadow (tier 2) | removed (the base `banner-flicker` custom property was dead code under it) |
| 3 | `yakuza-signs 8s steps(1)` | `#grid-container::before` opacity (tier 1) | removed |
| 4 | `yakuza-readout 8s steps(1)` | `#grid-container::after` colour (tier 2) | removed |
| 5 | `yakuza-border 8s steps(1)` | `#app` box-shadow (tier 5) | removed |
| 6 | `yakuza-rain 10s linear` | `#particles` background-position (tier 4) | removed |

**Before 6, after 0.** `grep -c infinite yakuza.css` is 0 (it read 7 today because of the dead custom property). No rain, no flicker; the "neon blackout" 88 percent sync (B1 0.3, H4) is gone.

### 2.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** `#161416`, border `#2E292C`, radius 5 px, `::before` off, layout unchanged. Icons `contrast(1.05) saturate(1.05)`, shape `none` (the old trapezoid cut the glyph tops; icons keep their own rounded plates).
- **Hover:** fill `#1F1416`, border gold (8.1:1 on the fill), a 3 px crimson bar inside the bottom edge.
- **Selected (focus-visible):** hover plus the base 2 px crimson ring at offset 2 (3.6:1 on the ground, 3.3:1 on the tile): `.app-tile:hover, .app-tile:focus-visible { background:var(--tile-hover-bg); border-color:var(--tile-hover-border); box-shadow:var(--tile-hover-shadow); }`.
- **Pressed:** base scale 0.96 on `#1F1416`.
- **Label:** cream `#F5F0E8`, Bahnschrift SemiBold caps, no halo.
- **Filter chip:** base rule (fill `#1F1416`, crimson border, gold text 8.1:1). The dragon hides while it shows.
- **Edit bar:** `#2A0E10` fill, crimson rule and label (4.9:1), no quote. The tile ✕ is `#A8121A`; on hover `#CF1B21` (`.btn-remove:hover`, white ✕ 5.5:1).
- **Settings overlay:** opaque `#0B0A0C`, panel `#151214`, gold values and version, red sliders and checkboxes.
- **Update banner:** `#6DBBEE` on `#0E1A24` with a blue rule (the only blue text; neon blue is the game's other sign colour).

### 2.6 Done when

1. `npm run check:contrast` passes, no rebaseline; `grep -c infinite yakuza.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`.
2. Header: a crimson line at y 37 to 39 and a gold line at y 39 to 40, nothing below; the gold dragon inside x 168 to 252, y 10 to 30 (art bounding box at least 12 px right of the title); typing a letter hides it and shows the chip. `#title` right edge at most 120.
3. Left strip pink at x 3 to 9 and right strip blue at x 411 to 417, running from y 40 to the banner, boxes 23 px with 3 px gaps, at 424 x 300, 640 x 420 (right strip at x 627 to 633) and 1024 x 700 (x 1011 to 1017); no pink or blue pixel anywhere else in the grid, hover and settings shots (except the update banner's blue text when it is shown).
4. Banner: gold line then crimson line across the top (4 px in all), a gold 龍 at x 14 to 36, cream Bahnschrift text on one line (`scrollWidth <= clientWidth` for all four strings).
5. Hover shot (CALCULATOR): gold border, dark red-black fill, a crimson bar at the tile's bottom edge, no glow.
6. Settings shot: gold "64px" and gold version.
7. Hidden-tiles sigma 0.00. No horizontal banding on the Notepad plate.
8. A/B/C probe at the three sizes and the states shot: overlap 0 px, art in keep-out 0 px. Art-off for the probe: hide `#header::after`, `#theme-banner::before` and `#theme-banner::after`, and set `#grid-container { background:none !important; }` (my run: 3.3 px clearance at 424, 4.0 px at 640 and 1024; the 0.7 px in the states shot is the last tile row meeting the banner trim).
9. `fontsRendered` lists `Impact`, `Bahnschrift` and `Yu Gothic`.

**Expected squint score: 4.** What survives: black ground, crimson-and-gold trim top and bottom, a gold dragon, a gold kanji, and two vertical neon strips (pink and blue) on the outer edges. What is missing for a 5: the series' brush lettering (a bundled face, section 8) and the heat-flame; the strips are the only "neon" and are meant to stay small.

---

## 3. parasite-eve (PARASITE EVE): DONE

**Audit:** score 2, redraw. Brown-orange ochre where the game is night-time Manhattan in dark blue with flesh red (the night mood is confirmed, Makoto's hexes are estimates); a painted NYPD case file with a mitochondrion, ability bars and stats filled the tile field; the ghost text was corrupted ("PARASITE(R)VE"); circle icons said nothing.
**Direction:** Manhattan on Christmas Eve 1997, seen through a PS1 menu window. A night-navy ground; a header in the blue window gradient with a small opera-curtain valance along its top edge and two mitochondria in the art zone; flesh-red rules under the header and over the banner; a banner that is a horizon glow with a Manhattan skyline along its bottom edge, a wireframe range dome at its right end (the game's range sphere) and a snowflake icon; Palatino labels; 4 px tiles. Flat, static, nothing on the tile field.

### 3.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 4px;
  --app-clip: none;
  --overlay-clip: none;
  --bg: #0A0A14;
  --panel-bg: #0F1830;
  --overlay-bg: #0A0A14;
  --header-bg: #1B2F58;
  --font: 'Palatino Linotype', Palatino, Georgia, serif;
  --text: #E8E4E0;
  --text-dim: #A9B5CC;
  --accent-c: #D03444;
  --accent-m: #EE6B79;
  --accent-y: #E8D9A0;
  --accent-text: #A9C6F2;
  --border: #33507F;
  --border-h: #D03444;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #D03444;
  --title-anim: none;
  --tile-hover-bg: #181428;
  --tile-hover-border: #D03444;
  --tile-hover-shadow: none;
  --tile-active-bg: #181428;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: saturate(0.95);
  --tile-icon-shape: none;
  --tile-label-spacing: 0.3px;
  --tile-label-transform: none;
  --tile-label-weight: 400;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #243E6E;
  --btn-active-bg: #2C4A7A;
  --drop-hint-border: #3A5A8C;
  --drop-icon-color: #7A8CAA;
  --hint-sub-color: #A9B5CC;
  --rename-dashed: #D03444;
  --rename-input-bg: #181428;
  --edit-bar-bg: #2A0E16;
  --edit-bar-border: #D03444;
  --edit-label-color: #EE6B79;
  --edit-label-glow: none;
  --btn-done-color: #EE6B79;
  --btn-done-border: #D03444;
  --btn-done-hover-bg: #4A1A26;
  --btn-done-hover-glow: none;
  --btn-add-border: #7A8CAA;
  --update-bg: #241E0C;
  --update-border: #C9A24A;
  --update-color: #E8D9A0;
  --update-btn-border: #C9A24A;
  --update-btn-hover-bg: #3A3010;
  --update-btn-hover-glow: none;
  --btn-close-color: #EE6B79;
  --btn-close-border: #D03444;
  --btn-close-hover-bg: #4A1A26;
  --btn-close-hover-glow: none;
  --picker-search-bg: #181428;
  --picker-item-hover-bg: #181428;
  --picker-item-active-bg: #22203A;
  --picker-placeholder-bg: #181428;
  --skin-btn-active-bg: #22203A;
  --remove-btn-bg: #A82030;
  --remove-btn-border: #EE6B79;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; I also ran the real script on the prototype file: 0 errors):

| Gate pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| --text on --bg | `#E8E4E0` on `#0A0A14` | 4.5:1 | **15.57:1** |
| --text-dim on --bg | `#A9B5CC` on `#0A0A14` | 4.5:1 | **9.54:1** |
| --accent-c on --bg | `#D03444` on `#0A0A14` | 3:1 | **3.99:1** |
| --accent-text on --bg | `#A9C6F2` on `#0A0A14` | 3:1 | **11.30:1** |
| --hint-sub-color on --bg | `#A9B5CC` on `#0A0A14` | 4.5:1 | **9.54:1** |

**Add-on pairs** (each text or control colour on its real surface; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#E8E4E0` on `#0F1830` | 4.5:1 | **13.91:1** |
| Tile label on tile hover | `#E8E4E0` on `#181428` | 4.5:1 | **14.20:1** |
| Tile label on tile pressed (pressed state) | `#E8E4E0` on `#181428` | 4.5:1 | **14.20:1** |
| Title on header | `#F4F0EC` on `#2C4A7A` | 4.5:1 | **7.82:1** |
| Title dot (`.accent`) on header | `#FFB4BE` on `#2C4A7A` | 4.5:1 | **5.29:1** |
| Header version on header | `#C8D4EC` on `#2C4A7A` | 4.5:1 | **5.95:1** |
| Header button glyph on header | `#E8E4E0` on `#2C4A7A` | 4.5:1 | **7.01:1** |
| Header button glyph on button hover | `#FFFFFF` on `#243E6E` | 4.5:1 | **10.56:1** |
| Filter chip text on chip | `#A9C6F2` on `#181428` | 4.5:1 | **10.30:1** |
| Banner text on banner | `#F4F0EC` on `#2A4778` | 4.5:1 | **8.16:1** |
| Edit label on edit bar | `#EE6B79` on `#2A0E16` | 4.5:1 | **5.98:1** |
| Done / close button text on edit bar | `#EE6B79` on `#2A0E16` | 4.5:1 | **5.98:1** |
| + FILE / + INSTALLED text on edit bar | `#E8E4E0` on `#2A0E16` | 4.5:1 | **14.16:1** |
| Done button text on its hover fill | `#FFFFFF` on `#4A1A26` | 4.5:1 | **14.32:1** |
| Settings text on overlay | `#E8E4E0` on `#0A0A14` | 4.5:1 | **15.57:1** |
| Settings text on panel | `#E8E4E0` on `#0F1830` | 4.5:1 | **13.91:1** |
| Settings label (text-dim) on panel | `#A9B5CC` on `#0F1830` | 4.5:1 | **8.52:1** |
| Settings value / cheat key (accent-text) on panel | `#A9C6F2` on `#0F1830` | 4.5:1 | **10.09:1** |
| Settings version value (accent-text, F2 rule) on overlay | `#A9C6F2` on `#0A0A14` | 4.5:1 | **11.30:1** |
| Settings CLOSE text on panel | `#EE6B79` on `#0F1830` | 4.5:1 | **5.88:1** |
| Settings CLOSE text on its hover fill | `#FFFFFF` on `#4A1A26` | 4.5:1 | **14.32:1** |
| Hotkey error text (accent-m) on panel | `#EE6B79` on `#0F1830` | 4.5:1 | **5.88:1** |
| Hotkey input text on input fill | `#A9C6F2` on `#181428` | 4.5:1 | **10.30:1** |
| Picker row text on hover fill | `#E8E4E0` on `#181428` | 4.5:1 | **14.20:1** |
| Update banner text on update bar | `#E8D9A0` on `#241E0C` | 4.5:1 | **11.74:1** |
| Update button text on hover fill | `#FFFFFF` on `#3A3010` | 4.5:1 | **13.04:1** |
| Drop-hint text (text-dim) on grid ground | `#A9B5CC` on `#0A0A14` | 4.5:1 | **9.54:1** |
| Remove glyph (#FFFFFF) on remove button | `#FFFFFF` on `#A82030` | 3.0:1 | **7.21:1** |
| Remove glyph on remove button hover fill | `#FFFFFF` on `#D03444` | 3.0:1 | **4.93:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#D03444` on `#0F1830` | 3.0:1 | **3.57:1** |
| Focus ring on grid ground (non-text) | `#D03444` on `#0A0A14` | 3.0:1 | **3.99:1** |
| Hover border on grid ground (non-text) | `#D03444` on `#0A0A14` | 3.0:1 | **3.99:1** |
| Hover border on hover fill (non-text) | `#D03444` on `#181428` | 3.0:1 | **3.64:1** |
| Theme-picker row hover/active text (accent-text) on picker hover fill | `#A9C6F2` on `#181428` | 4.5:1 | **10.30:1** |
| Theme-picker selected row text (accent-text) on picker active fill | `#A9C6F2` on `#22203A` | 4.5:1 | **9.02:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#A9C6F2` on `#181428` | 4.5:1 | **10.30:1** |
| Picker / skin search input text (accent-text) on search fill | `#A9C6F2` on `#181428` | 4.5:1 | **10.30:1** |
| Rename / hotkey input text (accent-text) on input fill | `#A9C6F2` on `#181428` | 4.5:1 | **10.30:1** |
| Search placeholder (text-dim) on search fill | `#A9B5CC` on `#181428` | 4.5:1 | **8.69:1** |
| Hotkey recording text (accent-m) on input fill | `#EE6B79` on `#181428` | 4.5:1 | **6.00:1** |
| Update dismiss glyph (text-dim) on update bar | `#A9B5CC` on `#241E0C` | 4.5:1 | **8.03:1** |

**Lowest ratio in this theme: 3.57:1 (Focus ring (accent-c) on tile rest (non-text)).** Lowest text ratio: 5.29:1 (Title dot (`.accent`) on header). Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (mock plates from the gallery, rest ground `#0F1830`):

| Icon plate (mock) | After fx | Tile ground | Ratio | Needs 3:1 |
|---|---|---|---|---|
| Notepad `#5b7fa6` | `#5D7FA4` | `#0F1830` | 4.22:1 | pass |
| Calculator `#6b6f76` | `#6B6F76` | `#0F1830` | 3.49:1 | pass |
| Paint `#b07a4f` | `#AE7A52` | `#0F1830` | 4.78:1 | pass |
| Terminal `#3d4450` | `#3D444F` | `#0F1830` | 1.79:1 | excluded (app art baseline, see 0.1.8) |
| Browser `#4f8a8b` | `#51898A` | `#0F1830` | 4.44:1 | pass |
| Files `#c09a3e` | `#BE9A43` | `#0F1830` | 6.61:1 | pass |

Lowest non-Terminal icon ratio at rest: **3.49:1** (pass). Terminal is 1.79:1 (mock plate art; the fx does not darken it). On the hover fill `#181428`: **3.56:1**; on the pressed fill `#181428`: **3.56:1** (both pass).

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex (the header and banner may carry opaque gradients; the lightest stop is the one measured above), so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.


Notes: `--accent-c` is flesh red `#D03444` (used for rules, borders, ring, sliders); `--accent-text` is pale window-blue `#A9C6F2` (values, chip, hotkey, picker rows, version); `--accent-m` is a lighter flesh `#EE6B79` for small red text (edit, hotkey error, done, close); `--accent-y` is opera gold `#E8D9A0` for the update bar. The header gradient (`#2C4A7A` to `#12203E`) and the banner glow (`#0E1A36` to `#2A4778`) are measured at their lightest stop for every text on them (title 7.8:1, version 6.0:1, banner text 8.2:1). `--tile-hover-bg` and `--tile-active-bg` are `#181428` (a violet-black, L 0.0085), dark enough for the Calculator plate to keep 3:1.

### 3.2 Type (all stock Windows, verified in `C:/Windows/Fonts`)

| Role | Stack | Weight | Size | Tracking | Case |
|---|---|---|---|---|---|
| Body, settings, pickers (`--font`) | `'Palatino Linotype', Palatino, Georgia, serif` | 400 (base) | base | base | base |
| `#title` | same (`palab.ttf`) | 700 | 11 px (base) | 3px | uppercase (markup) |
| `.tile-label` | same (`pala.ttf`) | 400 (`--tile-label-weight`) | 12 px (base) | 0.3px | as typed (`none`) |
| `#theme-banner-text` | same (`palai.ttf`, italic) | 400 | 11 px (base) | 0.3px | sentence case, as written in 0.8 |

Measured: the title is 128 px wide and ends at x 139.2 (art starts x 168: 28.8 px clear). Labels in Palatino 12 px with 0.3 px tracking: Notepad 49, Calculator 60, Terminal 52, Browser 47 px; "Spreadsheet Editor" (107 px) ellipsizes as it does today. Banner strings end at x 313, 259 and 221. Expected `fontsRendered`: `Palatino Linotype`. **Cyrillic:** none in this theme; Palatino Linotype (regular, italic, bold) contains U+0416 (negative control failed as it should).

### 3.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the four current SVGs (case file, grain, two mote tiles), the readout, header text, edit-bar text, particles, the ochre `#app::after` layers and vignette (`#app::after { background: none; }`, sigma 0.00), the `#app` pulse and the combustion flash (B1 0.3, 0.5).

**A. Header: window gradient, valance, red rule, mitochondria (HZ).**
- `#header { background: url(scallop) 0 0 / 16px 6px repeat-x, linear-gradient(#2C4A7A, #12203E); border-bottom-color:#D03444; box-shadow: inset 0 -2px 0 #D03444; }`. The gradient is the surface, the scallop tile is the art. The red rule is 3 px inside the header (y 37 to 40). `#header::before { background:#D03444; box-shadow:none; }`.
- **Valance, SVG `scallop`, tile 16 x 6, `repeat-x` along the top edge (y 0 to 6):** a row of half-round curtain scallops in `rgb(150,30,50)` with darker folds `rgb(104,18,34)`, pale fold highlights `rgb(190,52,72)` and a 1.2 px gold line `rgb(201,162,74)` along the very top. The scallop tips end at y 5.8, 2.2 px above the header buttons (y 8). (An 8 px valance touched the buttons in the mock; this is why it is 6.) The title starts below y 9.
- **Mitochondria, `#header::after`**: the shared header-art recipe (box 84 x 20 at `right:172px; top:10px`, hidden while the chip shows). SVG `mito`, `viewBox 0 0 84 20`: two ovals, dark red fill `rgb(70,16,32)` with a 1.4 px flesh-pink outline `rgb(238,140,152)` and one wavy inner membrane line each (1 px): the large one 40 x 16 rotated -8 degrees at (24,10), the small one 28 x 12 rotated 14 degrees at (66,9). Generic cell shapes; nothing from the game's art.

**B. Banner: horizon glow, skyline, range dome, red rule, snowflake.**
`#theme-banner { background: url(bigdome) right 12px bottom -10px / 52px 52px no-repeat, url(sky) 0 100% / 212px 13px repeat-x, linear-gradient(#0E1A36, #2A4778); border-top: 3px solid #D03444; }`
- **Glow:** a vertical gradient from `#0E1A36` (top) to `#2A4778` (bottom), so the skyline stands against a lit horizon.
- **Skyline, SVG `sky`, tile 212 x 13, `repeat-x`, anchored to the bottom edge:** an ink silhouette `rgb(8,8,16)` of towers from 2 to 13 px with three antennas (the tallest reach the tile top), and twelve 1 x 1 lit windows `rgb(169,198,242)` per tile. Its top is at banner y 31; the probe read at least 2.7 px between it and the banner text.
- **Range dome, SVG `bigdome`, 52 x 52 at `right 12px bottom -10px`** (window x 360 to 412; the bottom 8 px are clipped by the banner): a wireframe sphere, `rgb(169,198,242)`, 1.6 px outline, equator and meridian ellipses 1.1 px, one extra meridian 0.8 px at 70 percent, and a small flesh-red `rgb(238,107,121)` target dot at its centre. It is the game's range dome drawn as a plain wireframe, not the game's art. The longest banner string ends at x 313, 47 px before the dome starts.
- **Icon, SVG `flake`, 22 x 22** in `#theme-banner::before` (content '', 22 x 22, `font-size:0`, `opacity:1`): a six-armed snowflake with two barbs per arm in `rgb(169,198,242)`, 1.3 px round strokes, and a flesh-red centre dot. (The game opens on Christmas Eve; a snowflake is a plain season mark.)
- `#theme-banner-text { font-family:'Palatino Linotype',Palatino,Georgia,serif; font-style:italic; letter-spacing:0.3px; color:#F4F0EC; }`.

**C. Tiles.** Radius 4 px, fill `#0F1830`, border `#223C68`. Hover and focus: fill `#181428`, border `#D03444`, no shadow. No sheen, no scan.

**The rules** (everything after `:root`; paste as is; encode SVGs per B1 0.2):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #D03444; }
#app::after { background: none; }

/* header: PS1 menu-window gradient, opera-curtain valance along the top edge */
#header {
  background: @SCAL@ 0 0 / 16px 6px repeat-x, linear-gradient(#2C4A7A, #12203E);
  border-bottom-color: #D03444; box-shadow: inset 0 -2px 0 #D03444;
}
#header::before { background: #D03444; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto; width: 84px; height: 20px;
  background: @MITO@ no-repeat 0 0 / 84px 20px; pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: 'Palatino Linotype', Palatino, Georgia, serif; font-weight: 700; letter-spacing: 3px; color: #F4F0EC; text-shadow: none; }
#title .accent { color: #FFB4BE; }
#header-version { color: #C8D4EC; }

/* tiles */
.app-tile { background: #0F1830; border-color: #223C68; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: var(--tile-hover-bg); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.tile-label { font-family: 'Palatino Linotype', Palatino, Georgia, serif; }

/* banner: the city glow at the horizon, Manhattan skyline along the bottom edge */
#theme-banner {
  background: @BIGDOME@ right 12px bottom -10px / 52px 52px no-repeat, @SKY@ 0 100% / 212px 13px repeat-x, linear-gradient(#0E1A36, #2A4778);
  border-top: 3px solid #D03444;
}
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @FLAKE@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: 'Palatino Linotype', Palatino, Georgia, serif; font-style: italic; letter-spacing: 0.3px; color: #F4F0EC; }
```

| Placeholder | Is `url("data:image/svg+xml,...")` of SVG |
|---|---|
| `@BIGDOME@` | `bigdome` |
| `@SCAL@` | `scallop` |
| `@MITO@` | `mito` |
| `@FLAKE@` | `flake` |
| `@SKY@` | `sky` |

**SVG sources** (readable):

**`scallop`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 6'>
<path d='M0 0 H16 V1.6 A8 4.2 0 0 1 0 1.6 Z' fill='rgb(150,30,50)'/>
<path d='M0 1.6 A8 4.2 0 0 1 8 1.6 V5.6 M8 1.6 A8 4.2 0 0 1 16 1.6' fill='none' stroke='rgb(104,18,34)' stroke-width='1'/>
<path d='M4 1.8 V4.2 M12 1.8 V4.2' stroke='rgb(190,52,72)' stroke-width='1'/>
<rect x='0' y='0' width='16' height='1.2' fill='rgb(201,162,74)'/>
</svg>
```

**`mito`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'>
<g transform='rotate(-8 24 10)'>
<ellipse cx='24' cy='10' rx='20' ry='8' fill='rgb(70,16,32)' stroke='rgb(238,140,152)' stroke-width='1.4'/>
<path d='M9 10 C13 4 16 16 20 10 S27 4 31 10 S37 16 40 10' fill='none' stroke='rgb(238,140,152)' stroke-width='1'/>
</g>
<g transform='rotate(14 66 9)'>
<ellipse cx='66' cy='9' rx='14' ry='6' fill='rgb(70,16,32)' stroke='rgb(238,140,152)' stroke-width='1.4'/>
<path d='M55 9 C58 5 60 13 63 9 S69 5 72 9 S75 12 77 9' fill='none' stroke='rgb(238,140,152)' stroke-width='1'/>
</g>
</svg>
```

**`flake`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'><path d='M11 11 L11.0 1.8 M11.0 5.3 L8.5 3.2 M11.0 5.3 L13.5 3.2 M11.0 7.7 L9.3 6.3 M11.0 7.7 L12.7 6.3 M11 11 L19.0 6.4 M15.9 8.1 L16.5 5.0 M15.9 8.1 L18.9 9.2 M13.9 9.3 L14.3 7.2 M13.9 9.3 L15.9 10.1 M11 11 L19.0 15.6 M15.9 13.9 L18.9 12.8 M15.9 13.9 L16.5 17.0 M13.9 12.7 L15.9 11.9 M13.9 12.7 L14.3 14.8 M11 11 L11.0 20.2 M11.0 16.7 L13.5 18.8 M11.0 16.7 L8.5 18.8 M11.0 14.3 L12.7 15.7 M11.0 14.3 L9.3 15.7 M11 11 L3.0 15.6 M6.1 13.9 L5.5 17.0 M6.1 13.9 L3.1 12.8 M8.1 12.7 L7.7 14.8 M8.1 12.7 L6.1 11.9 M11 11 L3.0 6.4 M6.1 8.1 L3.1 9.2 M6.1 8.1 L5.5 5.0 M8.1 9.3 L6.1 10.1 M8.1 9.3 L7.7 7.2 ' fill='none' stroke='rgb(169,198,242)' stroke-width='1.3' stroke-linecap='round'/><circle cx='11' cy='11' r='1.6' fill='rgb(238,107,121)'/></svg>
```

**`bigdome`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 52 52'>
<circle cx='26' cy='26' r='24.5' fill='none' stroke='rgb(169,198,242)' stroke-width='1.6'/>
<ellipse cx='26' cy='26' rx='24.5' ry='9.8' fill='none' stroke='rgb(169,198,242)' stroke-width='1.1'/>
<ellipse cx='26' cy='26' rx='9.8' ry='24.5' fill='none' stroke='rgb(169,198,242)' stroke-width='1.1'/>
<ellipse cx='26' cy='26' rx='19' ry='24.5' fill='none' stroke='rgb(169,198,242)' stroke-width='0.8' stroke-opacity='0.7'/>
<circle cx='26' cy='26' r='2.2' fill='rgb(238,107,121)'/>
</svg>
```

**`sky`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 212 13'>
<path d='M0 13 V9 H6 V6 H11 V10 H16 V5 H22 V7 H26 V3 H28 V0 H29 V3 H31 V9 H38 V6 H43 V10 H47 V8 H50 V4 H56 V9 H62 V6 H66 V8 H72 V2 H76 V6 H80 V9 H86 V5 H92 V8 H99 V4 H101 V0 H102 V4 H105 V10 H112 V6 H118 V9 H124 V4 H131 V7 H136 V10 H142 V5 H146 V2 H152 V6 H156 V9 H161 V3 H163 V0 H164 V3 H166 V8 H172 V10 H178 V5 H184 V8 H190 V6 H196 V10 H202 V7 H208 V9 H212 V13 Z' fill='rgb(8,8,16)'/>
<g fill='rgb(169,198,242)'>
<rect x='18' y='9' width='1' height='1'/><rect x='24' y='6' width='1' height='1'/><rect x='55' y='7' width='1' height='1'/><rect x='58' y='9' width='1' height='1'/><rect x='73' y='4' width='1' height='1'/><rect x='74' y='8' width='1' height='1'/><rect x='95' y='7' width='1' height='1'/><rect x='127' y='7' width='1' height='1'/><rect x='148' y='5' width='1' height='1'/><rect x='150' y='9' width='1' height='1'/><rect x='176' y='8' width='1' height='1'/><rect x='187' y='10' width='1' height='1'/>
</g>
</svg>
```


### 3.4 Motion

| # | Today (infinite) | Element and property | Fate |
|---|---|---|---|
| 1 | `pe-title 10s` | `#title` colour, opacity, text-shadow (tier 2) | removed |
| 2 | `banner-pulse 6s` | `#theme-banner::before` opacity (tier 1) | removed |
| 3 | `pe-archive 10s` | `#grid-container::before` opacity (tier 1) | removed |
| 4 | `pe-readout 10s` | `#grid-container::after` colour (tier 2) | removed |
| 5 | `pe-border 10s` | `#app` box-shadow (tier 5) | removed |
| 6 | `pe-motes 18s linear` | `#particles` background-position (tier 4) | removed |
| hover | `tile-radial .55s` one-shot | `.app-tile:hover::before` | removed (no sheen; `::before` is `display:none`) |

**Before 6, after 0.** Nothing animates; `grep -c infinite parasite-eve.css` is 0. The one-shot `entrance-fade 0.8s` replaces the 1.8 s fade.

### 3.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** `#0F1830`, border `#223C68`, radius 4 px, `::before` off, layout unchanged. Icons `saturate(0.95)` (no darkening), shape `none` (the old ellipse cropped the glyphs).
- **Hover:** fill `#181428`, border flesh red (3.6:1 on the fill), no glow, no transform.
- **Selected (focus-visible):** hover plus the base 2 px flesh ring at offset 2 (4.0:1 on the ground, 3.6:1 on the tile): `.app-tile:hover, .app-tile:focus-visible { background:var(--tile-hover-bg); border-color:var(--tile-hover-border); box-shadow:var(--tile-hover-shadow); }`.
- **Pressed:** base scale 0.96 on `#181428`.
- **Label:** `#E8E4E0` Palatino regular, as typed, no halo.
- **Filter chip:** base rule (fill `#181428`, flesh border, pale-blue text 10.3:1). The mitochondria hide while it shows.
- **Edit bar:** `#2A0E16` fill, flesh rule and label (6.0:1), no quote. The tile ✕ is `#A82030`; on hover `#D03444` (`.btn-remove:hover`, white ✕ 4.9:1).
- **Settings overlay:** opaque `#0A0A14`, panel `#0F1830`, pale-blue values and version, flesh sliders and checkboxes.
- **Update banner:** gold `#E8D9A0` on `#241E0C` with a gold rule (11.7:1).

### 3.6 Done when

1. `npm run check:contrast` passes, no rebaseline; `grep -c infinite parasite-eve.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`.
2. Header: a blue gradient (top `#2C4A7A`, bottom `#12203E`, sampled at x 300, y 2 and y 36); a red-and-gold scalloped fringe along the top edge no lower than y 6; a 3 px flesh-red line at y 37 to 40 and nothing below; the two mitochondria inside x 168 to 252, y 10 to 30; typing a letter hides them. `#title` right edge at most 140.
3. Banner: a 3 px flesh-red top border, a gradient glow, a skyline along the bottom edge (about 13 px), a snowflake at x 14 to 36, a wireframe sphere at x 360 to 412 clipped by the banner bottom, and italic Palatino text on one line (`scrollWidth <= clientWidth` for all three strings).
4. Hover shot (CALCULATOR): flesh-red border, violet-black fill, no glow, Palatino label.
5. Settings shot: pale-blue "64px" and version.
6. Hidden-tiles sigma 0.00. No horizontal banding on the Notepad plate.
7. A/B/C probe at the three sizes and the states shot: overlap 0 px, art in keep-out 0 px. Art-off for the probe: hide `#header::after` and `#theme-banner::before`, and set `#header { background: linear-gradient(#2C4A7A,#12203E) !important; }` and `#theme-banner { background: linear-gradient(#0E1A36,#2A4778) !important; }` (my run: smallest clearance 2.7 px).
8. `fontsRendered` lists `Palatino Linotype`.

**Expected squint score: 4** (my least sure of the seven; 3 if the valance and the dome are judged too small). What survives: a night-navy field, two flesh-red rules, a curtain fringe, cell shapes, a Manhattan skyline on a lit horizon, and a big range-dome wireframe. What is missing: the game has no signature UI shape beyond the dome, and its logo is a trademark (not drawn).

---

## 4. nonary-games (NONARY GAMES / ZERO ESCAPE, 999): DONE

**Audit:** score 2, redraw; game = **999** (section 3). It was a dark blue sci-fi terminal with cyan digit boxes, where 999 is a rusted ship, steel bulkheads, numbered round doors and a black-on-grey LCD bracelet. A 3 x 3 door grid, a bracelet gauge and rules ("PENALTY: DEATH") sat between and behind the tiles, the CALCULATOR icon sat on the "5", tiles were wobbly blobs.
**Direction:** the ship's steel and rust. A warm near-black brown ground; a steel line under the header; a row of rivets and a few rust streaks in the frame bands; a round hatch with nine ticks and a 3 x 3 lamp grid (the ninth lit) in the header; a rust-drip edge on the banner and a small LCD box with a seven-segment 9 as the banner icon; brass for accents (values, focus, hover); bracelet-red only for edit mode. Consolas Bold title, Bahnschrift caps labels, 4 px tiles. No blue anywhere except the update banner.

### 4.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 4px;
  --app-clip: none;
  --overlay-clip: none;
  --bg: #14100D;
  --panel-bg: #1E1712;
  --overlay-bg: #14100D;
  --header-bg: #2A1E16;
  --font: Bahnschrift, 'Segoe UI', sans-serif;
  --text: #E8E0D0;
  --text-dim: #B8AC98;
  --accent-c: #D9A03A;
  --accent-m: #EE6E76;
  --accent-y: #5CBAD0;
  --accent-text: #D9A03A;
  --border: #4A4038;
  --border-h: #D9A03A;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #D9A03A;
  --title-anim: none;
  --tile-hover-bg: #2A1C14;
  --tile-hover-border: #D9A03A;
  --tile-hover-shadow: none;
  --tile-active-bg: #2A1C14;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: sepia(0.15) saturate(0.9);
  --tile-icon-shape: none;
  --tile-label-spacing: 1px;
  --tile-label-transform: uppercase;
  --tile-label-weight: 600;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #3A2A20;
  --btn-active-bg: #4A3428;
  --drop-hint-border: #5A4C40;
  --drop-icon-color: #8C8070;
  --hint-sub-color: #B8AC98;
  --rename-dashed: #D9A03A;
  --rename-input-bg: #2A1C14;
  --edit-bar-bg: #2C0E12;
  --edit-bar-border: #B3202A;
  --edit-label-color: #EE6E76;
  --edit-label-glow: none;
  --btn-done-color: #EE6E76;
  --btn-done-border: #B3202A;
  --btn-done-hover-bg: #4A1A20;
  --btn-done-hover-glow: none;
  --btn-add-border: #8C8070;
  --update-bg: #0C2228;
  --update-border: #5CBAD0;
  --update-color: #5CBAD0;
  --update-btn-border: #5CBAD0;
  --update-btn-hover-bg: #123840;
  --update-btn-hover-glow: none;
  --btn-close-color: #EE6E76;
  --btn-close-border: #B3202A;
  --btn-close-hover-bg: #4A1A20;
  --btn-close-hover-glow: none;
  --picker-search-bg: #2A1C14;
  --picker-item-hover-bg: #2A1C14;
  --picker-item-active-bg: #3A281C;
  --picker-placeholder-bg: #2A1C14;
  --skin-btn-active-bg: #3A281C;
  --remove-btn-bg: #A01C26;
  --remove-btn-border: #EE6E76;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; I also ran the real script on the prototype file: 0 errors):

| Gate pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| --text on --bg | `#E8E0D0` on `#14100D` | 4.5:1 | **14.42:1** |
| --text-dim on --bg | `#B8AC98` on `#14100D` | 4.5:1 | **8.46:1** |
| --accent-c on --bg | `#D9A03A` on `#14100D` | 3:1 | **8.15:1** |
| --accent-text on --bg | `#D9A03A` on `#14100D` | 3:1 | **8.15:1** |
| --hint-sub-color on --bg | `#B8AC98` on `#14100D` | 4.5:1 | **8.46:1** |

**Add-on pairs** (each text or control colour on its real surface; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#E8E0D0` on `#1E1712` | 4.5:1 | **13.49:1** |
| Tile label on tile hover | `#E8E0D0` on `#2A1C14` | 4.5:1 | **12.56:1** |
| Tile label on tile pressed (pressed state) | `#E8E0D0` on `#2A1C14` | 4.5:1 | **12.56:1** |
| Title on header | `#E8E0D0` on `#2A1E16` | 4.5:1 | **12.35:1** |
| Title dot (`.accent`) on header | `#D9A03A` on `#2A1E16` | 4.5:1 | **6.98:1** |
| Header version on header | `#B8AC98` on `#2A1E16` | 4.5:1 | **7.25:1** |
| Header button glyph on header | `#E8E0D0` on `#2A1E16` | 4.5:1 | **12.35:1** |
| Header button glyph on button hover | `#FFFFFF` on `#3A2A20` | 4.5:1 | **13.71:1** |
| Filter chip text on chip | `#D9A03A` on `#2A1C14` | 4.5:1 | **7.09:1** |
| Banner text on banner | `#E8E0D0` on `#2A1E16` | 4.5:1 | **12.35:1** |
| Edit label on edit bar | `#EE6E76` on `#2C0E12` | 4.5:1 | **6.05:1** |
| Done / close button text on edit bar | `#EE6E76` on `#2C0E12` | 4.5:1 | **6.05:1** |
| + FILE / + INSTALLED text on edit bar | `#E8E0D0` on `#2C0E12` | 4.5:1 | **13.58:1** |
| Done button text on its hover fill | `#FFFFFF` on `#4A1A20` | 4.5:1 | **14.39:1** |
| Settings text on overlay | `#E8E0D0` on `#14100D` | 4.5:1 | **14.42:1** |
| Settings text on panel | `#E8E0D0` on `#1E1712` | 4.5:1 | **13.49:1** |
| Settings label (text-dim) on panel | `#B8AC98` on `#1E1712` | 4.5:1 | **7.92:1** |
| Settings value / cheat key (accent-text) on panel | `#D9A03A` on `#1E1712` | 4.5:1 | **7.62:1** |
| Settings version value (accent-text, F2 rule) on overlay | `#D9A03A` on `#14100D` | 4.5:1 | **8.15:1** |
| Settings CLOSE text on panel | `#EE6E76` on `#1E1712` | 4.5:1 | **6.01:1** |
| Settings CLOSE text on its hover fill | `#FFFFFF` on `#4A1A20` | 4.5:1 | **14.39:1** |
| Hotkey error text (accent-m) on panel | `#EE6E76` on `#1E1712` | 4.5:1 | **6.01:1** |
| Hotkey input text on input fill | `#D9A03A` on `#2A1C14` | 4.5:1 | **7.09:1** |
| Picker row text on hover fill | `#E8E0D0` on `#2A1C14` | 4.5:1 | **12.56:1** |
| Update banner text on update bar | `#5CBAD0` on `#0C2228` | 4.5:1 | **7.36:1** |
| Update button text on hover fill | `#FFFFFF` on `#123840` | 4.5:1 | **12.61:1** |
| Drop-hint text (text-dim) on grid ground | `#B8AC98` on `#14100D` | 4.5:1 | **8.46:1** |
| Remove glyph (#FFFFFF) on remove button | `#FFFFFF` on `#A01C26` | 3.0:1 | **7.81:1** |
| Remove glyph on remove button hover fill | `#FFFFFF` on `#B3202A` | 3.0:1 | **6.65:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#D9A03A` on `#1E1712` | 3.0:1 | **7.62:1** |
| Focus ring on grid ground (non-text) | `#D9A03A` on `#14100D` | 3.0:1 | **8.15:1** |
| Hover border on grid ground (non-text) | `#D9A03A` on `#14100D` | 3.0:1 | **8.15:1** |
| Hover border on hover fill (non-text) | `#D9A03A` on `#2A1C14` | 3.0:1 | **7.09:1** |
| Theme-picker row hover/active text (accent-text) on picker hover fill | `#D9A03A` on `#2A1C14` | 4.5:1 | **7.09:1** |
| Theme-picker selected row text (accent-text) on picker active fill | `#D9A03A` on `#3A281C` | 4.5:1 | **6.03:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#D9A03A` on `#2A1C14` | 4.5:1 | **7.09:1** |
| Picker / skin search input text (accent-text) on search fill | `#D9A03A` on `#2A1C14` | 4.5:1 | **7.09:1** |
| Rename / hotkey input text (accent-text) on input fill | `#D9A03A` on `#2A1C14` | 4.5:1 | **7.09:1** |
| Search placeholder (text-dim) on search fill | `#B8AC98` on `#2A1C14` | 4.5:1 | **7.37:1** |
| Hotkey recording text (accent-m) on input fill | `#EE6E76` on `#2A1C14` | 4.5:1 | **5.59:1** |
| Update dismiss glyph (text-dim) on update bar | `#B8AC98` on `#0C2228` | 4.5:1 | **7.37:1** |

**Lowest ratio in this theme: 5.59:1 (Hotkey recording text (accent-m) on input fill).** Lowest text ratio: 5.59:1 (Hotkey recording text (accent-m) on input fill). Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (mock plates from the gallery, rest ground `#1E1712`):

| Icon plate (mock) | After fx | Tile ground | Ratio | Needs 3:1 |
|---|---|---|---|---|
| Notepad `#5b7fa6` | `#68829B` | `#1E1712` | 4.43:1 | pass |
| Calculator `#6b6f76` | `#717274` | `#1E1712` | 3.68:1 | pass |
| Paint `#b07a4f` | `#AC805B` | `#1E1712` | 5.05:1 | pass |
| Terminal `#3d4450` | `#42464D` | `#1E1712` | 1.87:1 | excluded (app art baseline, see 0.1.8) |
| Browser `#4f8a8b` | `#608A86` | `#1E1712` | 4.62:1 | pass |
| Files `#c09a3e` | `#BF9E53` | `#1E1712` | 6.94:1 | pass |

Lowest non-Terminal icon ratio at rest: **3.68:1** (pass). Terminal is 1.87:1 (mock plate art; the fx does not darken it). On the hover fill `#2A1C14`: **3.42:1**; on the pressed fill `#2A1C14`: **3.42:1** (both pass).

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex (the header and banner may carry opaque gradients; the lightest stop is the one measured above), so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.


Notes: `--accent-c` and `--accent-text` are brass `#D9A03A` (8.2:1 on the ground; used for focus, hover, values, chip, hotkey, picker rows and the title dot); `--accent-m` is a light bracelet red `#EE6E76` for small red text (edit label, hotkey error, done, close: 6.0:1); the deep red `#B3202A` is a fill and border only (edit-bar border, ✕ hover). `--accent-y` is a cool teal `#5CBAD0` used only by the update bar (the audit's `#1F5A6A` teal is 2.5:1 against the ground and fails the 3:1 focus-ring test, so it does not carry focus). `--tile-hover-bg` and `--tile-active-bg` are `#2A1C14` (L 0.0137) and the sepia fx keeps every non-Terminal plate at 3.4:1 or better.

### 4.2 Type (all stock Windows, verified in `C:/Windows/Fonts`)

| Role | Stack | Weight | Size | Tracking | Case |
|---|---|---|---|---|---|
| Body, settings, pickers (`--font`) | `Bahnschrift, 'Segoe UI', sans-serif` (normal width) | 400 (base) | base | base | base |
| `#title` | `Consolas, 'Courier New', monospace` (`consolab.ttf`) | 700 | 11 px (base) | 3px | uppercase (markup) |
| `.tile-label` | `Bahnschrift, 'Segoe UI', sans-serif` at weight 600 | 600 (`--tile-label-weight`) | 12 px (base) | 1px | uppercase |
| `#theme-banner-text` | same | 600 | 11 px (base) | 1px | as written in 0.8 (uppercase) |

Measured: the title is 108 px wide and ends at x 120.6 (art starts x 168: 47 px clear). Labels in Bahnschrift SemiBold 12 px, 1 px tracking, normal width: NOTEPAD 59, CALCULATOR 84, TERMINAL 64, BROWSER 63 px, inside the 100 px box; "SPREADSHEET EDITOR" (141 px) ellipsizes as today. Banner strings end at x 297, 303 and 360 (the last, `I AM RIGHT HERE... I'VE ALWAYS BEEN CLOSE TO YOU.`, is 314 px; nothing sits at the right end of this banner). No `font-stretch`. Expected `fontsRendered`: `Consolas, Bahnschrift`. **Cyrillic:** none in this theme; Consolas Bold and Bahnschrift contain U+0416 (negative control failed as it should).

### 4.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the four current SVGs (door grid, bracelet terminal, rust texture, data-stream tiles), the readout, header text, edit-bar text, particles, the `#app::after` blue grain and vignette (`#app::after { background: none; }`, so no texture), the `#app` pulse and the title keyframes (B1 0.3, 0.5).

**A. Header: steel line, hatch and lamp grid (HZ).**
- `#header { border-bottom-color:#6A7078; box-shadow: inset 0 -2px 0 #3A2A20; }`: a 1 px steel line at y 39 to 40 over a 2 px dark-rust line at y 37 to 39; nothing below y 40. `#header::before { background:#D9A03A; box-shadow:none; }`.
- **Hatch and lamps, `#header::after`**: the shared header-art recipe (84 x 20 box, hidden while the chip shows). SVG `hatch`, `viewBox 0 0 84 20`: a round hatch centred at (12,10), radius 9, fill `rgb(42,30,22)`, steel outline `rgb(138,146,156)` 1.6 px, an inner ring r 5.4 (1.2 px), **nine brass ticks** `rgb(217,160,58)` on the outer ring at 40-degree steps from the top, three steel spokes and a brass hub; and a **3 x 3 lamp grid**, lamps r 2 at x 36, 43, 50 and y 4.5, 10, 15.5, dark `rgb(74,64,56)` except the ninth (bottom right), lit brass. The art spans x 3 to 52 of the box (window x 171 to 220) and is at least 50 px from the title.

**B. Frame: rivets, rust streaks (`#grid-container` background; they do not scroll).**
`background: url(streakL) left 1px top 0 / 10px 120px repeat-y, url(streakR) right 5px top 30px / 10px 120px repeat-y, url(rivet) 0 1px / 16px 10px repeat-x, linear-gradient(#14100D, #1A120C);`
- **Rivets, SVG `rivet`, tile 16 x 10, `repeat-x` at container y 1:** one steel rivet (r 2.4, `rgb(90,98,108)` with a 0.9 px highlight `rgb(168,176,186)`) every 16 px, at window y 46 (43.6 to 48.4), inside the top band. The first tile row starts at y 56.
- **Rust streaks, SVGs `streakL` and `streakR`, tiles 10 x 120, `repeat-y`:** five 1 to 2 px vertical streaks of 30 to 78 px in `rgb(74,42,26)` and `rgb(90,50,30)` (weeping rust). `streakL` keeps all its ink in tile x 0 to 8 and sits at `left 1px` (window x 1 to 9); `streakR` is its mirror, sits at `right 5px` (tile x 409 to 419, ink x 411 to 419) and is offset 30 px down so the two sides do not match. The tile keep-out is x 12 to 408; the art is at least 3 px clear of it (probe: 2.7 px with the focus ring on the first tile).
- **Ground:** a vertical gradient `#14100D` to `#1A120C` (the tile field's ground; the gate variable `--bg` stays `#14100D`).

**C. Banner: drips and an LCD icon.**
`#theme-banner { background:#2A1E16; border-top:1px solid #6A7078; }`
- **Rust edge, `#theme-banner::after`**: `content:''; position:absolute; top:1px; left:0; right:0; height:7px; background:url(drip) 0 0 / 212px 7px repeat-x; pointer-events:none;`. SVG `drip`: a 2 px rust line `rgb(106,58,34)` with ten 1 to 2 px drips `rgb(90,48,28)` of 3 to 6 px. The text starts at banner y 15, so the edge is at least 8 px clear.
- **Icon, SVG `lcd`, 22 x 22** in `#theme-banner::before` (content '', 22 x 22, `font-size:0`, `opacity:1`): a rounded LCD box, `rgb(200,208,184)` with a 1.4 px ink outline `rgb(20,16,13)`, showing an ink **seven-segment "9"** built from six 1.6 px bars. It is generic seven-segment art, not the bracelet's face (0.9); it is the one place a digit appears. Judgement call for Sergei: if it reads too close to the bracelet, replace the digit with an empty box.
- `#theme-banner-text { font-family:Bahnschrift,'Segoe UI',sans-serif; font-weight:600; letter-spacing:1px; color:#E8E0D0; }`.

**D. Tiles.** Radius 4 px, fill `#1E1712`, border `#3A3028`. Hover and focus: fill `#2A1C14`, border brass `#D9A03A`, no shadow.

**The rules** (everything after `:root`; paste as is; encode SVGs per B1 0.2):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #B3202A; }
#app::after { background: none; }

#header { border-bottom-color: #6A7078; box-shadow: inset 0 -2px 0 #3A2A20; }
#header::before { background: #D9A03A; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto; width: 84px; height: 20px;
  background: @HATCH@ no-repeat 0 0 / 84px 20px; pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: Consolas, 'Courier New', monospace; font-weight: 700; letter-spacing: 3px; color: #E8E0D0; text-shadow: none; }
#title .accent { color: #D9A03A; }

#grid-container {
  background:
    @STRL@ left 1px top 0 / 10px 120px repeat-y,
    @STRR@ right 5px top 30px / 10px 120px repeat-y,
    @RIV@ 0 1px / 16px 10px repeat-x,
    linear-gradient(#14100D, #1A120C);
}

.app-tile { background: #1E1712; border-color: #3A3028; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: var(--tile-hover-bg); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.tile-label { font-family: Bahnschrift, 'Segoe UI', sans-serif; }

#theme-banner { background: #2A1E16; border-top: 1px solid #6A7078; }
#theme-banner::after { content: ''; position: absolute; top: 1px; left: 0; right: 0; height: 7px; background: @DRIP@ 0 0 / 212px 7px repeat-x; pointer-events: none; }
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @LCD@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: Bahnschrift, 'Segoe UI', sans-serif; font-weight: 600; letter-spacing: 1px; color: #E8E0D0; }
```

| Placeholder | Is `url("data:image/svg+xml,...")` of SVG |
|---|---|
| `@HATCH@` | `hatch` |
| `@STRL@` | `streakL` |
| `@STRR@` | `streakR` |
| `@RIV@` | `rivet` |
| `@DRIP@` | `drip` |
| `@LCD@` | `lcd` |

**SVG sources** (readable):

**`hatch`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'><circle cx='12' cy='10' r='9' fill='rgb(42,30,22)' stroke='rgb(138,146,156)' stroke-width='1.6'/><circle cx='12' cy='10' r='5.4' fill='none' stroke='rgb(138,146,156)' stroke-width='1.2'/><path d='M12.0 1.0 L12.0 3.4 M17.8 3.1 L16.2 4.9 M20.9 8.4 L18.5 8.9 M19.8 14.5 L17.7 13.3 M15.1 18.5 L14.3 16.2 M8.9 18.5 L9.7 16.2 M4.2 14.5 L6.3 13.3 M3.1 8.4 L5.5 8.9 M6.2 3.1 L7.8 4.9 ' stroke='rgb(217,160,58)' stroke-width='1.1' fill='none'/><path d='M12 10 L12.0 4.6 M12 10 L16.7 12.7 M12 10 L7.3 12.7 ' stroke='rgb(138,146,156)' stroke-width='1.2' fill='none'/><circle cx='12' cy='10' r='1.6' fill='rgb(217,160,58)'/><circle cx='36' cy='4' r='2' fill='rgb(74,64,56)'/><circle cx='43' cy='4' r='2' fill='rgb(74,64,56)'/><circle cx='50' cy='4' r='2' fill='rgb(74,64,56)'/><circle cx='36' cy='10' r='2' fill='rgb(74,64,56)'/><circle cx='43' cy='10' r='2' fill='rgb(74,64,56)'/><circle cx='50' cy='10' r='2' fill='rgb(74,64,56)'/><circle cx='36' cy='15' r='2' fill='rgb(74,64,56)'/><circle cx='43' cy='15' r='2' fill='rgb(74,64,56)'/><circle cx='50' cy='15' r='2' fill='rgb(217,160,58)'/></svg>
```

**`lcd`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<rect x='0.9' y='3' width='20.2' height='16' rx='3' fill='rgb(200,208,184)' stroke='rgb(20,16,13)' stroke-width='1.4'/>
<g fill='rgb(20,16,13)'>
<rect x='7.6' y='5.5' width='6.8' height='1.6'/>
<rect x='13.6' y='6.7' width='1.6' height='4'/>
<rect x='13.6' y='11.3' width='1.6' height='4'/>
<rect x='7.6' y='14.9' width='6.8' height='1.6'/>
<rect x='6.8' y='6.7' width='1.6' height='4'/>
<rect x='7.6' y='10.1' width='6.8' height='1.6'/>
</g>
</svg>
```

**`rivet`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 10'>
<circle cx='8' cy='5' r='2.4' fill='rgb(90,98,108)'/>
<circle cx='7.4' cy='4.4' r='0.9' fill='rgb(168,176,186)'/>
</svg>
```

**`streakL`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 120'>
<rect x='0' y='0' width='2' height='46' fill='rgb(74,42,26)'/>
<rect x='3' y='0' width='1' height='78' fill='rgb(90,50,30)'/>
<rect x='6' y='0' width='2' height='30' fill='rgb(74,42,26)'/>
<rect x='1' y='60' width='1' height='40' fill='rgb(90,50,30)'/>
<rect x='5' y='70' width='2' height='50' fill='rgb(74,42,26)'/>
</svg>
```

**`streakR`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 120'>
<rect x='8' y='0' width='2' height='46' fill='rgb(74,42,26)'/>
<rect x='6' y='0' width='1' height='78' fill='rgb(90,50,30)'/>
<rect x='2' y='0' width='2' height='30' fill='rgb(74,42,26)'/>
<rect x='8' y='60' width='1' height='40' fill='rgb(90,50,30)'/>
<rect x='3' y='70' width='2' height='50' fill='rgb(74,42,26)'/>
</svg>
```

**`drip`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 212 7'>
<rect x='0' y='0' width='212' height='2' fill='rgb(106,58,34)'/>
<g fill='rgb(90,48,28)'>
<rect x='10' y='2' width='2' height='4'/><rect x='31' y='2' width='1' height='6'/><rect x='47' y='2' width='2' height='3'/><rect x='70' y='2' width='1' height='5'/><rect x='96' y='2' width='2' height='4'/>
<rect x='118' y='2' width='1' height='3'/><rect x='139' y='2' width='2' height='6'/><rect x='163' y='2' width='1' height='4'/><rect x='184' y='2' width='2' height='3'/><rect x='203' y='2' width='1' height='5'/>
</g>
</svg>
```


### 4.4 Motion

| # | Today (infinite) | Element and property | Fate |
|---|---|---|---|
| 1 | `nonary-title 10s steps(1)` | `#title` colour, opacity, text-shadow (tier 2) | removed |
| 2 | `banner-pulse 5s` | `#theme-banner::before` opacity (tier 1) | removed |
| 3 | `nonary-hud 10s` | `#grid-container::before` opacity (tier 1) | removed |
| 4 | `nonary-readout 10s` | `#grid-container::after` colour (tier 2) | removed |
| 5 | `nonary-border 10s` | `#app` box-shadow (tier 5) | removed |
| 6 | `nonary-data 14s linear` | `#particles` background-position (tier 4) | removed |
| hover | `tile-scan-v .5s` one-shot | `.app-tile:hover::before` | removed (no sheen; `::before` is `display:none`) |

**Before 6, after 0.** `grep -c infinite nonary-games.css` is 0. No countdown, no flicker.

### 4.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** `#1E1712`, border `#3A3028`, radius 4 px, `::before` off, layout unchanged. Icons `sepia(0.15) saturate(0.9)` (no darkening), shape `none` (the old hexagon and the blob crop are gone).
- **Hover:** fill `#2A1C14`, border brass (7.1:1 on the fill), no glow, no transform.
- **Selected (focus-visible):** hover plus the base 2 px brass ring at offset 2 (8.2:1 on the ground, 7.6:1 on the tile): `.app-tile:hover, .app-tile:focus-visible { background:var(--tile-hover-bg); border-color:var(--tile-hover-border); box-shadow:var(--tile-hover-shadow); }`.
- **Pressed:** base scale 0.96 on `#2A1C14`.
- **Label:** `#E8E0D0` Bahnschrift SemiBold caps, no halo.
- **Filter chip:** base rule (fill `#2A1C14`, brass border, brass text). The hatch and lamps hide while it shows.
- **Edit bar:** `#2C0E12` fill, bracelet-red rule `#B3202A`, light-red label (6.0:1), no quote. The tile ✕ is `#A01C26`; on hover `#B3202A` (`.btn-remove:hover`, white ✕ 6.7:1).
- **Settings overlay:** opaque `#14100D`, panel `#1E1712`, brass values and version, brass sliders and checkboxes.
- **Update banner:** teal `#5CBAD0` on `#0C2228` with a teal rule (the only blue).

### 4.6 Done when

1. `npm run check:contrast` passes, no rebaseline; `grep -c infinite nonary-games.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`.
2. Header: a steel line at y 39 to 40 over a dark-rust line, nothing below; the hatch with nine brass ticks at window x 171 to 189 and the lamp grid at x 202 to 220, with the bottom-right lamp lit; typing a letter hides them. `#title` right edge at most 125.
3. Frame: a row of steel rivets along y 44 to 48 across the full width at every size; rust streaks at x 1 to 9 and x 411 to 419; no art inside x 12 to 408 below y 52; nothing brighter than `#6A7078` in the bands except the rivet highlights.
4. Banner: a 1 px steel line and a 7 px rust edge with drips at the top, an LCD box with a seven-segment 9 at x 14 to 36, cream Bahnschrift text on one line (`scrollWidth <= clientWidth` for all three strings; the longest ends at x 360).
5. Hover shot (CALCULATOR): brass border, warm dark-brown fill, no glow.
6. Settings shot: brass "64px" and brass version.
7. Hidden-tiles sigma at most 1.0 (a smooth ground gradient, no texture; my run: 0.50). No horizontal banding on the Notepad plate (the gradient changes by under 1 level per row).
8. A/B/C probe at the three sizes and the states shot: overlap 0 px, art in keep-out 0 px. Art-off for the probe: hide `#header::after`, `#theme-banner::before` and `#theme-banner::after`, and set `#grid-container { background: linear-gradient(#14100D,#1A120C) !important; }` (my run: smallest clearance 2.7 px, 5.3 px in the default state).
9. `fontsRendered` lists `Consolas` and `Bahnschrift`.

**Expected squint score: 4.** What survives: a warm rust-brown field, a steel line, a rivet row, a hatch with nine ticks and a lit ninth lamp, rust drips, and a grey LCD box with a 9. What is missing: the numbered doors and the bracelet's own digit face (a bundled seven-segment font such as DSEG, section 8, would sharpen the LCD; it is not used).

---

## 5. siren (FORBIDDEN SIREN): DONE

**Audit:** score 2, redraw, **legacy contrast failure** (text-dim 3.3:1, accent-c and hint-sub 2.2:1); this is a modified theme, so it must pass with no legacy pass. Nearly nothing identified it: near-black with faint dim red lines and a static layer, where the game is two channels of sightjack vision (sepia and cold blue-grey) and red water. The painted "SIGHTJACK / SHIBITO" text was invisible at its alpha.
**Direction:** two channels and rising water. A near-black warm ground with a fine static grain; a header split by a hard seam into a warm sepia half (title) and a cold blue-grey half (buttons), with the two-glyph tag 屍人 straddling the seam, one glyph per channel; three thin static-band lines in the top band; hover switches a tile to the cold channel (blue-grey border and fill); the banner is the red water, a dark-to-blood gradient with a wave line on its top edge and a siren-horn icon. Segoe UI, square tiles, no animation.

### 5.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 1px;
  --app-clip: none;
  --overlay-clip: none;
  --bg: #0C0808;
  --panel-bg: #171212;
  --overlay-bg: #0C0808;
  --header-bg: #2C1F14;
  --font: 'Segoe UI', Arial, sans-serif;
  --text: #C8B090;
  --text-dim: #A8946F;
  --accent-c: #CC2929;
  --accent-m: #E8666A;
  --accent-y: #9DB4CC;
  --accent-text: #9DB4CC;
  --border: #3A2E2E;
  --border-h: #CC2929;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #CC2929;
  --title-anim: none;
  --tile-hover-bg: #0F151D;
  --tile-hover-border: #7F9AB4;
  --tile-hover-shadow: none;
  --tile-active-bg: #0F151D;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: sepia(0.3) saturate(0.85);
  --tile-icon-shape: none;
  --tile-label-spacing: 0.4px;
  --tile-label-transform: none;
  --tile-label-weight: 400;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #1E2A36;
  --btn-active-bg: #28384A;
  --drop-hint-border: #4A3C3C;
  --drop-icon-color: #8A7A66;
  --hint-sub-color: #A8946F;
  --rename-dashed: #CC2929;
  --rename-input-bg: #131B24;
  --edit-bar-bg: #2A0C0E;
  --edit-bar-border: #CC2929;
  --edit-label-color: #E8666A;
  --edit-label-glow: none;
  --btn-done-color: #E8666A;
  --btn-done-border: #CC2929;
  --btn-done-hover-bg: #4A1618;
  --btn-done-hover-glow: none;
  --btn-add-border: #8A7A66;
  --update-bg: #101A24;
  --update-border: #7F9AB4;
  --update-color: #9DB4CC;
  --update-btn-border: #7F9AB4;
  --update-btn-hover-bg: #1C2C3C;
  --update-btn-hover-glow: none;
  --btn-close-color: #E8666A;
  --btn-close-border: #CC2929;
  --btn-close-hover-bg: #4A1618;
  --btn-close-hover-glow: none;
  --picker-search-bg: #131B24;
  --picker-item-hover-bg: #131B24;
  --picker-item-active-bg: #1C2836;
  --picker-placeholder-bg: #131B24;
  --skin-btn-active-bg: #1C2836;
  --remove-btn-bg: #A81E20;
  --remove-btn-border: #E8666A;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; I also ran the real script on the prototype file: 0 errors):

| Gate pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| --text on --bg | `#C8B090` on `#0C0808` | 4.5:1 | **9.55:1** |
| --text-dim on --bg | `#A8946F` on `#0C0808` | 4.5:1 | **6.77:1** |
| --accent-c on --bg | `#CC2929` on `#0C0808` | 3:1 | **3.72:1** |
| --accent-text on --bg | `#9DB4CC` on `#0C0808` | 3:1 | **9.33:1** |
| --hint-sub-color on --bg | `#A8946F` on `#0C0808` | 4.5:1 | **6.77:1** |

**Add-on pairs** (each text or control colour on its real surface; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#C8B090` on `#120E0E` | 4.5:1 | **9.20:1** |
| Tile label on tile hover | `#C8B090` on `#0F151D` | 4.5:1 | **8.79:1** |
| Tile label on tile pressed (pressed state) | `#C8B090` on `#0F151D` | 4.5:1 | **8.79:1** |
| Tile label on worst-case textured pixel (grain peak) | `#C8B090` on `#221D1B` | 4.5:1 | **7.99:1** |
| Title on header | `#E0C8A0` on `#2C1F14` | 4.5:1 | **9.85:1** |
| Title dot (`.accent`) on header | `#E8666A` on `#2C1F14` | 4.5:1 | **4.98:1** |
| Header version on header | `#B8A47F` on `#2C1F14` | 4.5:1 | **6.59:1** |
| Header button glyph on header | `#C8B090` on `#132435` | 4.5:1 | **7.56:1** |
| Header button glyph on button hover | `#FFFFFF` on `#1E2A36` | 4.5:1 | **14.59:1** |
| Filter chip text on chip | `#9DB4CC` on `#0F151D` | 4.5:1 | **8.59:1** |
| Banner text on banner | `#F0E0C8` on `#4C1015` | 4.5:1 | **11.64:1** |
| Header tag, left glyph (warm) on warm half | `#E0C8A0` on `#2C1F14` | 4.5:1 | **9.85:1** |
| Header tag, right glyph (cold) on cold half | `#A9C0D8` on `#132435` | 4.5:1 | **8.43:1** |
| Edit label on edit bar | `#E8666A` on `#2A0C0E` | 4.5:1 | **5.65:1** |
| Done / close button text on edit bar | `#E8666A` on `#2A0C0E` | 4.5:1 | **5.65:1** |
| + FILE / + INSTALLED text on edit bar | `#C8B090` on `#2A0C0E` | 4.5:1 | **8.70:1** |
| Done button text on its hover fill | `#FFFFFF` on `#4A1618` | 4.5:1 | **14.80:1** |
| Settings text on overlay | `#C8B090` on `#0C0808` | 4.5:1 | **9.55:1** |
| Settings text on panel | `#C8B090` on `#171212` | 4.5:1 | **8.90:1** |
| Settings label (text-dim) on panel | `#A8946F` on `#171212` | 4.5:1 | **6.30:1** |
| Settings value / cheat key (accent-text) on panel | `#9DB4CC` on `#171212` | 4.5:1 | **8.69:1** |
| Settings version value (accent-text, F2 rule) on overlay | `#9DB4CC` on `#0C0808` | 4.5:1 | **9.33:1** |
| Settings CLOSE text on panel | `#E8666A` on `#171212` | 4.5:1 | **5.78:1** |
| Settings CLOSE text on its hover fill | `#FFFFFF` on `#4A1618` | 4.5:1 | **14.80:1** |
| Hotkey error text (accent-m) on panel | `#E8666A` on `#171212` | 4.5:1 | **5.78:1** |
| Hotkey input text on input fill | `#9DB4CC` on `#131B24` | 4.5:1 | **8.13:1** |
| Picker row text on hover fill | `#C8B090` on `#131B24` | 4.5:1 | **8.32:1** |
| Update banner text on update bar | `#9DB4CC` on `#101A24` | 4.5:1 | **8.23:1** |
| Update button text on hover fill | `#FFFFFF` on `#1C2C3C` | 4.5:1 | **14.24:1** |
| Drop-hint text (text-dim) on grid ground | `#A8946F` on `#0C0808` | 4.5:1 | **6.77:1** |
| Remove glyph (#FFFFFF) on remove button | `#FFFFFF` on `#A81E20` | 3.0:1 | **7.31:1** |
| Remove glyph on remove button hover fill | `#FFFFFF` on `#CC2929` | 3.0:1 | **5.36:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#CC2929` on `#120E0E` | 3.0:1 | **3.58:1** |
| Focus ring on grid ground (non-text) | `#CC2929` on `#0C0808` | 3.0:1 | **3.72:1** |
| Hover border on grid ground (non-text) | `#7F9AB4` on `#0C0808` | 3.0:1 | **6.82:1** |
| Hover border on hover fill (non-text) | `#7F9AB4` on `#0F151D` | 3.0:1 | **6.27:1** |
| Theme-picker row hover/active text (accent-text) on picker hover fill | `#9DB4CC` on `#131B24` | 4.5:1 | **8.13:1** |
| Theme-picker selected row text (accent-text) on picker active fill | `#9DB4CC` on `#1C2836` | 4.5:1 | **6.99:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#9DB4CC` on `#0F151D` | 4.5:1 | **8.59:1** |
| Picker / skin search input text (accent-text) on search fill | `#9DB4CC` on `#131B24` | 4.5:1 | **8.13:1** |
| Rename / hotkey input text (accent-text) on input fill | `#9DB4CC` on `#131B24` | 4.5:1 | **8.13:1** |
| Search placeholder (text-dim) on search fill | `#A8946F` on `#131B24` | 4.5:1 | **5.89:1** |
| Hotkey recording text (accent-m) on input fill | `#E8666A` on `#131B24` | 4.5:1 | **5.41:1** |
| Update dismiss glyph (text-dim) on update bar | `#A8946F` on `#101A24` | 4.5:1 | **5.97:1** |

**Lowest ratio in this theme: 3.58:1 (Focus ring (accent-c) on tile rest (non-text)).** Lowest text ratio: 4.98:1 (Title dot (`.accent`) on header). Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (mock plates from the gallery, rest ground `#120E0E`):

| Icon plate (mock) | After fx | Tile ground | Ratio | Needs 3:1 |
|---|---|---|---|---|
| Notepad `#5b7fa6` | `#748593` | `#120E0E` | 5.04:1 | pass |
| Calculator `#6b6f76` | `#787673` | `#120E0E` | 4.24:1 | pass |
| Paint `#b07a4f` | `#AB8663` | `#120E0E` | 5.77:1 | pass |
| Terminal `#3d4450` | `#46484B` | `#120E0E` | 2.09:1 | excluded (app art baseline, see 0.1.8) |
| Browser `#4f8a8b` | `#6C8B83` | `#120E0E` | 5.17:1 | pass |
| Files `#c09a3e` | `#BFA362` | `#120E0E` | 7.88:1 | pass |

Lowest non-Terminal icon ratio at rest: **4.24:1** (pass). Terminal is 2.09:1 (mock plate art; the fx does not darken it). On the hover fill `#0F151D`: **4.05:1**; on the pressed fill `#0F151D`: **4.05:1** (both pass).

**Icons with grain at peak alpha 0.084 on the ground only (worst case: the plate pixel untouched, the ground pixel at the noise peak):** lowest non-Terminal plate **3.49:1** (passes 3:1).

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex (the header and banner may carry opaque gradients; the lightest stop is the one measured above), so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.


Notes: this palette clears the gate with margin (text-dim 6.8:1, accent-c 3.7:1, hint-sub 6.8:1). `--text` is pale sepia `#C8B090` (9.6:1); `--accent-text` is the **cold channel** blue-grey `#9DB4CC` (values, chip, hotkey, picker rows, version, update bar: 9.3:1); `--accent-c` is blood `#CC2929` (rules, borders, ring, sliders; the audit's `#A31A1A` is 2.6:1 and fails); `--accent-m` is a lighter blood `#E8666A` for small red text (edit label, hotkey error, done, close, title dot: 5.0 to 5.8:1). The tile hover fill `#0F151D` and rest fill `#120E0E` are darker than the other themes on purpose: the grain layer paints above the tiles, and with a peak alpha of 0.084 the worst-case pixel (plate untouched, ground at the noise peak) would otherwise drop the Calculator plate under 3:1.

### 5.2 Type (all stock Windows, verified in `C:/Windows/Fonts`)

| Role | Stack | Weight | Size | Tracking | Case |
|---|---|---|---|---|---|
| Body, settings, pickers (`--font`) | `'Segoe UI', Arial, sans-serif` | 400 (base) | base | base | base |
| `#title` | same (`seguisb.ttf`) | 600 | 11 px (base) | 3px | uppercase (markup) |
| `.tile-label` | same (`segoeui.ttf`) | 400 (`--tile-label-weight`) | 12 px (base) | 0.4px | as typed (`none`) |
| `#theme-banner-text` | same | 400 | 11 px (base) | 0.4px | sentence case, as written in 0.8 |
| header tag (`#header::after`) | `'Yu Gothic', 'MS Gothic', sans-serif` (`YuGothB.ttc`) | 700 | 14 px | 8px (plus `text-indent: 8px`) | 屍人 |

Regular weight, not the audit's Semilight: Semilight is hairline at 12 px on a dark ground (B1 12.8 watch item 3). Measured: the title is 115 px wide and ends at x 127.5 (art at 168: 40 px clear). Labels in Segoe UI 12 px with 0.4 px tracking: Notepad 49, Calculator 57, Terminal 48, Browser 45 px; "Spreadsheet Editor" (105 px) ellipsizes as today. Banner strings end at x 243, 128 and 96. The two tag glyphs' ink measured at window x 192.7 to 204.7 and 214.7 to 226.7 on the mock, with the seam at x 209 to 211 between them (4.6 px and 3.7 px clear). Expected `fontsRendered`: `Segoe UI Semibold, Segoe UI, Yu Gothic`. **Cyrillic:** none in this theme; Segoe UI and Segoe UI Semibold contain U+0416 (negative control failed as it should).

### 5.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the three current SVGs (sightjack lines, static, red streaks), the readout, header text, edit-bar text, particles, the `#app::after` red lines and vignette (replaced by the grain below), the `#app` border flicker, and the hover `tile-flicker` (B1 0.3, 0.5).

**A. Header: two channels, seam, tag, red rule (HZ).**
- `#header { background: linear-gradient(90deg, #2C1F14 0 210px, #132435 210px 100%); border-bottom-color:#CC2929; box-shadow: inset 0 -2px 0 #CC2929; }`: warm half to x 210, cold half from x 210 (hard stop). The red line is 3 px inside the header (y 37 to 40); nothing below.
- **Seam, `#header::before`** (repurposed from the 2 px accent bar): `left:209px; top:0; bottom:3px; width:2px; background:#D8CCB8; box-shadow:none;`, hidden while the chip shows with `#header:has(#filter-chip:not(.hidden))::before { display:none; }`. It stops 3 px above the bottom so it does not cross the red line.
- **Tag, `#header::after`**: `content:'屍人'; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px; font:700 14px/20px 'Yu Gothic','MS Gothic',sans-serif; letter-spacing:8px; text-indent:8px; text-align:center; white-space:nowrap; background:linear-gradient(90deg,#E0C8A0 0 50%,#A9C0D8 50% 100%); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; color:transparent; pointer-events:none;`, hidden while the chip shows. The left glyph (屍) is warm sepia on the warm half (9.9:1), the right glyph (人) is cold blue-grey on the cold half (8.4:1). "Shibito" (the risen dead) is a game term, not a logo.
- `#title` is sepia Segoe UI Semibold with a blood dot: `#title { font-family:'Segoe UI',Arial,sans-serif; font-weight:600; letter-spacing:3px; color:#E0C8A0; text-shadow:none; } #title .accent { color:#E8666A; } #header-version { color:#B8A47F; }`.

**B. Static grain (texture; the only texture in this batch), `#app::after`.** `#app::after { top: var(--header-h); background: url(grain) 0 0 / 200px 200px repeat; }`: the header band is left clean (B1 F7). SVG `grain` is the promise-mascot recipe (B1 1.3 A): a 200 x 200 `feTurbulence` (fractalNoise, baseFrequency 0.9, 2 octaves, stitched) with a colour matrix giving a constant warm grey `(0.80, 0.75, 0.66)` and an alpha of `0.115 x noise - 0.031` (mean about 0.027, peak 0.084). No halftone, no scanlines. **Tuning knob:** target sigma 2.0 to 3.0, hard cap 3.0 (the batch ceiling is 3.94); my mock measured 2.48. If Ender's hidden-tiles run records a value outside 2.0 to 3.0, scale the two alpha coefficients (0.115 and -0.031) by 2.5 / recorded and re-capture. Never let the peak alpha exceed 0.10 (label and icon contrast, above). Worst case for labels: the label `#C8B090` on the peak-lit tile ground `#221D1B` is **8.0:1**.

**C. Frame: three static-band lines (top band).** `#grid-container { background: url(bands) 0 0 / 424px 11px repeat-x; }`. SVG `bands`, `viewBox 0 0 424 11`: three 1 px lines in the top band at container y 2, 5 and 8 (window y 42, 45, 48), in two colours (cold `rgb(127,154,180)`, warm `rgb(168,148,111)`) and broken into segments (x 2 to 152 and 190 to 250; 70 to 280 and 330 to 420; 30 to 120 and 200 to 410), like interference on a monitor. Repeat every 424 px (they wrap without a seam). They sit above the first tile row (y 56) and the keep-out (y 52).

**D. Banner: the red water.** `#theme-banner { background: linear-gradient(#170C0C, #4C1015); border-top:0; }`.
- **Wave, `#theme-banner::after`**: `content:''; position:absolute; top:0; left:0; right:0; height:6px; background:url(wave) 0 0 / 32px 6px repeat-x; pointer-events:none;`. SVG `wave`, 32 x 6: a dark-red `rgb(128,22,26)` fill under a 1 px pale-red `rgb(214,96,86)` wave line (four half-waves per tile). The text starts at banner y 15, 9 px clear.
- **Icon, SVG `horn`, 22 x 22** in `#theme-banner::before` (content '', 22 x 22, `font-size:0`, `opacity:1`): a siren mast with two flared horns, pale `rgb(240,224,200)`, 1.4 to 1.6 px strokes (no logo, no Shibito art).
- `#theme-banner-text { font-family:'Segoe UI',Arial,sans-serif; letter-spacing:0.4px; color:#F0E0C8; }` (over the darkest part of the gradient; measured at the lightest stop `#4C1015` it is 11.6:1).

**E. Tiles.** Radius 1 px, fill `#120E0E`, border `#32282A`. Hover and focus: the **cold channel**: fill `#0F151D`, border `#7F9AB4`. Icons at rest are sepia-toned (`sepia(0.3) saturate(0.85)`); they do not change on hover.

**The rules** (everything after `:root`; paste as is; encode SVGs per B1 0.2):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #CC2929; }
#app::after { top: var(--header-h); background: @GRAIN@ 0 0 / 200px 200px repeat; }

/* header: two channels, a hard seam at x 210 (warm left, cold right) */
#header {
  background: linear-gradient(90deg, #2C1F14 0 210px, #132435 210px 100%);
  border-bottom-color: #CC2929; box-shadow: inset 0 -2px 0 #CC2929;
}
#header::before { left: 209px; top: 0; bottom: 3px; width: 2px; background: #D8CCB8; box-shadow: none; }
#header:has(#filter-chip:not(.hidden))::before { display: none; }
#header::after {
  content: '屍人'; position: absolute; top: 10px; right: 172px; left: auto; width: 84px; height: 20px;
  font: 700 14px/20px 'Yu Gothic', 'MS Gothic', sans-serif; letter-spacing: 8px; text-indent: 8px; text-align: center; white-space: nowrap;
  background: linear-gradient(90deg, #E0C8A0 0 50%, #A9C0D8 50% 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: 'Segoe UI', Arial, sans-serif; font-weight: 600; letter-spacing: 3px; color: #E0C8A0; text-shadow: none; }
#title .accent { color: #E8666A; }
#header-version { color: #B8A47F; }

#grid-container { background: @BANDS@ 0 0 / 424px 11px repeat-x; }

.app-tile { background: #120E0E; border-color: #32282A; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: var(--tile-hover-bg); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.tile-label { font-family: 'Segoe UI', Arial, sans-serif; }

#theme-banner { background: linear-gradient(#170C0C, #4C1015); border-top: 0; }
#theme-banner::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 6px; background: @WAVE@ 0 0 / 32px 6px repeat-x; pointer-events: none; }
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @HORN@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: 'Segoe UI', Arial, sans-serif; letter-spacing: 0.4px; color: #F0E0C8; }
```

| Placeholder | Is `url("data:image/svg+xml,...")` of SVG |
|---|---|
| `@GRAIN@` | `grain` |
| `@BANDS@` | `bands` |
| `@WAVE@` | `wave` |
| `@HORN@` | `horn` |

**SVG sources** (readable; `grain` has an internal `url(%23g)` reference that is already encoded: leave it):

**`bands`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 424 11'>
<rect x='2' y='2' width='150' height='1' fill='rgb(127,154,180)'/>
<rect x='190' y='2' width='60' height='1' fill='rgb(127,154,180)'/>
<rect x='70' y='5' width='210' height='1' fill='rgb(168,148,111)'/>
<rect x='330' y='5' width='90' height='1' fill='rgb(168,148,111)'/>
<rect x='30' y='8' width='90' height='1' fill='rgb(127,154,180)'/>
<rect x='200' y='8' width='210' height='1' fill='rgb(127,154,180)'/>
</svg>
```

**`wave`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 6'>
<path d='M0 3 Q4 0 8 3 T16 3 T24 3 T32 3 V6 H0 Z' fill='rgb(128,22,26)'/>
<path d='M0 3 Q4 0 8 3 T16 3 T24 3 T32 3' fill='none' stroke='rgb(214,96,86)' stroke-width='1'/>
</svg>
```

**`horn`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<path d='M11 21 V9' stroke='rgb(240,224,200)' stroke-width='1.6' fill='none'/>
<path d='M11 9 L3 4.5 V13.5 Z' fill='rgb(240,224,200)'/>
<path d='M11 9 L19 4.5 V13.5 Z' fill='rgb(240,224,200)'/>
<path d='M3 4.5 V13.5 M19 4.5 V13.5' stroke='rgb(240,224,200)' stroke-width='1.4'/>
<path d='M6 21 H16' stroke='rgb(240,224,200)' stroke-width='1.6'/>
</svg>
```

**`grain`**
```
<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'>
<filter id='g' x='0' y='0' width='200' height='200' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'>
<feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
<feColorMatrix type='matrix' values='0 0 0 0 0.80 0 0 0 0 0.75 0 0 0 0 0.66 0.115 0 0 0 -0.031'/>
</filter>
<rect width='200' height='200' filter='url(%23g)'/>
</svg>
```


### 5.4 Motion

| # | Today (infinite) | Element and property | Fate |
|---|---|---|---|
| 1 | `siren-title 12s steps(1)` | `#title` colour, opacity, text-shadow (tier 2) | removed |
| 2 | `banner-flicker 6s steps(1)` | `#theme-banner::before` opacity (tier 1) | removed |
| 3 | `siren-sightjack 12s steps(1)` | `#grid-container::before` opacity (tier 1) | removed |
| 4 | `siren-readout 12s steps(1)` | `#grid-container::after` colour (tier 2) | removed |
| 5 | `siren-border 12s steps(1)` | `#app` box-shadow (tier 5) | removed |
| 6 | `siren-scan 8s linear` | `#particles` background-position (tier 4) | removed |
| hover | `tile-flicker .4s steps(1) infinite` | `.app-tile:hover::before` opacity (tier 1) | removed (`::before` is `display:none`) |

**Before 6 (+1 hover-only), after 0.** `grep -c infinite siren.css` is 0. The grain is static (a tiled image, never animated).

### 5.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** `#120E0E`, border `#32282A`, radius 1 px, `::before` off, layout unchanged. Icons sepia-toned, shape `none` (the old wobbly polygon is gone).
- **Hover:** fill `#0F151D`, border `#7F9AB4` (6.3:1 on the fill), no glow, no transform.
- **Selected (focus-visible):** hover plus the base 2 px blood ring at offset 2 (3.7:1 on the ground, 3.6:1 on the tile): `.app-tile:hover, .app-tile:focus-visible { background:var(--tile-hover-bg); border-color:var(--tile-hover-border); box-shadow:var(--tile-hover-shadow); }`.
- **Pressed:** base scale 0.96 on `#0F151D`.
- **Label:** sepia `#C8B090`, Segoe UI regular, as typed, no halo.
- **Filter chip:** base rule (fill `#0F151D`, blood border, cold blue-grey text 8.6:1). The tag and the seam hide while it shows.
- **Edit bar:** `#2A0C0E` fill, blood rule, light-blood label (5.7:1), no quote. The tile ✕ is `#A81E20`; on hover `#CC2929` (`.btn-remove:hover`, white ✕ 5.4:1).
- **Settings overlay:** opaque `#0C0808`, panel `#171212`, cold blue-grey values and version, blood sliders and checkboxes.
- **Update banner:** cold blue-grey `#9DB4CC` on `#101A24` with a `#7F9AB4` rule.

### 5.6 Done when

1. `npm run check:contrast` passes with **no rebaseline** (siren leaves the legacy list); `grep -c infinite siren.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`.
2. Header: warm brown left half and cold blue-grey right half with a hard edge at x 210 (sample x 200 and x 220 at y 5); a 2 px pale seam at x 209 to 211, y 0 to 37; 屍 at x 193 to 205 in sepia and 人 at x 215 to 227 in blue-grey; a 3 px blood line at y 37 to 40 and nothing below; typing a letter hides the tag and the seam. `#title` right edge at most 132.
3. Top band: three thin broken lines at y 42, 45 and 48, cold and warm; nothing in the tile field; no line touches a tile.
4. Banner: a dark-to-blood gradient, a wave line along its top edge (6 px), a pale siren horn at x 14 to 36, pale sepia text on one line (`scrollWidth <= clientWidth` for all three strings).
5. Hover shot (CALCULATOR): blue-grey border, cold near-black fill, no glow.
6. Grain: visible fine static over the tile field; **hidden-tiles sigma between 2.0 and 3.0 and at most 3.94**; Calculator plate at least 3.0:1 in the hover shot measured from pixels; no visible grain on the header.
7. Settings shot: blue-grey "64px" and version.
8. A/B/C probe at the three sizes and the states shot: overlap 0 px, art in keep-out 0 px. Art-off for the probe: hide `#header::after`, `#header::before`, `#theme-banner::before` and `#theme-banner::after`, and set `#grid-container { background:none !important; }`; the grain (`#app::after`) stays on in A, B and C (it is texture, not art; probe it separately by hiding it once). My run: clearance 4.0 px at 424 x 300, 7.3 px at 640 and 1024; the 1.3 px in the states shot is the last tile row meeting the wave strip.
9. `fontsRendered` lists `Segoe UI Semibold`, `Segoe UI` and `Yu Gothic`.

**Expected squint score: 4.** What survives: a warm and a cold half of the header split by a bright seam with a two-glyph tag, band lines, a blood-red rising-water banner with a wave edge and a horn, and a cold-blue hover. What is missing: the Shibito and the village (not drawable without copying the game's art) and the PS2 vision's dial; the grain carries the 2003 picture.

---

## 6. persona-3 (PERSONA 3, the original 2006 game): DONE

**Audit:** score 3, redraw. Cold navy is right, but the accent was a dull dark blue where P3 is bright cyan on near-black; a "Tartarus tactical recon" dossier (a clock dial behind NOTEPAD, a moon circle behind PAINT, status lists, about 59 painted strings) filled the tile field; the coffin-lid crop clipped the glyph tops; no tilted blocks, no big shapes.
**Direction:** the original's flat cold blue. A near-black midnight ground; a header with a bright-blue block whose right edge is slanted (title on it), a cyan rule, and in the art zone a clock stopped at twelve plus two slanted cyan bars; a banner with a crescent icon and a big pale full moon rising at its right end; tiles in deep navy; hover puts a slanted white parallelogram behind the label (the menu highlight of the game); shadow purple marks edit mode, not hover. Bahnschrift SemiCondensed caps. Not Reload: no gloss, no blur, no animation.

### 6.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 3px;
  --app-clip: none;
  --overlay-clip: none;
  --bg: #050B2A;
  --panel-bg: #0A1440;
  --overlay-bg: #050B2A;
  --header-bg: #0A1A5A;
  --font: Bahnschrift, 'Segoe UI', sans-serif;
  --text: #D9E3EE;
  --text-dim: #94A8CC;
  --accent-c: #1BB4F2;
  --accent-m: #B3A6EC;
  --accent-y: #8CE3FF;
  --accent-text: #8CE3FF;
  --border: #1E3C8C;
  --border-h: #1BB4F2;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #1BB4F2;
  --title-anim: none;
  --tile-hover-bg: #0C1A54;
  --tile-hover-border: #1BB4F2;
  --tile-hover-shadow: none;
  --tile-active-bg: #0C1A54;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: saturate(0.9);
  --tile-icon-shape: none;
  --tile-label-spacing: 1px;
  --tile-label-transform: uppercase;
  --tile-label-weight: 600;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #12308C;
  --btn-active-bg: #1A3CA8;
  --drop-hint-border: #2A4AA0;
  --drop-icon-color: #6A80B0;
  --hint-sub-color: #94A8CC;
  --rename-dashed: #1BB4F2;
  --rename-input-bg: #0C1A54;
  --edit-bar-bg: #1A1040;
  --edit-bar-border: #6A5AA0;
  --edit-label-color: #B3A6EC;
  --edit-label-glow: none;
  --btn-done-color: #B3A6EC;
  --btn-done-border: #6A5AA0;
  --btn-done-hover-bg: #2A1C68;
  --btn-done-hover-glow: none;
  --btn-add-border: #6A80B0;
  --update-bg: #08204A;
  --update-border: #8CE3FF;
  --update-color: #8CE3FF;
  --update-btn-border: #8CE3FF;
  --update-btn-hover-bg: #103068;
  --update-btn-hover-glow: none;
  --btn-close-color: #B3A6EC;
  --btn-close-border: #6A5AA0;
  --btn-close-hover-bg: #2A1C68;
  --btn-close-hover-glow: none;
  --picker-search-bg: #0C1A54;
  --picker-item-hover-bg: #0C1A54;
  --picker-item-active-bg: #12266E;
  --picker-placeholder-bg: #0C1A54;
  --skin-btn-active-bg: #12266E;
  --remove-btn-bg: #4A3C9A;
  --remove-btn-border: #B3A6EC;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; I also ran the real script on the prototype file: 0 errors):

| Gate pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| --text on --bg | `#D9E3EE` on `#050B2A` | 4.5:1 | **14.87:1** |
| --text-dim on --bg | `#94A8CC` on `#050B2A` | 4.5:1 | **8.03:1** |
| --accent-c on --bg | `#1BB4F2` on `#050B2A` | 3:1 | **8.14:1** |
| --accent-text on --bg | `#8CE3FF` on `#050B2A` | 3:1 | **13.37:1** |
| --hint-sub-color on --bg | `#94A8CC` on `#050B2A` | 4.5:1 | **8.03:1** |

**Add-on pairs** (each text or control colour on its real surface; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#D9E3EE` on `#0A1440` | 4.5:1 | **13.62:1** |
| Tile label on hover pill | `#050B2A` on `#D9E3EE` | 4.5:1 | **14.87:1** |
| Tile label on hover pill (pressed state) | `#050B2A` on `#D9E3EE` | 4.5:1 | **14.87:1** |
| Title on header | `#FFFFFF` on `#0F3FA0` | 4.5:1 | **9.38:1** |
| Title dot (`.accent`) on header | `#8CE3FF` on `#0F3FA0` | 4.5:1 | **6.50:1** |
| Header version on header | `#C4D4F0` on `#0F3FA0` | 4.5:1 | **6.26:1** |
| Header button glyph on header | `#D9E3EE` on `#0A1A5A` | 4.5:1 | **12.36:1** |
| Header button glyph on button hover | `#FFFFFF` on `#12308C` | 4.5:1 | **11.49:1** |
| Filter chip text on chip | `#8CE3FF` on `#0C1A54` | 4.5:1 | **11.26:1** |
| Banner text on banner | `#D9E3EE` on `#0A1444` | 4.5:1 | **13.52:1** |
| Edit label on edit bar | `#B3A6EC` on `#1A1040` | 4.5:1 | **8.04:1** |
| Done / close button text on edit bar | `#B3A6EC` on `#1A1040` | 4.5:1 | **8.04:1** |
| + FILE / + INSTALLED text on edit bar | `#D9E3EE` on `#1A1040` | 4.5:1 | **13.57:1** |
| Done button text on its hover fill | `#FFFFFF` on `#2A1C68` | 4.5:1 | **14.34:1** |
| Settings text on overlay | `#D9E3EE` on `#050B2A` | 4.5:1 | **14.87:1** |
| Settings text on panel | `#D9E3EE` on `#0A1440` | 4.5:1 | **13.62:1** |
| Settings label (text-dim) on panel | `#94A8CC` on `#0A1440` | 4.5:1 | **7.36:1** |
| Settings value / cheat key (accent-text) on panel | `#8CE3FF` on `#0A1440` | 4.5:1 | **12.26:1** |
| Settings version value (accent-text, F2 rule) on overlay | `#8CE3FF` on `#050B2A` | 4.5:1 | **13.37:1** |
| Settings CLOSE text on panel | `#B3A6EC` on `#0A1440` | 4.5:1 | **8.07:1** |
| Settings CLOSE text on its hover fill | `#FFFFFF` on `#2A1C68` | 4.5:1 | **14.34:1** |
| Hotkey error text (accent-m) on panel | `#B3A6EC` on `#0A1440` | 4.5:1 | **8.07:1** |
| Hotkey input text on input fill | `#8CE3FF` on `#0C1A54` | 4.5:1 | **11.26:1** |
| Picker row text on hover fill | `#D9E3EE` on `#0C1A54` | 4.5:1 | **12.52:1** |
| Update banner text on update bar | `#8CE3FF` on `#08204A` | 4.5:1 | **11.06:1** |
| Update button text on hover fill | `#FFFFFF` on `#103068` | 4.5:1 | **12.77:1** |
| Drop-hint text (text-dim) on grid ground | `#94A8CC` on `#050B2A` | 4.5:1 | **8.03:1** |
| Remove glyph (#FFFFFF) on remove button | `#FFFFFF` on `#4A3C9A` | 3.0:1 | **8.73:1** |
| Remove glyph on remove button hover fill | `#FFFFFF` on `#4A3C9A` | 3.0:1 | **8.73:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#1BB4F2` on `#0A1440` | 3.0:1 | **7.46:1** |
| Focus ring on grid ground (non-text) | `#1BB4F2` on `#050B2A` | 3.0:1 | **8.14:1** |
| Hover border on grid ground (non-text) | `#1BB4F2` on `#050B2A` | 3.0:1 | **8.14:1** |
| Hover border on hover fill (non-text) | `#1BB4F2` on `#0C1A54` | 3.0:1 | **6.86:1** |
| Theme-picker row hover/active text (accent-text) on picker hover fill | `#8CE3FF` on `#0C1A54` | 4.5:1 | **11.26:1** |
| Theme-picker selected row text (accent-text) on picker active fill | `#8CE3FF` on `#12266E` | 4.5:1 | **9.52:1** |
| Picker / skin search input text (accent-text) on search fill | `#8CE3FF` on `#0C1A54` | 4.5:1 | **11.26:1** |
| Rename / hotkey input text (accent-text) on input fill | `#8CE3FF` on `#0C1A54` | 4.5:1 | **11.26:1** |
| Search placeholder (text-dim) on search fill | `#94A8CC` on `#0C1A54` | 4.5:1 | **6.76:1** |
| Hotkey recording text (accent-m) on input fill | `#B3A6EC` on `#0C1A54` | 4.5:1 | **7.42:1** |
| Update dismiss glyph (text-dim) on update bar | `#94A8CC` on `#08204A` | 4.5:1 | **6.64:1** |

**Lowest ratio in this theme: 6.26:1 (Header version on header).** Lowest text ratio: 6.26:1 (Header version on header). Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (mock plates from the gallery, rest ground `#0A1440`):

| Icon plate (mock) | After fx | Tile ground | Ratio | Needs 3:1 |
|---|---|---|---|---|
| Notepad `#5b7fa6` | `#5E7FA2` | `#0A1440` | 4.24:1 | pass |
| Calculator `#6b6f76` | `#6B6F75` | `#0A1440` | 3.50:1 | pass |
| Paint `#b07a4f` | `#AB7B54` | `#0A1440` | 4.80:1 | pass |
| Terminal `#3d4450` | `#3E444F` | `#0A1440` | 1.81:1 | excluded (app art baseline, see 0.1.8) |
| Browser `#4f8a8b` | `#54898A` | `#0A1440` | 4.48:1 | pass |
| Files `#c09a3e` | `#BC9A47` | `#0A1440` | 6.61:1 | pass |

Lowest non-Terminal icon ratio at rest: **3.50:1** (pass). Terminal is 1.81:1 (mock plate art; the fx does not darken it). On the hover fill `#0C1A54`: **3.22:1**; on the pressed fill `#0C1A54`: **3.22:1** (both pass).

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex (the header and banner may carry opaque gradients; the lightest stop is the one measured above), so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.


Notes: `--accent-c` is cyan `#1BB4F2` (rules, borders, ring, sliders: 8.1:1); `--accent-text` and `--accent-y` are pale cyan `#8CE3FF` (values, chip, hotkey, picker rows, version, update bar); `--accent-m` is a light shadow-purple `#B3A6EC` for edit label, hotkey error, done and close (8.0:1), with the audit's `#6A5AA0` kept as the edit bar's border and `#4A3C9A` as the ✕ fill. The audit put purple on hover only; here the hover already carries the white slanted highlight, so purple is the one "other" hue and belongs to edit mode. The header block `#0F3FA0` carries the title (9.4:1) and version (6.3:1); the buttons sit on the darker `#0A1A5A` half. `--tile-hover-bg` and `--tile-active-bg` are `#0C1A54` (L 0.0146); the Calculator plate keeps 3.22:1 on it, the lowest icon figure of the batch (still above 3).

### 6.2 Type (all stock Windows, verified in `C:/Windows/Fonts`)

| Role | Stack | Weight | Size | Tracking | Case |
|---|---|---|---|---|---|
| Body, settings, pickers (`--font`) | `Bahnschrift, 'Segoe UI', sans-serif` (normal width) | 400 (base) | base | base | base |
| `#title` | `Bahnschrift, 'Segoe UI', sans-serif`, `font-stretch: 87.5%` | 700 | 11 px (base) | 4px | uppercase (markup) |
| `.tile-label` | same, `font-stretch: 87.5%` | 600 (`--tile-label-weight`) | 12 px (base) | 1px | uppercase |
| `#theme-banner-text` | same, `font-stretch: 87.5%` | 600 | 11 px (base) | 1.2px | uppercase strings, as written in 0.8 |

`font-stretch: 87.5%` is the value Ender proved in batch 1 (0.2 item 3); `75%` resolves to the same SemiCondensed face and is not used. Measured (Bahnschrift SemiCondensed, weight from the table, tracking as above): the title ends at x 123 (art at 168: 45 px clear). Labels: NOTEPAD 51, CALCULATOR 73, TERMINAL 57, BROWSER 54 px, inside the 100 px box (the label's 8 px padding leaves 84 px of text); "SPREADSHEET EDITOR" (123 px) ellipsizes as today. Banner strings: 299 px (ends x 345), 283 px (ends x 329) and 89 px. **Fallback if the width axis does not apply** (CALCULATOR measures about 84 px instead of 73): string 1 would end at x 393 (over the moon, which starts at x 378) and string 2 at x 373 (5 px clear); in that case Ender drops string 1 only, reports it, and changes nothing else. Expected `fontsRendered`: `Bahnschrift`. **Cyrillic:** none in this theme; Bahnschrift and Segoe UI contain U+0416 (negative control failed as it should).

### 6.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the four current SVGs (Tartarus dossier, dust, two mote tiles), the readout, header text, edit-bar text, particles, the `#app::after` glow and vignette (`#app::after { background: none; }`, so no texture), the `#app` Dark Hour pulse, and the `dark-hour` title keyframes (B1 0.3, 0.5).

**A. Header: a slanted blue block, a cyan rule, a clock and two bars (HZ).**
- `#header { background: linear-gradient(100deg, #0F3FA0 0 236px, #0A1A5A 236px 100%); border-bottom-color:#1BB4F2; box-shadow: inset 0 -2px 0 #1BB4F2; }`. The hard stop at 236 px on a 100-degree line gives a block whose right edge leans about 10 degrees (it lands between x 232 and 240 across the 40 px height). The cyan line is 3 px inside the header (y 37 to 40); nothing below. `#header::before { background:#8CE3FF; box-shadow:none; }`.
- **Clock and bars, `#header::after`**: the shared header-art recipe (84 x 20 box, hidden while the chip shows). SVG `clock`, `viewBox 0 0 84 20`: a clock face at (10,10) r 8.2 (fill `rgb(5,11,42)`, 1.5 px pale-cyan `rgb(140,227,255)` rim, twelve ticks, both hands pointing to twelve in `rgb(217,227,238)`: the game's hidden hour); then two **slanted bars**, each leaning right about 45 degrees at the ends: cyan `rgb(27,180,242)` polygon (28,3) (82,3) (76,9) (22,9), and pale cyan `rgb(140,227,255)` polygon (34,11) (70,11) (64,17) (28,17). The art spans x 1.8 to 82 of the box (window x 170 to 250).
- `#title { font-family:Bahnschrift,'Segoe UI',sans-serif; font-stretch:87.5%; font-weight:700; letter-spacing:4px; color:#FFFFFF; text-shadow:none; } #title .accent { color:#8CE3FF; } #header-version { color:#C4D4F0; }`.

**B. Banner: a crescent, a rising full moon, a cyan rule.**
`#theme-banner { background: url(fullmoon) right -6px bottom -14px / 52px 52px no-repeat, #0A1444; border-top: 3px solid #1BB4F2; }`
- **Full moon, SVG `fullmoon`, 52 x 52** at `right -6px bottom -14px`: a pale `rgb(217,227,238)` disc r 26 with four soft craters `rgb(184,200,222)` (r 5, 7, 3.4, 3). Window x 378 to 424 (the disc is cropped by the right edge and the banner bottom), top at banner y 6. The longest banner string ends at x 345, so at least 33 px clear.
- **Icon, SVG `moon`, 22 x 22** in `#theme-banner::before` (content '', 22 x 22, `font-size:0`, `opacity:1`): a pale crescent (one path: a disc with a bite).
- `#theme-banner-text { font-family:Bahnschrift,'Segoe UI',sans-serif; font-stretch:87.5%; font-weight:600; letter-spacing:1.2px; color:#D9E3EE; }` (13.5:1 on `#0A1444`).

**C. Tiles.** Radius 3 px, fill `#0A1440`, border `#16307C`. Hover and focus: fill `#0C1A54`, border cyan `#1BB4F2`, and a **slanted highlight behind the label**: `.tile-label { padding:0 8px; }` always, and on hover and focus `background:#D9E3EE; color:#050B2A; clip-path: polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%);`: a white parallelogram leaning right (14.9:1 with the navy text). The clip-path is static and only on the label; it never touches the tile, so the focus ring is not clipped.

**The rules** (everything after `:root`; paste as is; encode SVGs per B1 0.2):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #4A3C9A; }
#app::after { background: none; }

#header {
  background: linear-gradient(100deg, #0F3FA0 0 236px, #0A1A5A 236px 100%);
  border-bottom-color: #1BB4F2; box-shadow: inset 0 -2px 0 #1BB4F2;
}
#header::before { background: #8CE3FF; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto; width: 84px; height: 20px;
  background: @CLOCK@ no-repeat 0 0 / 84px 20px; pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: Bahnschrift, 'Segoe UI', sans-serif; font-stretch: 87.5%; font-weight: 700; letter-spacing: 4px; color: #FFFFFF; text-shadow: none; }
#title .accent { color: #8CE3FF; }
#header-version { color: #C4D4F0; }

.app-tile { background: #0A1440; border-color: #16307C; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: var(--tile-hover-bg); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.tile-label { font-family: Bahnschrift, 'Segoe UI', sans-serif; font-stretch: 87.5%; padding: 0 8px; }
.app-tile:hover .tile-label, .app-tile:focus-visible .tile-label, .app-tile:hover .tile-label.renameable {
  background: #D9E3EE; color: #050B2A; clip-path: polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%);
}

#theme-banner { background: @FMOON@ right -6px bottom -14px / 52px 52px no-repeat, #0A1444; border-top: 3px solid #1BB4F2; }
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @MOON@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: Bahnschrift, 'Segoe UI', sans-serif; font-stretch: 87.5%; font-weight: 600; letter-spacing: 1.2px; color: #D9E3EE; }
```

| Placeholder | Is `url("data:image/svg+xml,...")` of SVG |
|---|---|
| `@FMOON@` | `fullmoon` |
| `@CLOCK@` | `clock` |
| `@MOON@` | `moon` |

**SVG sources** (readable; nothing here is a logo, an evoker, a coffin or a numeral):

**`clock`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'><circle cx='10' cy='10' r='8.2' fill='rgb(5,11,42)' stroke='rgb(140,227,255)' stroke-width='1.5'/><path d='M10.0 1.8 L10.0 3.8 M14.1 2.9 L13.5 3.9 M17.1 5.9 L16.1 6.5 M18.2 10.0 L16.2 10.0 M17.1 14.1 L16.1 13.5 M14.1 17.1 L13.5 16.1 M10.0 18.2 L10.0 16.2 M5.9 17.1 L6.5 16.1 M2.9 14.1 L3.9 13.5 M1.8 10.0 L3.8 10.0 M2.9 5.9 L3.9 6.5 M5.9 2.9 L6.5 3.9 ' stroke='rgb(140,227,255)' stroke-width='1' fill='none'/><path d='M10 10 V4.6 M10 10 V6.4' stroke='rgb(217,227,238)' stroke-width='1.4' stroke-linecap='round'/><circle cx='10' cy='10' r='1' fill='rgb(217,227,238)'/><polygon points='28,3 82,3 76,9 22,9' fill='rgb(27,180,242)'/><polygon points='34,11 70,11 64,17 28,17' fill='rgb(140,227,255)'/></svg>
```

**`moon`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<path d='M14.5 2 A9.4 9.4 0 1 0 20 16.6 A7.6 7.6 0 0 1 14.5 2 Z' fill='rgb(217,227,238)'/>
</svg>
```

**`fullmoon`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 52 52'>
<circle cx='26' cy='26' r='26' fill='rgb(217,227,238)'/>
<g fill='rgb(184,200,222)'>
<circle cx='17' cy='19' r='5'/><circle cx='34' cy='30' r='7'/><circle cx='22' cy='38' r='3.4'/><circle cx='36' cy='13' r='3'/>
</g>
</svg>
```


### 6.4 Motion

| # | Today (infinite) | Element and property | Fate |
|---|---|---|---|
| 1 | `dark-hour 12s` | `#title` colour, opacity, text-shadow (tier 2) | removed |
| 2 | `banner-pulse 6s` | `#theme-banner::before` opacity (tier 1) | removed |
| 3 | `p3-tartarus-survey 14s` | `#grid-container::before` opacity (tier 1) | removed |
| 4 | `p3-sees-readout 14s` | `#grid-container::after` colour (tier 2) | removed |
| 5 | `p3-dark-hour-border 12s` | `#app` box-shadow (tier 5) | removed |
| 6 | `p3-moon-motes 18s linear` | `#particles` background-position (tier 4) | removed |
| hover | `tile-radial .55s` one-shot | `.app-tile:hover::before` | removed (`::before` is `display:none`) |

**Before 6, after 0.** `grep -c infinite persona-3.css` is 0. The hover highlight is a static shape with no animation; the tile keeps the base 0.12 s colour transition.

### 6.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** `#0A1440`, border `#16307C`, radius 3 px, `::before` off, layout unchanged. Icons `saturate(0.9)` (no darkening), shape `none` (the coffin-lid crop is gone).
- **Hover:** fill `#0C1A54`, border cyan (6.9:1 on the fill), the white slanted label highlight, no glow, no transform.
- **Selected (focus-visible):** hover plus the base 2 px cyan ring at offset 2 (8.1:1 on the ground, 7.5:1 on the tile): `.app-tile:hover, .app-tile:focus-visible { background:var(--tile-hover-bg); border-color:var(--tile-hover-border); box-shadow:var(--tile-hover-shadow); }`.
- **Pressed:** base scale 0.96 on `#0C1A54`.
- **Label:** moon white `#D9E3EE`, Bahnschrift SemiCondensed caps, no halo; on hover navy on the white parallelogram.
- **Filter chip:** base rule (fill `#0C1A54`, cyan border, pale-cyan text). The clock and bars hide while it shows.
- **Edit bar:** `#1A1040` fill, purple rule `#6A5AA0`, light-purple label (8.0:1), no quote. The tile ✕ is `#4A3C9A` and stays so on hover (`.btn-remove:hover { background:#4A3C9A; }`, white ✕ 8.7:1).
- **Settings overlay:** opaque `#050B2A`, panel `#0A1440`, pale-cyan values and version, cyan sliders and checkboxes.
- **Update banner:** pale cyan `#8CE3FF` on `#08204A` with a pale-cyan rule.

### 6.6 Done when

1. `npm run check:contrast` passes, no rebaseline; `grep -c infinite persona-3.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`.
2. Header: a brighter blue block `#0F3FA0` behind the title with a slanted right edge near x 236 and a darker `#0A1A5A` right half (sample x 100 and x 300 at y 5); a 3 px cyan line at y 37 to 40 and nothing below; the clock at window x 170 to 186 and the two slanted bars to x 250; typing a letter hides them. `#title` right edge at most 128.
3. Banner: a 3 px cyan top border on `#0A1444`, a pale crescent at x 14 to 36, a pale full moon cropped at the right edge and bottom (x 378 to 424), pale text on one line (`scrollWidth <= clientWidth` for all three strings; every string ends by x 360).
4. Hover shot (CALCULATOR): cyan border, navy-blue fill, a white parallelogram behind the label with navy text; no glow.
5. CALCULATOR label measures about 73 px wide (SemiCondensed applied); report the number. If it measures about 84 px, apply the fallback in 6.2.
6. Settings shot: pale-cyan "64px" and version; edit mode shows purple, not cyan, for its label.
7. Hidden-tiles sigma 0.00. No horizontal banding on the Notepad plate.
8. A/B/C probe at the three sizes and the states shot: overlap 0 px, art in keep-out 0 px. Art-off for the probe: hide `#header::after` and `#theme-banner::before`, and set `#theme-banner { background:#0A1444 !important; }` (my run: clearance 9.3 px, 6.7 px in the states shot).
9. `fontsRendered` lists `Bahnschrift`.

**Expected squint score: 4.** What survives: a cold navy field with bright cyan rules, a slanted blue block and two slanted bars, a clock at twelve, a crescent and a big pale full moon. What is missing for a 5: the tall custom menu lettering and the huge hollow numerals (no free face that is condensed enough; Oswald or Bebas Neue would help, section 8).

---

## 7. persona-5 (PERSONA 5): DONE

**Audit:** score 3, redraw. Red on black is right, but it was a red wash with thin-line dossier art ("Phantom Thieves dossier", a codename roster, a red star with "take your heart" under CALCULATOR) painted through the tiles. The game's look is jagged black polygons carrying white slanted type over red, torn collage, no rounded corners.
**Direction:** the game's menu, in a launcher. The header and the banner are **red surfaces** with a **black slab** cut by a sawtooth edge (the header's slab holds the title and the art, the banner's slab holds the text); the body is black; every corner is square; type is Impact in slanted caps (a synthesised italic) in white; tile icons are cut on two opposite corners; hover puts a white slanted parallelogram behind the label with black type, a red border and a red hard-offset shadow; a small red ink burst sits in the top-left corner of the frame. No star, no mask, no roster, no calling card. Static.

### 7.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 0px;
  --app-clip: none;
  --overlay-clip: none;
  --bg: #0A0A0A;
  --panel-bg: #141414;
  --overlay-bg: #0A0A0A;
  --header-bg: #D92323;
  --font: 'Segoe UI', Arial, sans-serif;
  --text: #F5F5F5;
  --text-dim: #B8B8B8;
  --accent-c: #D92323;
  --accent-m: #FFFFFF;
  --accent-y: #F5F5F5;
  --accent-text: #FF5A5A;
  --border: #3A3A3A;
  --border-h: #D92323;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #D92323;
  --title-anim: none;
  --tile-hover-bg: #1E0808;
  --tile-hover-border: #D92323;
  --tile-hover-shadow: 3px 3px 0 #D92323;
  --tile-active-bg: #1E0808;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: contrast(1.1) saturate(1.1);
  --tile-icon-shape: polygon(0 0, 76% 0, 100% 24%, 100% 100%, 24% 100%, 0 76%);
  --tile-label-spacing: 0.8px;
  --tile-label-transform: uppercase;
  --tile-label-weight: 400;
  --tile-label-style: italic;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #0A0A0A;
  --btn-active-bg: #1A1A1A;
  --drop-hint-border: #5A5A5A;
  --drop-icon-color: #8A8A8A;
  --hint-sub-color: #B8B8B8;
  --rename-dashed: #D92323;
  --rename-input-bg: #1E0808;
  --edit-bar-bg: #2A0808;
  --edit-bar-border: #FFFFFF;
  --edit-label-color: #FFFFFF;
  --edit-label-glow: none;
  --btn-done-color: #FFFFFF;
  --btn-done-border: #FFFFFF;
  --btn-done-hover-bg: #732424;
  --btn-done-hover-glow: none;
  --btn-add-border: #8A8A8A;
  --update-bg: #1A1A1A;
  --update-border: #F5F5F5;
  --update-color: #F5F5F5;
  --update-btn-border: #F5F5F5;
  --update-btn-hover-bg: #333333;
  --update-btn-hover-glow: none;
  --btn-close-color: #FFFFFF;
  --btn-close-border: #FFFFFF;
  --btn-close-hover-bg: #732424;
  --btn-close-hover-glow: none;
  --picker-search-bg: #1E0808;
  --picker-item-hover-bg: #1E0808;
  --picker-item-active-bg: #2C0C0C;
  --picker-placeholder-bg: #1E0808;
  --skin-btn-active-bg: #2C0C0C;
  --remove-btn-bg: #B01C1C;
  --remove-btn-border: #FFFFFF;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; I also ran the real script on the prototype file: 0 errors):

| Gate pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| --text on --bg | `#F5F5F5` on `#0A0A0A` | 4.5:1 | **18.16:1** |
| --text-dim on --bg | `#B8B8B8` on `#0A0A0A` | 4.5:1 | **9.98:1** |
| --accent-c on --bg | `#D92323` on `#0A0A0A` | 3:1 | **3.97:1** |
| --accent-text on --bg | `#FF5A5A` on `#0A0A0A` | 3:1 | **6.47:1** |
| --hint-sub-color on --bg | `#B8B8B8` on `#0A0A0A` | 4.5:1 | **9.98:1** |

**Add-on pairs** (each text or control colour on its real surface; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#F5F5F5` on `#111111` | 4.5:1 | **17.32:1** |
| Tile label on hover pill | `#0A0A0A` on `#FFFFFF` | 4.5:1 | **19.80:1** |
| Tile label on hover pill (pressed state) | `#0A0A0A` on `#FFFFFF` | 4.5:1 | **19.80:1** |
| Title on header | `#FFFFFF` on `#0A0A0A` | 4.5:1 | **19.80:1** |
| Title dot (`.accent`) on header | `#FF5A5A` on `#0A0A0A` | 4.5:1 | **6.47:1** |
| Header version on header | `#B8B8B8` on `#0A0A0A` | 4.5:1 | **9.98:1** |
| Header button glyph on header | `#FFFFFF` on `#D92323` | 4.5:1 | **4.98:1** |
| Header button glyph on button hover | `#FFFFFF` on `#0A0A0A` | 4.5:1 | **19.80:1** |
| Filter chip text on chip | `#FF5A5A` on `#0A0A0A` | 4.5:1 | **6.47:1** |
| Banner text on banner | `#FFFFFF` on `#0A0A0A` | 4.5:1 | **19.80:1** |
| Header button border (black) on red header (non-text) | `#0A0A0A` on `#D92323` | 3.0:1 | **3.97:1** |
| Edit label on edit bar | `#FFFFFF` on `#2A0808` | 4.5:1 | **18.47:1** |
| Done / close button text on edit bar | `#FFFFFF` on `#2A0808` | 4.5:1 | **18.47:1** |
| + FILE / + INSTALLED text on edit bar | `#F5F5F5` on `#2A0808` | 4.5:1 | **16.95:1** |
| Done button text on its hover fill | `#FFFFFF` on `#732424` | 4.5:1 | **10.46:1** |
| Settings text on overlay | `#F5F5F5` on `#0A0A0A` | 4.5:1 | **18.16:1** |
| Settings text on panel | `#F5F5F5` on `#141414` | 4.5:1 | **16.90:1** |
| Settings label (text-dim) on panel | `#B8B8B8` on `#141414` | 4.5:1 | **9.29:1** |
| Settings value / cheat key (accent-text) on panel | `#FF5A5A` on `#141414` | 4.5:1 | **6.02:1** |
| Settings version value (accent-text, F2 rule) on overlay | `#FF5A5A` on `#0A0A0A` | 4.5:1 | **6.47:1** |
| Settings CLOSE text on panel | `#FFFFFF` on `#141414` | 4.5:1 | **18.42:1** |
| Settings CLOSE text on its hover fill | `#FFFFFF` on `#732424` | 4.5:1 | **10.46:1** |
| Hotkey error text (accent-m) on panel | `#FFFFFF` on `#141414` | 4.5:1 | **18.42:1** |
| Hotkey input text on input fill | `#FF5A5A` on `#1E0808` | 4.5:1 | **6.28:1** |
| Picker row text on hover fill | `#F5F5F5` on `#1E0808` | 4.5:1 | **17.62:1** |
| Update banner text on update bar | `#F5F5F5` on `#1A1A1A` | 4.5:1 | **15.96:1** |
| Update button text on hover fill | `#FFFFFF` on `#333333` | 4.5:1 | **12.63:1** |
| Drop-hint text (text-dim) on grid ground | `#B8B8B8` on `#0A0A0A` | 4.5:1 | **9.98:1** |
| Remove glyph (#FFFFFF) on remove button | `#FFFFFF` on `#B01C1C` | 3.0:1 | **6.93:1** |
| Remove glyph on remove button hover fill | `#FFFFFF` on `#B01C1C` | 3.0:1 | **6.93:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#D92323` on `#111111` | 3.0:1 | **3.79:1** |
| Focus ring on grid ground (non-text) | `#D92323` on `#0A0A0A` | 3.0:1 | **3.97:1** |
| Hover border on grid ground (non-text) | `#D92323` on `#0A0A0A` | 3.0:1 | **3.97:1** |
| Hover border on hover fill (non-text) | `#D92323` on `#1E0808` | 3.0:1 | **3.85:1** |
| Theme-picker row hover/active text (accent-text) on picker hover fill | `#FF5A5A` on `#1E0808` | 4.5:1 | **6.28:1** |
| Theme-picker selected row text (accent-text) on picker active fill | `#FF5A5A` on `#2C0C0C` | 4.5:1 | **5.89:1** |
| Picker / skin search input text (accent-text) on search fill | `#FF5A5A` on `#1E0808` | 4.5:1 | **6.28:1** |
| Rename / hotkey input text (accent-text) on input fill | `#FF5A5A` on `#1E0808` | 4.5:1 | **6.28:1** |
| Search placeholder (text-dim) on search fill | `#B8B8B8` on `#1E0808` | 4.5:1 | **9.68:1** |
| Hotkey recording text (accent-m) on input fill | `#FFFFFF` on `#1E0808` | 4.5:1 | **19.21:1** |
| Update dismiss glyph (text-dim) on update bar | `#B8B8B8` on `#1A1A1A` | 4.5:1 | **8.77:1** |

**Lowest ratio in this theme: 3.79:1 (Focus ring (accent-c) on tile rest (non-text)).** Lowest text ratio: 4.98:1 (Header button glyph on header). Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (mock plates from the gallery, rest ground `#111111`):

| Icon plate (mock) | After fx | Tile ground | Ratio | Needs 3:1 |
|---|---|---|---|---|
| Notepad `#5b7fa6` | `#5480AF` | `#111111` | 4.57:1 | pass |
| Calculator `#6b6f76` | `#696D76` | `#111111` | 3.64:1 | pass |
| Paint `#b07a4f` | `#BA7844` | `#111111` | 5.27:1 | pass |
| Terminal `#3d4450` | `#353E4C` | `#111111` | 1.75:1 | excluded (app art baseline, see 0.1.8) |
| Browser `#4f8a8b` | `#458C8D` | `#111111` | 4.85:1 | pass |
| Files `#c09a3e` | `#CA9D2D` | `#111111` | 7.53:1 | pass |

Lowest non-Terminal icon ratio at rest: **3.64:1** (pass). Terminal is 1.75:1 (mock plate art; the fx does not darken it). On the hover fill `#1E0808`: **3.70:1**; on the pressed fill `#1E0808`: **3.70:1** (both pass).

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex (the header and banner may carry opaque gradients; the lightest stop is the one measured above), so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.


Notes: `--accent-c` is Phantom red `#D92323` (header and banner surface, borders, ring, sliders: 4.0:1 on the ground); `--accent-text` is a light red `#FF5A5A` for small red text on the dark surfaces (values, chip, hotkey, picker rows, title dot, version: 6.0 to 6.5:1); `--accent-m` is **white** (edit label, hotkey error, done, close: the game's edit and warning states are white on dark red, not a second hue). White header-button glyphs on the red header are 5.0:1; the black button border on red is 4.0:1 (non-text). `--tile-hover-bg` and `--tile-active-bg` are `#1E0808` (L 0.0047), the darkest red the Calculator plate tolerates: the audit's `#732424` would put the plate at about 2.0:1, so it appears only as the DONE and CLOSE hover fill (white on it 9:1).

### 7.2 Type (all stock Windows, verified in `C:/Windows/Fonts`)

| Role | Stack | Weight | Size | Tracking | Case |
|---|---|---|---|---|---|
| Body, settings, pickers (`--font`) | `'Segoe UI', Arial, sans-serif` | 400 (base) | base | base | base |
| `#title` | `Impact, 'Arial Black', sans-serif`, `font-style: italic` | 400 (Impact has one weight) | 11 px (base) | 1.5px | uppercase (markup) |
| `.tile-label` | same, italic (`--tile-label-style: italic`) | 400 (`--tile-label-weight`) | 12 px (base) | 0.8px | uppercase |
| `#theme-banner-text` | same, italic | 400 | 11 px (base) | 1px | uppercase strings, as written in 0.8 |

Body text is Segoe UI, not Impact: Impact at 12 px with tracking in the settings panel and the pickers is a dense wall, and the audit only asked for Impact on the title and labels. Impact has no italic face, so `font-style: italic` makes Chromium slant it (about 14 degrees), which is intended (0.3 item 7). Measured: the title is 81 px wide and ends at x 93.7 (art at 168: 74 px clear); labels in Impact 12 px, 0.8 px tracking: NOTEPAD 50, CALCULATOR 70, TERMINAL 53, BROWSER 53 px, inside the 100 px box (the label's 8 px padding leaves 84 px); "SPREADSHEET EDITOR" (115 px) ellipsizes as today. Banner strings end at x 197, 154, 268, 186, 270 and 189 (the text starts at x 62 in this theme). Expected `fontsRendered`: `Impact, Segoe UI`. **Cyrillic:** none in this theme; Impact and Segoe UI contain U+0416 (negative control failed as it should).

### 7.3 Art (redraw). Static, original, inline SVG data URIs; no `clip-path` on the header or banner

Delete: the four current SVGs (dossier, star and roster, grain, metaverse tiles), the readout, header text, edit-bar text, particles, the `#app::after` red glow and vignette (`#app::after { background: none; }`, so no texture), the `#app` border flash, the title glitch keyframes and the hover `tile-glitch` (B1 0.3, 0.5).

**A. Header: red surface, black slab with a sawtooth edge, shards (HZ).**
- `#header { background: url(zig_r) 256px 0 / 10px 40px no-repeat, linear-gradient(#0A0A0A, #0A0A0A) 0 0 / 256px 100% no-repeat, #D92323; border-bottom-color:#0A0A0A; box-shadow: inset 0 -2px 0 #0A0A0A; }`. A black slab from x 0 to 256 with a sawtooth edge from x 256 to 266 (SVG `zig_r`, 10 x 40, stretched with `preserveAspectRatio='none'`: a zigzag of eight points), red everywhere else, and a 3 px black line inside the header (y 37 to 40). The title, the version and the art zone are on black; the four buttons (x 276 to 412) are on red, 10 px clear of the saw. `#header::before { background:#D92323; box-shadow:none; }`.
- **Shards, `#header::after`**: the shared header-art recipe (84 x 20 box, hidden while the chip shows). SVG `shards`, `viewBox 0 0 84 20`: five slanted parallelograms leaning right, alternating Phantom red `rgb(217,35,35)` and white `rgb(245,245,245)`, from x 2 to 84 (window x 170 to 252, all on the black slab, 4 px before the saw). Generic slashes, no mask or star.
- Buttons: `#header-controls button { color:#FFFFFF; border-color:#0A0A0A; } #header-controls button:hover { background:#0A0A0A; color:#FFFFFF; border-color:#0A0A0A; }`; the chip is black: `#filter-chip { background:#0A0A0A; }` (its red border and light-red text come from the base rule).
- `#title { font-family:Impact,'Arial Black',sans-serif; font-weight:400; font-style:italic; letter-spacing:1.5px; color:#FFFFFF; text-shadow:none; } #title .accent { color:#FF5A5A; } #header-version { color:#B8B8B8; }`.

**B. Banner: red surface, black slab with a sawtooth edge, a plain card icon.**
`#theme-banner { background: url(zig_l) 40px 0 / 10px 100% no-repeat, linear-gradient(#0A0A0A, #0A0A0A) right 0 top 0 / calc(100% - 50px) 100% no-repeat, #D92323; border-top:0; gap:26px; }`
- Red from x 0 to 40, a sawtooth edge from x 40 to 50 (SVG `zig_l`, 10 x 44, `preserveAspectRatio='none'`, mirror of the header's), black from x 50 to the right edge. The text starts at x 62 (`gap:26px`; the base is 10 px) so it is on black; the icon is on red 4 px clear of the saw.
- **Icon, SVG `card`, 22 x 22** in `#theme-banner::before` (content '', 22 x 22, `font-size:0`, `opacity:1`): a plain white rectangle tilted -14 degrees, with a black band across its top-left and a red triangle at its bottom-right. A generic card, not the calling card (0.9).
- `#theme-banner-text { font-family:Impact,'Arial Black',sans-serif; font-style:italic; letter-spacing:1px; color:#FFFFFF; }` (19.8:1 on black).

**C. Frame: one red ink burst (top-left band).** `#grid-container { background: url(splat) left 1px top 1px / 10px 10px no-repeat; }`. SVG `splat`, 10 x 10: a spiky red burst `rgb(217,35,35)` (14 points). Window x 1 to 11, y 41 to 51: inside the left band and above the keep-out (y 52). It is decoration only and the only frame art.

**D. Tiles.** Square (`--radius: 0`), fill `#111111`, border `#2E2E2E`, `::before` off. Icon plates are cut on two opposite corners: `--tile-icon-shape: polygon(0 0, 76% 0, 100% 24%, 100% 100%, 24% 100%, 0 76%)` (top-right and bottom-left, 24 percent, the audit's shape enlarged so it shows on rounded plates). Margins from the cut to the mock glyphs, computed (px in the 64 px plate): Notepad 10.4, Calculator 8.2, Paint 11.0, Terminal 6.1, Browser 11.5, Files 8.2; the smallest is 6.1 px and all are positive.
Hover and focus: fill `#1E0808`, border red, `box-shadow: 3px 3px 0 #D92323` (a hard red offset; 3 px is inside the 4 px keep-out and the 8 px gutter), and a **white slanted parallelogram behind the label**: `.tile-label { padding:0 8px; }` always, and on hover and focus `background:#FFFFFF; color:#0A0A0A; clip-path: polygon(5px 0, 100% 0, calc(100% - 5px) 100%, 0 100%);` (black on white 19.8:1). The clip-path is static and on the label only.

**The rules** (everything after `:root`; paste as is; encode SVGs per B1 0.2; the two `zig` images must keep `preserveAspectRatio='none'`):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #B01C1C; }
#app::after { background: none; }

#header {
  background: @SAWR@ 256px 0 / 10px 40px no-repeat, linear-gradient(#0A0A0A, #0A0A0A) 0 0 / 256px 100% no-repeat, #D92323;
  border-bottom-color: #0A0A0A; box-shadow: inset 0 -2px 0 #0A0A0A;
}
#header::before { background: #D92323; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto; width: 84px; height: 20px;
  background: @SHARDS@ no-repeat 0 0 / 84px 20px; pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: Impact, 'Arial Black', sans-serif; font-weight: 400; font-style: italic; letter-spacing: 1.5px; color: #FFFFFF; text-shadow: none; }
#title .accent { color: #FF5A5A; }
#header-version { color: #B8B8B8; }
#header-controls button { color: #FFFFFF; border-color: #0A0A0A; }
#header-controls button:hover { background: #0A0A0A; color: #FFFFFF; border-color: #0A0A0A; }
#filter-chip { background: #0A0A0A; }

#grid-container { background: @SPLAT@ left 1px top 1px / 10px 10px no-repeat; }

.app-tile { background: #111111; border-color: #2E2E2E; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: var(--tile-hover-bg); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.tile-label { font-family: Impact, 'Arial Black', sans-serif; padding: 0 8px; }
.app-tile:hover .tile-label, .app-tile:focus-visible .tile-label, .app-tile:hover .tile-label.renameable {
  background: #FFFFFF; color: #0A0A0A; clip-path: polygon(5px 0, 100% 0, calc(100% - 5px) 100%, 0 100%);
}

#theme-banner {
  background: @SAWL@ 40px 0 / 10px 100% no-repeat, linear-gradient(#0A0A0A, #0A0A0A) right 0 top 0 / calc(100% - 50px) 100% no-repeat, #D92323;
  border-top: 0;
}
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @CARD@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: Impact, 'Arial Black', sans-serif; font-style: italic; letter-spacing: 1px; color: #FFFFFF; }
#theme-banner { gap: 26px; }
```

| Placeholder | Is `url("data:image/svg+xml,...")` of SVG |
|---|---|
| `@SAWR@` | `zig_r` |
| `@SAWL@` | `zig_l` |
| `@SHARDS@` | `shards` |
| `@SPLAT@` | `splat` |
| `@CARD@` | `card` |

**SVG sources** (readable):

**`zig_r`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 40' preserveAspectRatio='none'>
<polygon points='0,0 6,0 2,5 8,10 3,15 9,20 4,25 10,30 5,35 8,40 0,40' fill='rgb(10,10,10)'/>
</svg>
```

**`zig_l`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 44' preserveAspectRatio='none'>
<polygon points='10,0 10,44 2,44 7,38 1,33 6,27 0,22 5,16 1,11 6,5 3,0' fill='rgb(10,10,10)'/>
</svg>
```

**`shards`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'>
<polygon points='2,17 18,2 26,2 10,17' fill='rgb(217,35,35)'/>
<polygon points='24,18 44,3 50,3 32,18' fill='rgb(245,245,245)'/>
<polygon points='40,17 60,6 70,6 54,17' fill='rgb(217,35,35)'/>
<polygon points='58,18 76,1 82,1 66,18' fill='rgb(245,245,245)'/>
<polygon points='68,13 84,4 84,9 74,15' fill='rgb(217,35,35)'/>
</svg>
```

**`card`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<g transform='rotate(-14 11 11)'>
<rect x='3' y='4' width='16' height='14' fill='rgb(245,245,245)'/>
<polygon points='3,4 19,4 19,7 3,13' fill='rgb(10,10,10)'/>
<polygon points='9,18 19,18 19,12 15,16' fill='rgb(217,35,35)'/>
</g>
</svg>
```

**`splat`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'>
<path d='M1 3 L3 3.5 L4 1 L5.5 3 L8 2 L7 4.5 L10 5.5 L7.5 6.5 L8.5 9.5 L6 8 L4.5 10.5 L3.8 7.6 L1 8.2 L2.8 5.8 Z' fill='rgb(217,35,35)'/>
</svg>
```


### 7.4 Motion

| # | Today (infinite) | Element and property | Fate |
|---|---|---|---|
| 1 | `p5-title 8s steps(1)` | `#title` colour, text-shadow (tier 2) | removed |
| 2 | `banner-throb 2.5s` | `#theme-banner::before` transform, opacity (tier 1) | removed |
| 3 | `p5-schematic 8s` | `#grid-container::before` opacity (tier 1) | removed |
| 4 | `p5-readout 8s` | `#grid-container::after` colour (tier 2) | removed |
| 5 | `p5-border 8s steps(1)` | `#app` box-shadow (tier 5) | removed |
| 6 | `p5-metaverse 5s linear` | `#particles` background-position (tier 4) | removed |
| hover | `tile-glitch .5s steps(1) infinite` | `.app-tile:hover::before` background, opacity, transform (tier 4) | removed (`::before` is `display:none`) |

**Before 6 (+1 hover-only), after 0.** `grep -c infinite persona-5.css` is 0. The hover shadow and highlight appear at once through the base 0.12 s transition; `entrance-flash 0.8s` is replaced by `entrance-fade 0.8s`.

### 7.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** `#111111`, border `#2E2E2E`, square, `::before` off, layout unchanged. Icons `contrast(1.1) saturate(1.1)` (no darkening) through the two-corner cut.
- **Hover:** fill `#1E0808`, red border (3.9:1 on the fill), a red 3 x 3 px offset shadow, the white slanted label highlight; no transform, no glow.
- **Selected (focus-visible):** hover plus the base 2 px red ring at offset 2 (4.0:1 on the ground, 3.8:1 on the tile): `.app-tile:hover, .app-tile:focus-visible { background:var(--tile-hover-bg); border-color:var(--tile-hover-border); box-shadow:var(--tile-hover-shadow); }`.
- **Pressed:** base scale 0.96 on `#1E0808`.
- **Label:** white `#F5F5F5`, Impact italic caps, no halo.
- **Filter chip:** black fill, red border, light-red text (6.5:1). The shards hide while it shows.
- **Edit bar:** `#2A0808` fill, **white** rule and label, no quote. `+ FILE` and `+ INSTALLED` have grey borders; `DONE` is white with a white border and a `#732424` hover fill. The tile ✕ is `#B01C1C` and stays so on hover (`.btn-remove:hover { background:#B01C1C; }`, white ✕ 6.9:1).
- **Settings overlay:** opaque `#0A0A0A`, panel `#141414`, light-red values and version, red sliders and checkboxes.
- **Update banner:** white on `#1A1A1A` with a white rule.

### 7.6 Done when

1. `npm run check:contrast` passes, no rebaseline; `grep -c infinite persona-5.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`.
2. Header: red `#D92323` from x 266 rightwards and black from x 0 to 256 with a sawtooth edge between (sample x 100, x 261 and x 300 at y 5); a 3 px black line at y 37 to 40 with nothing below; the five shards inside x 170 to 252 (bounding box at least 70 px right of the title and 4 px before the saw); typing a letter hides them. `#title` right edge at most 100.
3. Banner: red at x 0 to 40, a sawtooth edge at x 40 to 50, black beyond; a white tilted card at x 14 to 36; white Impact italic text starting at x 62, one line (`scrollWidth <= clientWidth` for all six strings).
4. Top-left band: a red burst at window x 1 to 11, y 41 to 51 and nothing else in the frame.
5. Icon plates: a diagonal cut at top-right and bottom-left of every plate in the grid, hover and scrolled shots; no glyph pixel cut (smallest margin 6.1 px, Terminal).
6. Hover shot (CALCULATOR): red border, near-black red fill, a red offset shadow at the right and bottom (3 px), a white parallelogram behind the label with black type; no glow.
7. Settings shot: light-red "64px" and version; edit mode shows white, not a second hue.
8. Hidden-tiles sigma 0.00. No horizontal banding on the Notepad plate.
9. A/B/C probe at the three sizes and the states shot: overlap 0 px, art in keep-out 0 px. Art-off for the probe: hide `#header::after` and `#theme-banner::before`, set `#grid-container { background:none !important; }`, and reduce the surfaces to their slabs: `#header { background: linear-gradient(#0A0A0A,#0A0A0A) 0 0/256px 100% no-repeat, #D92323 !important; }` and `#theme-banner { background: linear-gradient(#0A0A0A,#0A0A0A) right 0 top 0/calc(100% - 50px) 100% no-repeat, #D92323 !important; }` (my run: clearance 3.3 px at 424 x 300, 10.7 px at 640 and 1024; the 0.7 px in the states shot is the last tile row meeting the saw strip). Also type a long filter (14 characters): in my mock the chip then spans x 123 to 251, 5 px before the saw (x 256), and the buttons stay at x 273; it must not reach the saw.
10. `fontsRendered` lists `Impact` and `Segoe UI`.

**Expected squint score: 5.** What survives with the text covered: a red header and a red banner over a black body, black slabs with sawtooth edges, red-and-white slanted shards, square tiles with two cut corners and a red offset shadow on hover, a red burst in the corner. It reads as Persona 5 at a glance; the family reads as Atlus next to persona-4's yellow (batch 1).

---

## 8. Fonts that would lift this batch (for Sergei's morning decision; nothing downloaded, nothing used)

Rule: this batch uses stock Windows fonts only (audit C2). Every font below is free-licensed; licence and Cyrillic coverage are from Makoto's font licence check (`Team/Research/QuickLaunch_ThemeReferences_2026-09-29.md`, checked against the google/fonts repository on 2026-09-29; DSEG is not on Google Fonts). File names and sizes are not in that table and I downloaded nothing, so Ender reads them from the repository page after Sergei says yes. Each bundling needs Sergei's per-file OK and the OFL text must ship with any redistributed file. Ranked by how much the batch gains:

| Rank | Font | Licence | Cyrillic | Theme it lifts | What it replaces | Expected gain | Source |
|---|---|---|---|---|---|---|---|
| 1 | Dela Gothic One | SIL OFL 1.1 | yes | akira (and promise-mascot, batch 1 rank 1) | Arial Black title, Arial Bold labels and the Yu Gothic tag | High for akira: the film's huge red lettering; it covers kana and kanji, so the tag and a katakana title are one face. One file also lifts batch 1's top theme | https://github.com/google/fonts/tree/main/ofl/delagothicone |
| 2 | Oswald | SIL OFL 1.1 | yes | persona-3 (batch 6 LCARS alternative) | Bahnschrift SemiCondensed | Medium: the tall, narrow menu lettering; Bahnschrift is close but wider and not truly condensed in Chromium (0.2 item 3) | https://github.com/google/fonts/tree/main/ofl/oswald |
| 3 | Reggae One | SIL OFL 1.1 | yes | yakuza | Impact title and the Yu Gothic kanji icon | Medium: brush-cut Japanese display caps for 龍 and the title (Rampart One is the alternative, also Cyrillic) | https://github.com/google/fonts/tree/main/ofl/reggaeone |
| 4 | Cormorant Garamond | SIL OFL 1.1 | yes | parasite-eve | Palatino Linotype | Medium: a light white serif is what Makoto recalls for the logo (unverified); Palatino is one step away | https://github.com/google/fonts/tree/main/ofl/cormorantgaramond |
| 5 | DSEG (7- and 14-segment) | SIL OFL 1.1 from the current releases (older ones used an original licence; download a current one) | not checked | nonary-games | the drawn seven-segment 9 (an SVG), and Consolas for numerals | Low to medium: a real LCD face would let the banner show live digits; today the LCD is a drawing | https://github.com/keshikan/DSEG and https://www.keshikan.net/fonts-e.html |
| 6 | Anton | SIL OFL 1.1 | no | persona-5 | Impact | Low: Impact is within one step; the game's caps are slanted and Impact italic already gets that | https://github.com/google/fonts/tree/main/ofl/anton |
| 7 | Zen Kurenaido | SIL OFL 1.1 | yes | siren | Segoe UI | Low: hand-brush warning lettering for the tag and banner; the theme already reads through its split header and red water | https://github.com/google/fonts/tree/main/ofl/zenkurenaido |

No font is needed for parasite-eve, nonary-games or siren to reach their squint scores. If Sergei approves only one file, take **Dela Gothic One** (it changes the most visible pixels in batch 2 and it is also batch 1's first choice, so it pays twice); if two, add **Oswald** (persona-3) or **Reggae One** (yakuza). Cinzel, Bebas Neue and Rajdhani from the earlier lists are not needed here.

---

## 9. Summary

- **Seven sections written**, one per theme, each with a final `:root` block, computed contrast tables (gate, add-on and generic roles), icon checks on rest, hover and pressed fills, type with measured widths, art as exact shapes with coordinates plus the rules block and every SVG source, a motion inventory, tile, hover, selected, filter and banner rules, a "Done when" list and an expected squint score. A batch-level section (0) points to batch 1 for every shared rule and records the new ones.
- **Infinite animations: 42 to 0** (akira 6, yakuza 6, parasite-eve 6, nonary-games 6, siren 6, persona-3 6, persona-5 6; three more hover-only infinite animations also go). No animation of any kind is left; no `will-change`; the only motion is the base 0.12 s tile transition and the one-shot entrance fade.
- **Contrast:** every pair clears its threshold. Lowest text pair **4.88:1** (yakuza, the recording-state hotkey text on its fill; needs 4.5). Lowest non-text pair **3.34:1** (yakuza, the crimson focus ring on the tile fill; needs 3). Lowest icon ratio **3.22:1** (persona-3, Calculator plate on the hover fill; needs 3). Lowest gate margin: yakuza `--accent-c` 3.60:1, then siren 3.72:1. Siren leaves the legacy list. The real gate script, run on the seven prototype files, reported 0 errors.
- **Type:** stock fonts only; three Japanese runs (ネオ東京, 龍, 屍人) in Yu Gothic Bold with an MS Gothic fallback, glyph coverage verified against controls; every Cyrillic tile name falls to a Cyrillic-covering face.
- **Overlaps:** none by construction and none measured: the A/B/C probe on my mock window read 0 px overlap and 0 px of art in the keep-out at 424 x 300, 640 x 420 and 1024 x 700 and in the chip, edit-bar, update-bar and focus-ring states; smallest art-to-content clearance 2.7 px (parasite-eve, nonary-games with the focus ring on).
- **Banner lines:** 27 lines across the seven, each checked on the web against Wikiquote, TV Tropes, Wikipedia or TheGamer's list (0.8); three are studio-composed labels and marked; the dropped lines are listed with reasons.
- **Squint (expected, title and banner text covered):** akira 4, yakuza 4, parasite-eve 4 (least sure), nonary-games 4, siren 4, persona-3 4, persona-5 5.
- **Bugs and facts found on the way (not fixed, not in this batch's scope):** in Chromium 154 `font-stretch: 75%` renders the same SemiCondensed face as `87.5%`, so true Condensed is unreachable (batch 1 used 75% in cyberpunk and dead-space; both still render fine); batch 1's promise-mascot hover Calculator plate measures 2.99:1 in Ender's own metrics (a hair under 3, textured); the audit's settings-overlay cut-off (audit section 9) still applies to all seven.

---

## 10. Open items (things I could not resolve or verify here)

Nothing was launched in QuickLaunch. Each item has a verify step above; none blocks implementation.

1. **Mock window, not Electron.** All measurements (widths, sigma, probe, squint sheets) come from headless Edge 154 with the real `base.css`, `index.html` and the gallery's mock tiles. Chromium 154 is not Electron 32: sub-pixel text, filter rounding and `feTurbulence` grain can differ by a little. Ender's numbers win over mine, and the after-run reports them. The mock reproduced batch 1's shipped persona-4 frames, which is why I trust its layout; I did not compare pixel values.
2. **Bahnschrift width.** Only persona-3 depends on `font-stretch`. It uses 87.5% (proven in batch 1) and has a stated fallback (6.2). Yakuza and nonary-games use normal width on purpose.
3. **Siren grain sigma** is specified with a starting recipe and a tuning rule (5.3): my mock read 2.48 (target 2.0 to 3.0, cap 3.0, batch ceiling 3.94). Ender's Electron number decides.
4. **Japanese fonts.** Yu Gothic Bold is a stock font on this machine and on current Windows 10 and 11; if a machine lacks it the stack falls to MS Gothic (regular weight, synthetic bold) and then to any CJK face, and the kanji shapes may change slightly. No layout depends on the exact glyph width (each run has at least 4 px spare).
5. **Banner lines.** akira's tagline `NEO-TOKYO IS ABOUT TO E.X.P.L.O.D.E.` is a real, official-store tagline; the dotted spelling is confirmed by a film-stills post and by the film's fan use, not by Wikiquote (medium-high). Three lines are studio-composed labels (parasite-eve `Carnegie Hall. December 24th, 1997.`, siren `Hanuda Village.` and `Sightjack.`); siren has only one real in-game string. nonary-games' third line is a late-game line (mild spoiler). persona-3 ends up with three lines because two real lines (Pharos, and the Fruit of Knowledge line) are too long for the moon layout; akira's Wikiquote tagline is reserved for the same reason. Jane: flag the studio labels to Sergei with batch 1's promise-mascot labels.
6. **Evoke, not reproduce.** akira's capsule, nonary-games' LCD nine, persona-5's shards and card, persona-3's clock and moon and yakuza's kanji and dragon are original generic drawings (0.9). The one judgement call is the LCD seven-segment 9 (0.9 and 4.3): a one-line SVG change if Sergei prefers an empty box.
7. **Real icons vs cut plates.** persona-5's two-corner 24 percent cut clears every mock glyph by at least 6.1 px, but a real app icon whose art reaches its corner loses a small triangle at top-right and bottom-left. If Sergei notices, drop the cut to 18 percent or to `none`; the theme still reads through its surfaces.
8. **Header art under the settings and picker overlays** is hidden by the opaque overlay in every theme (the overlay is at z 300); I did not test the skin-picker list open beyond the mock's settings view. Ender's verification set (B1 0.8) covers it.
9. **Batch 1 observation for Jane (not a batch 2 item).** promise-mascot's hover Calculator plate measures 2.99:1 in Ender's final metrics (spec 3.10 before texture). It is a mock plate and a hair under 3; if Sergei wants it exact, lower the grain coefficient one more step or darken the hover fill by a few levels.
10. **`THEME_BANNERS` comment in `app.js`** ("3 per theme") is stale (batch 1 watch item 1); this batch's entries are 5, 4, 3, 3, 3, 3 and 6 lines. Only the seven keys named in section 0.8 change.
11. **Settings overlay cut-off** (audit section 9, item 1) is unchanged and applies to every theme here; the settings "Done when" items are limited to what the 424 x 300 crop shows.


---

## 11. Review 1 (2026-09-30)

Judy, red-team of Ender's batch 2 implementation (7 theme CSS files, `app.js` banner entries, one batch 1 file, uncommitted, branch `wip/theme-fidelity`). Read: `compare-b02/` (the batch sheet and the 7 per-theme sheets: grid, settings, hover), the raw `after-b02` shots, all `review-b02/` shots (chip visible, scrolled one row, states, 2x header bands, the persona-5 chip series, the two 640 x 420 focus-ring crops), `theme-metadata.csv`, the git diff (`app.js`, `promise-mascot.css`, the plan doc), and the seven CSS files against my prototypes. I also cut my own zoom crops and made a squint sheet from Ender's real renders (title and banner text painted over, 1.6 px blur; tile labels left visible, as in B1 12.2). Nothing launched in QuickLaunch. The mock-window previews for the fixes below were rendered in headless Edge with `--user-data-dir` set to `judy/profile` (my earlier mock renders, before this rule reached me, ran headless Edge with no profile flag; every run since uses it). Only this file was written in the repo tree.

**Where this review contradicts sections 1 to 10, this review wins.**

Ender's implementation is faithful: after stripping comments and whitespace, **all seven CSS files are line-for-line identical to my tested prototypes** (0 differences), the seven `THEME_BANNERS` entries match section 0.8 exactly and no other key changed, `loopingAnimationsAtCapture` is 0 for all seven (was 6), the gate is clean. What is left is one defect (siren's tag renders thin in Electron), three squint scores of 3 that the real renders earn (so three signature lifts), one geometry finding at windows without a scrollbar (the stop item), and a short list of watch items.

### 11.0 Verdict per theme

Squint = title and banner text covered, blurred (`rv/squint_b02.png` in my scratchpad); would a fan name the franchise from what is left? "Now" is Ender's real render. "After" is my expectation once the fixes below are in (needs the re-look in 11.6).

| Theme | Verdict | Squint now | After | Fix IDs |
|---|---|---|---|---|
| akira | ship-ready | 4 | 4 | none |
| yakuza | ship-ready (stop item accepted, 11.1) | 4 | 4 | none |
| parasite-eve | fix then ship | 3 | 4 | F3 |
| nonary-games | fix then ship (stop item accepted, 11.1) | 3 | 4 | F4 |
| siren | fix then ship | 3 | 4 | F1 F2 |
| persona-3 | ship-ready | 4 | 4 | none |
| persona-5 | ship-ready | 5 | 5 | none |

**Fix count: 4** (F1 to F4; F1 is a defect, F2 to F4 are signature lifts from the squint test). Three doc corrections (11.5) and one deferred item (D1, fonts) are not counted. No theme needs rework.

**Re-look needed: yes**, for F1 to F4 (they change pixels I have not seen in Electron). List in 11.6.

### 11.1 Ruling on the stop item: **accept the 1 px until Foundation lands; no per-theme change now**

**The finding is real, and it is my miss.** With no scrollbar (640 x 420 and 1024 x 700 with the 14 mock tiles) the last tile column ends at W-16 and its focus ring at W-12. Yakuza's blue strip starts at W-13 (x 627 at 640) and nonary-games' right streak ink at W-13: 1 px inside the ring zone. With a scrollbar (the default 424 x 300, and any library long enough to scroll) both are 3 px clear, which is the only case I measured with the ring on: my probe ran the focus-ring state at 424 only, and sections 2.3 B and 4.3 B say "3 px" without saying "with a scrollbar".

**Why accept.**
1. **What is touched:** only the focus ring, and the ring is drawn on top of the art. No label, chip, button or tile is covered; the art covers nothing. Ender's 4x crops show a red ring next to a blue strip and next to a rust streak, nothing lost.
2. **The alternatives cost more.** For 6 px art a fixed `right` offset clears both zones only at `right 5px`, by 1 px on each side. That would take yakuza's strip from 3 px clear to 1 px clear **next to the scroll thumb in the default 424 x 300 view**, the view Sergei sees every day, to fix a view he sees only when his library is short. Bad trade.
3. **Foundation removes the problem for every theme at once, with no theme change.** I tested `#grid-container { scrollbar-gutter: stable }` with the 4 px custom scrollbar in Chromium 154: at 640 x 420 the last column's right edge moves from 624 to 620, at 1024 x 700 from 1008 to 1004, that is W-20, identical to the 424 case (404). `scrollbar-gutter` has shipped since Chromium 94, so Electron 32 (Chromium 128) has it. With the gutter, the 3 px numbers in sections 2 and 4 hold at every size.

**Conditions.**
- **Foundation acceptance check:** after the gutter lands, re-run the focus-ring probe on the last column of yakuza and nonary-games at 640 x 420 and 1024 x 700; expected clearance 3 px (yakuza strip to ring), 3 px (nonary streak ink to ring), 2 px to the scrollbar.
- **Same arithmetic for batch 1** (I read the offsets; I did not render batch 1 at 640): gryffindor's inner right rule (`right 11px`) touches the ring zone's edge and shire's right plank (`right 5px`, 10 px wide) sits inside it at sizes without a scrollbar, so the same gutter helps them. The Foundation check should include both.
- **If Foundation does not adopt the gutter**, the 1 px stays accepted for batch 2 (do not spend on it) unless Sergei objects. The ready fallback: yakuza's blue strip 4 px wide at `right 6px` (2 px clear of the ring zone and of the scrollbar at every size; the sign is 2 px thinner than the pink one, so shrink the pink to 4 px at `left 4px` for symmetry), and nonary-games' `streakR` ink moved into tile x 4 to 9 at `right 5px` (1 px clear of the ring zone, 2 px of the scrollbar). One small ticket, no other theme affected.

### 11.2 Squint test: what a fan still sees with the title and banner text covered

The layout is fixed (header, grid, banner), so identity comes from colour, shape language, texture and one motif. Ratings and reasoning, from Ender's real renders:

| Theme | Now | What survives the squint | What is missing |
|---|---|---|---|
| akira | 4 | Ink-violet field, two capsule-red rules, a white-and-red pill twice, red katakana, a flat grey strip carrying a black skyline with a red sun | The film's huge red lettering; needs the approved Dela Gothic One (D1) |
| yakuza | 4 | Crimson-and-gold trim top and bottom, a gold dragon, a gold 龍, pink and blue sign strips down both edges | Nothing that stock fonts can add. The right strip beside the real scroll thumb can read as a second scrollbar (W1) |
| parasite-eve | 3 | Navy window UI with red rules, two small red ovals, a night skyline on a lit horizon, a wireframe sphere | Reads as "PS1 RPG, night city". The header ovals read as sausages (a wave line is not a cristae fold) and carry little flesh red. **F3** |
| nonary-games | 3 | A warm brown field, a steel line, a rivet row, a dim hatch, a small grey box with a 9 | "Industrial brown UI"; the one franchise cue (the LCD 9) is 22 px and pale on a brown strip. **F4** |
| siren | 3 | A two-tone header split by a bright seam, band lines, a red banner with a wave edge, a cold hover | The red water is the only strong cue and it is 44 px tall; the tag is thin; the icon is a 22 px horn. **F1, F2** |
| persona-3 | 4 | Cold navy, a slanted blue block, a clock and slanted bars, a crescent and a big pale moon | The tall menu lettering and the huge hollow numerals (section 8) |
| persona-5 | 5 | A red header and red banner over black, black slabs with sawtooth edges, slanted red-and-white shards, cut icon corners, a red burst | Nothing; it reads as Persona 5 and, next to batch 1's persona-4, as the same family |

### 11.3 Exact fix list for Ender

Rule for every item: change only what is listed; SVG below is written readable (`rgb()` colours, straight quotes); encode as B1 0.2 says. No new animation (`grep -c infinite` stays 0 for all seven). `npm run check:contrast` is unaffected (none of these touches a gate variable), but re-run it. No `--rebaseline`. I built each fix in the mock and ran the real gate on the three changed files (0 errors) and the A/B/C probe on them (overlap 0 px, art in keep-out 0 px at 424 x 300, 640 x 420 and 1024 x 700 and in the states shot; smallest art-to-content clearance: parasite-eve 2.7 px, nonary-games 2.7 px with the focus ring on the first tile, siren 4.0 px in the default state; siren's 1.3 px in the states shot is the last tile row meeting the wave strip, as in section 0.4). Reference files: `judy/rv/proto2/{siren,parasite-eve,nonary-games}.css` and `judy/rv/proto2/p2_*-{grid,hover}.png` in the session scratchpad (this text wins).

**F1. siren: the two-glyph tag renders thin in Electron; make it solid.** In `#header::after`, delete `background: linear-gradient(90deg, #E0C8A0 0 50%, #A9C0D8 50% 100%);` and the line `-webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;`, and add `color: #DCCFB8;` (10.4:1 on the warm half `#2C1F14`, 10.3:1 on the cold half `#132435`). The glyphs keep their positions (屍 left of the seam, 人 right of it). Cause: in the real render the clipped-gradient run paints with about 1 px stems where akira's plain-colour tag (same font, 11 px) paints about 1.7 px. The warm and cold glyph colours are given up; the header split, the seam and the position carry the two-channel idea. Done when: at a 3x crop the stems of 屍 and 人 are at least 2 device px thick at 1.5x (they are about 1 now), both glyphs pale, neither touching the seam (x 209 to 211).

**F2. siren: a real siren tower at the banner's right end, and a tuning-dial icon.** Two changes.
- Replace the banner rule with `#theme-banner { background: @TOWER@ right 8px bottom 0 / 50px 44px no-repeat, linear-gradient(#170C0C, #4C1015); border-top: 0; }` and add SVG `tower` (50 x 44, below): an air-raid siren mast with two flared horns and sound arcs, pale sepia `rgb(232,214,188)` (10.6:1 on `#4C1015`) with dark-red `rgb(76,16,21)` lattice and horn rims. It lands at banner x 366 to 416, flush with the bottom. The longest siren string ends at x 243, so at least 120 px clear. A generic mast: no Shibito art, no logo.
- Replace the content of SVG `horn` (the banner icon, `@HORN@`, 22 x 22) with the `dial` below: a sightjack tuning dial (rim, nine ticks, a needle), pale `rgb(240,224,200)`. The horn moves to the right end as the tower, so the two would otherwise repeat.
Done when: the tower reads as a two-horn siren mast in the banner shot at 1x, bottom-flush at x 366 to 416; the dial icon at x 14 to 36; text unchanged and on one line; A/B/C probe with `#theme-banner { background: linear-gradient(#170C0C,#4C1015) !important; }` added to siren's art-off list: overlap 0 px.

**F3. parasite-eve: one clear mitochondrion in the header art zone.** Replace the content of SVG `mito` (two ovals) with the one below: a single large oval, dark flesh fill `rgb(118,24,42)`, a 1.5 px flesh-pink outline `rgb(238,140,152)` (5.3:1 on the header), an inner membrane ellipse (0.9 px) and ten alternating cristae folds (1 px), the textbook mitochondrion. It spans x 2 to 82 of the box (window x 170 to 250) and y 1.1 to 18.9 (window y 11 to 29). Nothing else changes. Done when: the header shows one flesh-red oval with visible cristae folds at 1x; typing a letter hides it; it is at least 30 px right of the title (which ends at x 139).

**F4. nonary-games: a larger LCD icon.** Replace SVG `lcd` (22 x 22) with the 34 x 24 below (same colours, same seven-segment 9, drawn 1.5 times larger) and change the banner icon rule to `#theme-banner::before { content:''; width:34px; height:24px; font-size:0; opacity:1; background: @LCD@ center / 34px 24px no-repeat; }`. The text now starts at x 58 (`gap` stays 10 px); the longest string (314 px) ends at x 372, inside the 410 px box. Done when: a pale LCD box with an ink 9 at banner x 14 to 48, all three strings on one line (`scrollWidth <= clientWidth`); the judgement call in 0.9 still applies (an empty box is the one-line alternative).

**SVG sources for F2 to F4:**

**`mito`** (F3, replaces the two-oval version)
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'><ellipse cx='42' cy='10' rx='40' ry='8.4' fill='rgb(118,24,42)' stroke='rgb(238,140,152)' stroke-width='1.5'/><ellipse cx='42' cy='10' rx='36.4' ry='5.6' fill='none' stroke='rgb(238,140,152)' stroke-width='0.9'/><path d='M14.0 6.4 V11.6 M20.5 14.5 V9.3 M27.0 4.9 V10.1 M33.5 15.4 V10.2 M40.0 4.4 V9.6 M46.5 15.6 V10.4 M53.0 4.7 V9.9 M59.5 14.9 V9.7 M66.0 5.8 V11.0 M72.0 13.2 V8.0 ' fill='none' stroke='rgb(238,140,152)' stroke-width='1' stroke-linecap='round'/></svg>
```

**`lcd`** (F4, replaces the 22 x 22 version)
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 24'>
<rect x='1' y='1' width='32' height='22' rx='4' fill='rgb(200,208,184)' stroke='rgb(20,16,13)' stroke-width='1.6'/>
<g fill='rgb(20,16,13)'>
<rect x='11.5' y='4.6' width='11' height='2.4'/>
<rect x='21.6' y='6.4' width='2.4' height='5.4'/>
<rect x='21.6' y='12.4' width='2.4' height='5.4'/>
<rect x='11.5' y='17' width='11' height='2.4'/>
<rect x='10' y='6.4' width='2.4' height='5.4'/>
<rect x='11.5' y='10.8' width='11' height='2.4'/>
</g>
</svg>
```

**`dial`** (F2, replaces the content of `horn`)
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'><circle cx='11' cy='11' r='9' fill='none' stroke='rgb(240,224,200)' stroke-width='1.5'/><path d='M4.6 17.4 L6.5 15.5 M2.2 12.8 L4.7 12.2 M2.7 7.6 L5.1 8.6 M6.0 3.5 L7.4 5.7 M11.0 2.0 L11.0 4.6 M16.0 3.5 L14.6 5.7 M19.3 7.6 L16.9 8.6 M19.8 12.8 L17.3 12.2 M17.4 17.4 L15.5 15.5 ' stroke='rgb(240,224,200)' stroke-width='1.1' fill='none'/><path d='M11 11 L13.3 4.8' stroke='rgb(240,224,200)' stroke-width='1.6' stroke-linecap='round'/><circle cx='11' cy='11' r='1.6' fill='rgb(240,224,200)'/></svg>
```

**`tower`** (F2, new; placeholder `@TOWER@`)
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 44'>
<path d='M22 44 L24 15 H26 L28 44 Z' fill='rgb(232,214,188)'/>
<path d='M23.4 40 L26.6 31 M26.6 40 L23.4 31 M23.8 29 L26.2 22 M26.2 29 L23.8 22' stroke='rgb(76,16,21)' stroke-width='1'/>
<path d='M24 13.5 L8 6 V22 L24 18.5 Z' fill='rgb(232,214,188)'/>
<path d='M26 13.5 L42 6 V22 L26 18.5 Z' fill='rgb(232,214,188)'/>
<path d='M11 8.2 V19.8 M39 8.2 V19.8' stroke='rgb(76,16,21)' stroke-width='1.2'/>
<path d='M4.6 10 Q1.8 14 4.6 18 M1.4 8 Q-1.4 14 1.4 20 M45.4 10 Q48.2 14 45.4 18 M48.6 8 Q51.4 14 48.6 20' fill='none' stroke='rgb(232,214,188)' stroke-width='1' stroke-opacity='0.8'/>
<rect x='22' y='12' width='6' height='4' fill='rgb(232,214,188)'/>
</svg>
```

### 11.4 Things I checked and found fine

- **Fidelity to the spec:** the CSS diff (above), the banner strings, the gate, the zero loops, and the `:has()` hide rule in all seven (the 2x chip crops show the art gone and the chip alone; siren's seam also hides).
- **Overlap in every state I was given:** no art under a label, chip or button in the chip, edit, update, focus and scrolled shots; the seven scrolled shots are clean under the header line and the scrollbar thumb is untouched. (Siren's band lines show only in the gaps between partly scrolled tiles, which reads a little busy: W4.)
- **Header art and type:** titles end well before the art (my mock's figures: akira 132, yakuza 112, parasite-eve 139, nonary-games 121, siren 128, persona-3 123, persona-5 94; the Electron shots agree by eye); the Japanese glyphs render in a Japanese face in akira's tag, yakuza's icon and siren's tag.
- **Persona-5:** the sawtooth slabs, shards, the two-corner icon cut (Notepad and Files visibly cut at top-right and bottom-left, no glyph pixel lost), the white slanted label highlight and the red hard shadow are as specified; black button borders on red read. The long-filter chip series: at 14 characters the chip ends 5 px before the saw; at the 160 px maximum it overlaps the sawtooth by about 2 px and sits 8 px from the first button, drawn on top, still readable (accepted, W3).
- **Persona-3:** the SemiCondensed face took effect (title and labels measure as the spec said), the slanted highlight is not clipped by the ring, the moon is cropped as designed and clear of the text.
- **Akira, yakuza:** the capsule pill fits CALCULATOR; yakuza's gold header line is there under the crimson (row y 39 reads `rgb(212,168,59)`); the dragon reads as a dragon at 1x.
- **Parasite-eve:** at 6x the valance is a proper scalloped curtain with folds and a gold top line; at 1x it is a thin red-and-gold fringe. Acceptable (W5).
- **Nonary-games:** rivets sit inside the top band, the streaks stay off the tile field at 424.
- **`promise-mascot.css` (the one batch 1 file Ender touched):** the diff is one line: the grain alpha coefficients 0.104 and -0.028 became 0.0793 and -0.02135 (x 0.76). That is the fix I flagged as open item 9, and the hover Calculator plate now reads 3.016:1. **Accepted.** Consequence for the ceiling: promise-mascot's sigma should drop to about 3.0 (3.94 x 0.76); siren's 2.48 stays under it and gryffindor's 2.92 is a hair under. Ender: please report the new promise-mascot sigma so the ceiling is a measured number.
- **`Docs/QuickLaunch_ThemeFidelity_Plan_2026-09-29.md`:** now records Sergei's morning rulings (batch 1 approved; promise-mascot to a light paper look; fonts "all", the seven listed files approved; release once at the end; base-layout fixes first). Nothing in batch 2 conflicts. Dela Gothic One is one of the approved files (D1).

### 11.5 Corrections to sections 0 to 10 (my errors)

- **C1. `fontsRendered` cannot see pseudo-element text.** The Done-when items that say `fontsRendered` lists `Yu Gothic` (akira 1.6 item 9, yakuza 2.6 item 9, siren 5.6 item 10) cannot pass: the gallery samples DOM text nodes, not `::before` and `::after` content. The metadata reads `Arial Black + Arial`, `Impact + Bahnschrift` and `Segoe UI Semibold + Segoe UI`, as expected without it. Verify the Japanese runs visually at a 3x crop instead (done above).
- **C2. Right-band clearances.** Sections 0.4, 2.3 B, 2.6 item 3 and 4.3 B state 3 px to the focus ring as if at every size; it is 3 px with a scrollbar and 1 px inside the ring zone without one (11.1). My probe did not run the ring at 640 x 420 or 1024 x 700.
- **C3. Sections 5.3 A and 5.6 item 2** (two colours in the siren tag) are superseded by F1.

### 11.6 Re-look and done-when

I need to see the images again for F1 to F4, because they change pixels I have only seen in a mock. Please regenerate and send:
1. The compare sheets and raw grid, hover and settings shots for siren, parasite-eve and nonary-games (the other four are unchanged and need nothing).
2. A 3x crop of siren's header band (the solid tag beside the seam), and 3x crops of siren's banner right end (the tower) and left end (the dial).
3. The chip-visible and scrolled-one-row shots for siren and parasite-eve (the tower and the new header oval must not touch a tile, label or the chip).
4. `npm run check:contrast` (no `--rebaseline`), `grep -c infinite` for the three files (0), and the A/B/C probe on the three at the three sizes plus the states shot.
5. `loopingAnimationsAtCapture` for the three (0).

What I will check: F1 stems and colour; F2 tower recognisable and clear of text, dial legible, banner still one row of text; F3 one oval with visible folds, hidden by the chip, nothing on the title; F4 LCD box bigger, 9 legible, text on one line. Then a re-rate on the squint scale. The stop item is closed as above and needs no re-look now; it needs the Foundation check (11.1).

### 11.7 Flags for Jane and Sergei

1. **D1 (deferred, not counted): akira in Dela Gothic One.** Sergei's approval covers this face. Once the font bundling lands and the family is registered, set akira's `#title` to `'Dela Gothic One', 'Arial Black', ...` and the `#header::after` tag to `'Dela Gothic One', 'Yu Gothic', ...` (it has kana and kanji), weight 400, then re-measure: the title must end by x 156 and the tag must fit its 50 px content box; the label and banner faces stay Arial Bold. Expected effect: akira from 4 toward 5 (the film's heavy red lettering). I did not spec numbers because the face is neither installed nor bundled yet, so I could not measure it. None of the other six themes uses a face on the approved list.
2. **Watch items, not fixes:**
   - **W1.** Yakuza's blue sign strip sits 3 px from the real scroll thumb at the default size and can read as a second scrollbar; if Sergei says so, narrow it (the 11.1 fallback) or drop the right strip.
   - **W2.** Persona-5's focus ring (2 px, offset 2) plus the red 3 px offset hover shadow read as nested frames at the bottom-right; heavy but on-style.
   - **W3.** Persona-5's longest filter chip touches the sawtooth by about 2 px, on top; extreme filters only.
   - **W4.** Siren's top band: the first band line sits 2 px under the red rule and the three lines read as a stack of stripes; if it feels busy, start the lines at container y 5.
   - **W5.** Parasite-eve's valance is a fringe at 1x; it cannot grow (the header buttons start at y 8).
   - **W6.** Persona-5's two-corner cut will trim real icons whose art reaches its corners (open item 7 stands).
3. **Not seen by me:** the 640 x 420 and 1024 x 700 grids (I have only the two focus-ring crops), edit-mode tile ✕ buttons, the skin picker list open, the empty-library drop hint. I rely on Ender's probes for those; none of F1 to F4 touches them.
4. **Stop item, one line for the log:** accepted as 1 px, deferred to Foundation's `scrollbar-gutter: stable`, which I verified works with the 4 px scrollbar; the fallback is ready; batch 1's gryffindor and shire right-hand art benefits from the same fix and belongs in the Foundation check.


---

## 12. Review 2 (2026-09-30)

Judy, re-look at Ender's F1 to F4 (siren, parasite-eve, nonary-games). **Verdict: all seven themes are ship-ready. No fix is required.** Every item in 11.3 is implemented as specced and I found no new real defect. Details below; the notes at the end are watch items, not fixes.

**What I looked at.** `compare-b02r2/` (the batch sheet and the siren, parasite-eve and nonary-games sheets), all 16 `review-b02r2/` files (siren header, tag and seam at 3x, banner tower and dial at 3x, chip and scrolled shots with 3x headers, states shots; parasite-eve header band and chip and scrolled shots with 3x headers and states; the nonary-games LCD at 3x), the raw `after-b02r2` shots, and a squint sheet I cut from the three new real renders (title and banner text painted over, blurred). I also re-read the working tree. Nothing launched in QuickLaunch.

**What I checked in the code (read-only).**
- After stripping comments and whitespace, the seven CSS files in the working tree have **0 differences** from my prototypes: the three changed files against `judy/rv/proto2/`, the other four against the round-1 prototypes. So akira, yakuza, persona-3 and persona-5 are unchanged since Review 1 and their verdicts stand without a re-look.
- `grep -c infinite`: 0 in all seven.
- `app.js`: the seven banner entries are as in 0.8 (the diff is still 56 changed lines, all in the seven keys).

**Item by item.**

| Item | Result | Evidence |
|---|---|---|
| F1 siren tag solid | pass | At 3x, 屍 and 人 are solid pale glyphs with clearly heavier strokes than Review 1's thin clipped-gradient run, both clear of the seam (x 209 to 211); colour `#DCCFB8` on both halves |
| F2 siren tower and dial | pass | The tower reads as a two-horn siren mast with sound arcs and a lattice base, pale on the red water, bottom-flush at the banner's right end and at least 120 px from the text; the dial icon (rim, ticks, needle) is legible at x 14 to 36; banner text still on one line in the grid, scrolled, chip, edit and update shots; the tower does not touch a tile in the states shot |
| F3 parasite-eve mitochondrion | pass | One flesh-red oval with visible inner membrane and cristae folds in the art zone; it hides while the chip shows (3x chip crop: chip alone); nothing on the title; scrolled shot clean |
| F4 nonary-games LCD | pass | A bigger pale LCD box with a bold ink seven-segment 9 at banner x 14 to 48; all three strings on one line; the rust drip edge and text are untouched |

**Squint scores after the fixes** (title and banner text covered; the other four are unchanged from Review 1):

| Theme | Verdict | Squint | What carries it now |
|---|---|---|---|
| akira | ship-ready | 4 | Capsule-red rules, a white-and-red pill twice, red katakana, a grey strip with a skyline and a red sun |
| yakuza | ship-ready | 4 | Crimson-and-gold trim, a gold dragon and kanji, pink and blue sign strips on both edges |
| parasite-eve | ship-ready | 4 | A big flesh-red mitochondrion in the blue window header, a skyline on a lit horizon, a wireframe range dome, red rules |
| nonary-games | ship-ready | 4 (the weakest 4 of the seven) | Rust-brown field, rivet row, a dim hatch, and a clearly readable LCD box with a 9 |
| siren | ship-ready | 4 | A warm and a cold header half split by a bright seam with a solid two-glyph tag, a red-water banner with a wave edge, a siren tower and a tuning dial |
| persona-3 | ship-ready | 4 | Cold navy, a slanted blue block, clock and slanted bars, crescent and full moon |
| persona-5 | ship-ready | 5 | Red header and banner with black sawtooth slabs, slanted shards, cut icon corners |

Nonary-games is the one to watch: its 4 rests on the LCD 9 alone, at 34 x 24 px on a brown strip. If Sergei finds it still faint, the lever is a bundled seven-segment face (section 8, DSEG) or the big round door I rejected in Review 1; neither is needed now.

### 12.1 Rulings

**The 0.6 px on parasite-eve is acceptable.** The "at least 30 px right of the title" line in F3's done-when was a comfortable margin I picked, not a rule. The rule is B1 0.2: the title must end by x 156 and the art box starts at x 168, at least 12 px. Ender measures the mitochondrion's outline at 29.4 px from the title's box edge and 32 px from the last letter's ink (the title box includes 3 px of trailing letter-spacing, so the ink gap is the real one). It clears the 12 px rule by more than double, so a 0.6 px miss against an example figure is not a defect. Nothing to change.

**promise-mascot's sigma of 3.72 is accepted as the ceiling.** My estimate of "about 3.0" scaled the whole texture by the grain coefficient and forgot the halftone; Ender's measurement (2.97 with the grain off, so the halftone carries most of it) is the truth and the ceiling is now a measured **3.72**. Batch 2's only textured theme (siren, 2.48) is under it, and so is gryffindor (2.92). Correction to 0.2 item 4 and to siren's 5.3 ("batch ceiling 3.94"): read 3.72. No theme change.

**The overlap probe's positive control** now fires in all seven themes (it is accepted as evidence; the round-1 claim without output was the gap, and Ender has closed it).

**The stop item stays as ruled in 11.1.** The Foundation spec (`QuickLaunch_ThemeSpec_Foundation_2026-09-30.md`, A4) now specifies `scrollbar-gutter: stable` on `#grid-container` and says batch 1 and batch 2 `right N px` offsets stay as they are. When that lands, the 1 px on yakuza and nonary-games closes with no theme change. Acceptance for the Foundation after-run, as in 11.1: the focus ring on the last column at 640 x 420 and 1024 x 700 for yakuza, nonary-games, gryffindor and shire; expected 3 px for the two batch 2 themes. No re-look of batch 2 is needed for this.

### 12.2 Remaining real defects and fixes

**None. No fix list.** Count of real defects: 0.

### 12.3 Watch items (not fixes, not blocking)

1. **W1 to W6 from 11.7 stand unchanged** (yakuza's right strip beside the scroll thumb; persona-5's nested focus frames, long-filter chip on the sawtooth, and corner cut on real icons; siren's band-line stack; parasite-eve's fringe valance).
2. **Siren's tower at 1x** reads as a horn cluster on a mast; with its sound arcs it says "siren", but someone who has not played the game may also read a bow tie on a stick. It is original and generic; leave it.
3. **Not seen by me, as in 11.7 item 3:** the 640 x 420 and 1024 x 700 grids, edit-mode tile ✕ buttons, the skin picker list open, the empty-library drop hint. None of F1 to F4 touches them; I rely on Ender's probes.
4. **Dela Gothic One for akira (D1 in 11.7)** is still deferred until the font bundling lands; it is not part of batch 2's ship decision.
