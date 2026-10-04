'use strict';
// Plain Node: node --test test/
// M3 rulings (UX spec "Addendum — M3 rulings") that live in fixed text or in
// the page's code: the README and uninstaller texts byte for byte (B6), the
// cheat-sheet row (B8), the broken tile's pip geometry (B4), and the drop
// effect (B7: always 'copy', never 'move', because a drop answered with Move
// tells Explorer to delete the originals). Each scanner is first shown to fail
// on a fixture.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

test('B6: the store folder README is the ruled text, CRLF, plain ASCII', () => {
  const { README_TEXT } = require('../../src/main/moves/mover');
  const want = [
    'These shortcuts came off your desktop. QuickLauncher moved them here when',
    'you added them to a region, and its tiles open them from here.',
    '',
    'Do not delete, rename or move them: their tiles would stop working.',
    '',
    'To put them back on the desktop, right-click the QuickLauncher tray icon,',
    'choose Regions, then press MOVE ALL BACK under Moved shortcuts.',
    'Uninstalling QuickLauncher puts them back too.',
    '',
    'Without QuickLauncher you can drag them out of this folder yourself.',
    '',
  ].join('\r\n');
  assert.equal(README_TEXT, want);
  assert.ok(/^[\x00-\x7f]*$/.test(README_TEXT), 'ASCII only');
  assert.ok(!/[^\r]\n/.test(README_TEXT), 'every line ends CRLF');
});

test('B6: the uninstaller box is the ruled string, MB_OK|MB_ICONINFORMATION, /SD IDOK', () => {
  const nsh = read('scripts/nsis/installer.nsh');
  const want = 'MessageBox MB_OK|MB_ICONINFORMATION "Some shortcuts could not go back to the desktop.$\\r$\\nThey are in:$\\r$\\n$R7$\\r$\\n$\\r$\\nDrag them out when you want them back. Nothing was deleted." /SD IDOK';
  assert.ok(nsh.includes(want), 'the MessageBox line');
  assert.equal(nsh.split('MessageBox').length - 1, 1, 'one box');
});

test('B8: the cheat-sheet Delete row', () => {
  assert.ok(read('src/renderer/manager.js').includes("['DELETE', 'Remove the focused tile; a moved shortcut goes back to the desktop (edit mode)'],"));
});

test('B4: the pip is the ruled "!" disc (circle r 6; bar 2 x 4.4 at 5, 2.4; dot 2 x 2 at 5, 7.6; rx 1), top-left 2 px, shown in edit mode too', () => {
  const js = read('src/renderer/region.js');
  assert.ok(js.includes('<svg viewBox="0 0 12 12" width="12" height="12" focusable="false"><circle cx="6" cy="6" r="6"/><rect x="5" y="2.4" width="2" height="4.4" rx="1"/><rect x="5" y="7.6" width="2" height="2" rx="1"/></svg>'));
  const css = read('src/renderer/styles/region.css');
  assert.ok(/\.tile-broken-pip \{[^}]*top: 2px; left: 2px; width: 12px; height: 12px;/.test(css));
  assert.ok(css.includes('.tile-broken-pip circle { fill: var(--text); }'));
  assert.ok(css.includes('.tile-broken-pip rect { fill: var(--bg); }'));
  assert.ok(!/edit-mode \.tile-broken-pip/.test(css), 'no rule hides it in edit mode');
});

// ── the drop effect (B7) ────────────────────────────────────────────────────
// Every dropEffect / effectAllowed assignment in the page code: only string
// literals, and only 'copy' or 'none' (effectAllowed: nothing that allows a move).
function dropEffectProblems(src) {
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
  const problems = [];
  let found = 0;
  for (const m of code.matchAll(/\.(dropEffect|effectAllowed)\s*=(?!=)\s*([^;\n]+)/g)) {
    found++;
    const [, prop, rhs] = m;
    const literals = [...rhs.matchAll(/'([^']*)'|"([^"]*)"|`([^`]*)`/g)].map((x) => x[1] ?? x[2] ?? x[3]);
    const bare = rhs.replace(/'[^']*'|"[^"]*"|`[^`]*`/g, '').replace(/[\s?:()]/g, '');
    const allowed = prop === 'dropEffect' ? ['copy', 'none'] : ['copy', 'none', 'link', 'copyLink'];
    if (!literals.length) problems.push(`${prop} from a non-literal: ${rhs.trim()}`);
    for (const l of literals) if (!allowed.includes(l)) problems.push(`${prop} = '${l}'`);
    // Anything but literals and a condition (e.g. a variable holding 'move') is refused.
    if (/[^a-zA-Z0-9_.!&|=<>]/.test(bare)) problems.push(`${prop} from an expression: ${rhs.trim()}`);
  }
  return { found, problems };
}

test('the drop-effect scanner fails on fixtures (positive control)', () => {
  for (const bad of [
    "e.dataTransfer.dropEffect = 'move';",
    "e.dataTransfer.dropEffect = rejected ? 'none' : 'move';",
    'e.dataTransfer.dropEffect = "move";',
    "e.dataTransfer.effectAllowed = 'copyMove';",
    "e.dataTransfer.effectAllowed = 'all';",
    'e.dataTransfer.dropEffect = effect;',
  ]) assert.ok(dropEffectProblems(bad).problems.length > 0, `not caught: ${bad}`);
  assert.deepEqual(dropEffectProblems("e.dataTransfer.dropEffect = rejected ? 'none' : 'copy';").problems, []);
  assert.deepEqual(dropEffectProblems("// e.dataTransfer.dropEffect = 'move';").problems, [], 'comments do not count');
});

test('B7: every drop effect in the page code is copy (or none), never move; the region page sets it on file drags', () => {
  const dir = path.join(ROOT, 'src', 'renderer');
  let total = 0;
  for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.js'))) {
    const r = dropEffectProblems(fs.readFileSync(path.join(dir, f), 'utf8'));
    total += r.found;
    assert.deepEqual(r.problems, [], f);
  }
  const region = dropEffectProblems(read('src/renderer/region.js'));
  assert.ok(region.found >= 1, 'region.js answers file drags');
  assert.ok(total >= 2, `the scan saw the assignments (${total})`);
});

module.exports = { dropEffectProblems };
