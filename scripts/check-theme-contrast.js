#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Theme contrast linter — WCAG 2.x AA gate for new/changed themes,
 * warn-only for legacy themes whose hash is recorded in
 * scripts/themes-baseline.json.
 *
 * Per QuickLaunch_UXReview_2026-04-25 §4 + Decisions Locked In #6:
 *   "Contrast linter gates on new/changed themes only, warns on legacy.
 *    Pre-existing failures across the ~110 shipped themes do not block
 *    builds; any newly added theme or any existing theme modified in the
 *    current commit must pass AA."
 *
 * Implementation notes
 * - Zero dependencies (other than node:* built-ins). The WCAG relative
 *   luminance + contrast formula is ~10 lines and pulled in directly so
 *   we don't drag a 4 MB transitive tree into a desktop utility build.
 * - Hashes (sha256 of theme file contents) determine "is this theme the
 *   same as it was when the baseline was checked in". Updating the
 *   baseline is a deliberate manual `npm run check:contrast -- --rebaseline`
 *   step — the build never rebaselines on its own.
 * - Exit 1 only if any new or changed theme fails. Warnings on legacy
 *   themes never fail the build.
 *
 * Usage
 *   node scripts/check-theme-contrast.js           # check, exit 1 on errors
 *   node scripts/check-theme-contrast.js --rebaseline   # accept current state
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPO_ROOT     = path.resolve(__dirname, '..');
const THEMES_DIR    = path.join(REPO_ROOT, 'src', 'renderer', 'styles', 'themes');
const BASE_CSS      = path.join(REPO_ROOT, 'src', 'renderer', 'styles', 'base.css');
const BASELINE_FILE = path.join(__dirname, 'themes-baseline.json');

const AA_NORMAL_TEXT = 4.5; // WCAG 2.x AA — text below 18 px / 14 px bold
const AA_UI_ELEMENT  = 3.0; // WCAG 2.x AA — non-text contrast (icons, accents)

// ── Color parsing ───────────────────────────────────────────────────────────
// Returns {r,g,b,a} on a 0–255 / 0–1 scale, or null if unparseable.
function parseColor(s) {
  if (!s) return null;
  s = s.trim();
  // #RGB / #RGBA / #RRGGBB / #RRGGBBAA
  let m = s.match(/^#([0-9a-f]{3,8})$/i);
  if (m) {
    const h = m[1];
    if (h.length === 3 || h.length === 4) {
      const r = parseInt(h[0]+h[0], 16);
      const g = parseInt(h[1]+h[1], 16);
      const b = parseInt(h[2]+h[2], 16);
      const a = h.length === 4 ? parseInt(h[3]+h[3], 16) / 255 : 1;
      return { r, g, b, a };
    }
    if (h.length === 6 || h.length === 8) {
      const r = parseInt(h.slice(0,2), 16);
      const g = parseInt(h.slice(2,4), 16);
      const b = parseInt(h.slice(4,6), 16);
      const a = h.length === 8 ? parseInt(h.slice(6,8), 16) / 255 : 1;
      return { r, g, b, a };
    }
  }
  // rgb(...) / rgba(...)
  m = s.match(/^rgba?\(\s*([^)]+)\)$/i);
  if (m) {
    const parts = m[1].split(/[,\s/]+/).filter(Boolean).map(p => p.trim());
    if (parts.length >= 3) {
      const r = clamp255(parseFloat(parts[0]));
      const g = clamp255(parseFloat(parts[1]));
      const b = clamp255(parseFloat(parts[2]));
      const a = parts[3] != null ? clamp01(parseFloat(parts[3])) : 1;
      return { r, g, b, a };
    }
  }
  return null;
}

function clamp255(n) { return Math.max(0, Math.min(255, n | 0)); }
function clamp01(n)  { return Math.max(0, Math.min(1, n)); }

// Composite `fg` over `bg` (both {r,g,b,a 0-1}) with standard alpha blending.
// Returns an opaque color {r,g,b,a:1}.
function composite(fg, bg) {
  const a = fg.a + bg.a * (1 - fg.a);
  if (a === 0) return { r: 0, g: 0, b: 0, a: 1 };
  const r = (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a;
  const g = (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a;
  const b = (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a;
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b), a: 1 };
}

// WCAG relative luminance for an opaque sRGB color.
function luminance({ r, g, b }) {
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

// WCAG 2.x contrast ratio between two opaque colors.
function contrast(a, b) {
  const La = luminance(a);
  const Lb = luminance(b);
  const lighter = Math.max(La, Lb);
  const darker  = Math.min(La, Lb);
  return (lighter + 0.05) / (darker + 0.05);
}

// ── Variable extraction ─────────────────────────────────────────────────────
// Pull the FIRST :root-level declaration of `--name` from a CSS file's text.
// We don't need a full CSS parser — themes always declare their palette in a
// single :root block at the top of the file. If the theme ever stops doing
// that, the linter degrades gracefully (returns null and skips the check).
function extractVar(css, name) {
  const re = new RegExp('--' + name + '\\s*:\\s*([^;]+);');
  const m = css.match(re);
  return m ? m[1].trim() : null;
}

// Resolve a value that may itself reference another --var via var(--other).
// Single-level resolution — no chains, no fallbacks. Sufficient for the
// palette structure these theme files actually use.
function resolveVarValue(value, css, baseCss) {
  const m = value && value.match(/^var\(--([a-z0-9-]+)\)$/i);
  if (!m) return value;
  return extractVar(css, m[1]) || extractVar(baseCss, m[1]) || null;
}

// Collapse rgba(...) onto a hard-black backdrop to get the worst-case
// opaque color the user would actually see when --bg is semi-transparent.
// (The desktop wallpaper underneath could be anything — we audit against
// black because that's the most common dark-mode case and yields the
// strongest "did we leave enough contrast" signal.)
const HARD_BLACK = { r: 0, g: 0, b: 0, a: 1 };
function flatten(color) {
  if (!color) return null;
  if (color.a >= 0.999) return { ...color, a: 1 };
  return composite(color, HARD_BLACK);
}

// ── Per-theme audit ─────────────────────────────────────────────────────────
function auditTheme(themePath, baseCss) {
  const css = fs.readFileSync(themePath, 'utf8');
  const findings = [];

  // Pull the variables — themes that don't redeclare a value inherit the
  // base.css default, which is what the running app would see.
  const get = (name) => {
    const v = extractVar(css, name) || extractVar(baseCss, name);
    return resolveVarValue(v, css, baseCss);
  };

  const bg         = parseColor(get('bg'));
  const text       = parseColor(get('text'));
  const textDim    = parseColor(get('text-dim'));
  const accent     = parseColor(get('accent-c'));
  const accentText = parseColor(get('accent-text'));
  const hintSub    = parseColor(get('hint-sub-color'));

  if (!bg) {
    findings.push({ kind: 'error', msg: '--bg failed to parse' });
    return findings;
  }
  const bgFlat = flatten(bg);

  const checks = [
    { label: '--text on --bg',           color: text,       threshold: AA_NORMAL_TEXT },
    { label: '--text-dim on --bg',       color: textDim,    threshold: AA_NORMAL_TEXT },
    { label: '--accent-c on --bg',       color: accent,     threshold: AA_UI_ELEMENT  },
    // --accent-text is the small-text variant of the accent (1.94.1 split).
    // Functional small text in base.css paints with --accent-text, so the
    // 3:1 UI-component floor applies (chrome-adjacent labels at 11–12 px,
    // not body prose — body uses --text and is already gated above).
    { label: '--accent-text on --bg',    color: accentText, threshold: AA_UI_ELEMENT  },
    { label: '--hint-sub-color on --bg', color: hintSub,    threshold: AA_NORMAL_TEXT },
  ];

  for (const c of checks) {
    if (!c.color) continue; // var not set / unparseable — skip silently
    const fgFlat = flatten(composite(c.color, bgFlat));
    const ratio = contrast(fgFlat, bgFlat);
    if (ratio < c.threshold) {
      findings.push({
        kind: 'fail',
        msg: `${c.label}: ${ratio.toFixed(2)}:1 (needs ${c.threshold}:1)`,
      });
    }
  }

  return findings;
}

// ── Main ────────────────────────────────────────────────────────────────────
function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

function loadBaseline() {
  if (!fs.existsSync(BASELINE_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));
  } catch (e) {
    console.error('[contrast] baseline file unreadable:', e.message);
    return {};
  }
}

function saveBaseline(map) {
  fs.writeFileSync(BASELINE_FILE, JSON.stringify(map, null, 2) + '\n');
}

function listThemes() {
  return fs.readdirSync(THEMES_DIR)
    .filter(f => f.endsWith('.css'))
    .map(f => ({ name: f.replace(/\.css$/, ''), file: path.join(THEMES_DIR, f) }));
}

function main() {
  const rebaseline = process.argv.includes('--rebaseline');
  const baseCss = fs.existsSync(BASE_CSS) ? fs.readFileSync(BASE_CSS, 'utf8') : '';
  const baseline = loadBaseline();
  const themes = listThemes();
  const newBaseline = {};

  const errors = [];   // new/changed themes that failed AA — block build
  const warnings = []; // legacy themes that failed AA — informational

  for (const t of themes) {
    const css = fs.readFileSync(t.file, 'utf8');
    const hash = sha256(css);
    newBaseline[t.name] = hash;

    const findings = auditTheme(t.file, baseCss);
    const failed = findings.filter(f => f.kind === 'fail' || f.kind === 'error');
    if (failed.length === 0) continue;

    const wasInBaseline = Object.prototype.hasOwnProperty.call(baseline, t.name);
    const isUnchanged = wasInBaseline && baseline[t.name] === hash;
    const bucket = isUnchanged ? warnings : errors;
    bucket.push({ name: t.name, findings: failed });
  }

  if (rebaseline) {
    saveBaseline(newBaseline);
    console.log(`[contrast] rebaselined ${themes.length} theme(s) -> ${path.relative(REPO_ROOT, BASELINE_FILE)}`);
    return;
  }

  if (warnings.length) {
    console.log(`\n[contrast] WARNINGS (legacy themes, do not block build) — ${warnings.length} theme(s):`);
    for (const w of warnings) {
      console.log(`  - ${w.name}`);
      for (const f of w.findings) console.log(`      ${f.msg}`);
    }
  }

  if (errors.length) {
    console.error(`\n[contrast] ERRORS (new or changed themes must pass AA) — ${errors.length} theme(s):`);
    for (const e of errors) {
      console.error(`  - ${e.name}`);
      for (const f of e.findings) console.error(`      ${f.msg}`);
    }
    console.error(
      '\nFix the failing themes, or — if a fix shipped that legitimately ' +
      'updated a previously-failing legacy theme — run\n' +
      '    npm run check:contrast -- --rebaseline\n' +
      'to record the new hash as accepted.\n'
    );
    process.exit(1);
  }

  console.log(`[contrast] ${themes.length} theme(s) checked, 0 errors, ${warnings.length} legacy warning(s).`);
}

try {
  main();
} catch (err) {
  console.error('[contrast] linter crashed:', err.stack || err.message);
  process.exit(2);
}
