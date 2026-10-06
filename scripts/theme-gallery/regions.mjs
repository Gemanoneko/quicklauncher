#!/usr/bin/env node
// QuickLaunch region gallery: every theme in Column and Row (regions M4), without launching QuickLauncher.
//
//   npm run gallery:regions -- [--out=<dir>] [--only=a,b] [--concurrency=<n>] [--sets=column,row,...]
//
// Runs run.mjs in region mode once per set, one after the other (each set its own Electron run,
// with run.mjs's isolation guards and verdict), into <out>/<set>/, then sums the layout measures
// of every theme and state into <out>/summary.json:
//   column        6 tiles  view, hover, edit, filter, rename, notice, update
//   row           5 tiles  view, hover, edit, filter, rename, notice
//   row-region8   5 tiles  named "Region 8" (the default name, the widest in practice): view, edit, notice
//   column-empty  0 tiles  view, edit
//   row-empty     0 tiles  view, edit
// Exit 0 only when every set passes. Default out: scratch/theme-gallery/regions (gitignored).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const argv = process.argv.slice(2);
const opt = (k, d) => { const a = argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
if (argv.includes('--help') || argv.includes('-h')) { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//')).map((l) => l.slice(3)).join('\n')); process.exit(0); }
const OUT = path.resolve(opt('out', path.join(REPO, 'scratch', 'theme-gallery', 'regions')));
const SETS = {
  column: ['--layout=column', '--items=6', '--states=view,hover,edit,filter,rename,notice,update'],
  row: ['--layout=row', '--items=5', '--states=view,hover,edit,filter,rename,notice'],
  'row-region8': ['--layout=row', '--items=5', '--name=Region 8', '--states=view,edit,notice'],
  'column-empty': ['--layout=column', '--items=0', '--states=view,edit'],
  'row-empty': ['--layout=row', '--items=0', '--states=view,edit'],
};
const pick = opt('sets', Object.keys(SETS).join(',')).split(',').map((x) => x.trim()).filter(Boolean);
for (const k of pick) if (!SETS[k]) { console.error(`unknown set ${k}; known ${Object.keys(SETS).join(', ')}`); process.exit(2); }
const pass = ['only', 'concurrency', 'scale', 'freeze-ms', 'timeout'].map((k) => opt(k, null) !== null ? `--${k}=${opt(k)}` : null).filter(Boolean);

const summary = { generated: new Date().toISOString(), sets: {} };
let failed = 0;
for (const set of pick) {
  const out = path.join(OUT, set);
  const work = path.join(OUT, `.work-${set}`);
  console.log(`\n== ${set}`);
  const r = spawnSync(process.execPath, [path.join(HERE, 'run.mjs'), ...SETS[set], `--out=${out}`, `--work=${work}`, ...pass], { stdio: 'inherit', windowsHide: true });
  if (r.status !== 0) failed++;
  let m = null;
  try { m = JSON.parse(fs.readFileSync(path.join(out, 'manifest.json'), 'utf8')); } catch { /* no manifest */ }
  if (!m) { summary.sets[set] = { verdict: 'FAIL', why: 'no manifest' }; continue; }
  // Count, per state, the themes where a measure is off.
  const per = {};
  for (const t of m.themes) {
    const md = (() => { try { return JSON.parse(fs.readFileSync(path.join(out, 'theme-metadata.json'), 'utf8')).find((x) => x.theme === t.theme); } catch { return null; } })();
    const lc = md && md.layoutCheck ? JSON.parse(md.layoutCheck) : {};
    for (const [st, x] of Object.entries(lc)) {
      const c = per[st] || (per[st] = { themes: 0, overlap: [], outside: [], listScrolls: [], fieldScrolls: [], titleCut: [], noticeCut: [], chipTextCut: [], chipNearMenu: [], renameNearMenu: [], emptyCellOff: [], editLabelNotText: [], headerTag: [], hoverGlyphNotText: [] });
      c.themes++;
      const add = (k, cond) => { if (cond) c[k].push(t.theme); };
      add('overlap', x.hit && x.hit.length);
      add('outside', x.outside && x.outside.length);
      add('listScrolls', x.listRange && (x.listRange[0] > 1 || x.listRange[1] > 1));
      // The field can scroll only when it is not overflow: hidden (M4 rulings Q18: it clips; the list scrolls).
      add('fieldScrolls', x.fieldRange && x.fieldOverflow !== 'hidden/hidden' && (x.fieldRange[0] > 1 || x.fieldRange[1] > 1));
      add('titleCut', x.titleCut === true);
      add('noticeCut', x.noticeCut === true);
      add('chipTextCut', x.chip && x.chip.textCut);
      // Column: the chip ends 6 DIP or more before the menu button (M4 rulings, measure 3); Row: the chip sits above it and does not meet it.
      add('chipNearMenu', x.chip && (set.startsWith('column') ? x.chip.gapToMenu < 6 : x.chip.meetsMenu));
      add('renameNearMenu', x.rename && (x.rename.meetsMenu || (set.startsWith('column') && x.rename.gapToMenu < 6)));
      add('emptyCellOff', x.emptyCell && (x.emptyCell.overflow || !x.emptyCell.textIsText || x.emptyCell.subLines !== (set.startsWith('row') ? 2 : 1)));
      add('editLabelNotText', x.editLabel && (!x.editLabel.isText || x.editLabel.shadow !== 'none'));
      add('headerTag', x.headerTag);
      add('hoverGlyphNotText', [x.menuHover, x.clusterHover].some((h) => h && h.hovered && h.color !== h.text));
    }
  }
  summary.sets[set] = { verdict: m.verdict, themes: m.themes.length, failures: m.failures, perState: Object.fromEntries(Object.entries(per).map(([st, c]) => [st, Object.fromEntries(Object.entries(c).map(([k, v]) => [k, Array.isArray(v) ? (v.length && v.length <= 8 ? `${v.length} (${v.join(', ')})` : v.length) : v]))])) };
}
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'summary.json'), JSON.stringify(summary, null, 1));
console.log('\n== region gallery summary (themes off per measure, per state)');
for (const [set, x] of Object.entries(summary.sets)) {
  console.log(`${set}: ${x.verdict}${x.themes ? `, ${x.themes} themes` : ''}`);
  for (const [st, c] of Object.entries(x.perState || {})) console.log(`  ${st.padEnd(7)} ${Object.entries(c).filter(([k]) => k !== 'themes').map(([k, v]) => `${k} ${v}`).join(' | ')}`);
}
console.log(`\nCITE: ql-region-gallery ${failed ? 'FAIL' : 'PASS'} | ${pick.length} set(s) | ${OUT}`);
process.exit(failed ? 1 : 0);
