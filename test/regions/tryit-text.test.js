'use strict';
// Plain Node: node --test test/
// The try-it's printed text (UX spec, "Addendum — try-it rewrite", Futaba
// measures 1 to 5): the script is run with --print (nothing is created or
// launched) under a fake APPDATA in the temp folder, so Sergei's data file is
// never read. Its output must equal the spec's block, and every numbered step
// must be actions plus one closing question. The lint is first seen to fail on
// each of the spec's deliberate breaks.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const REPO = path.join(__dirname, '..', '..');
const SCRIPT = path.join(REPO, 'scripts', 'tryit-regions.mjs');
const SPEC = path.join(REPO, 'Docs', 'QuickLaunch_Regions_UXSpec_2026-10-01.md');
const BASE = path.resolve(process.env.QL_TEST_TMP || os.tmpdir());
const APPDATA = path.join(BASE, 'ql-tryit-text', `${process.pid}`, 'AppData');
fs.mkdirSync(APPDATA, { recursive: true }); // empty: no QuickLauncher data file, so 0 shortcuts

function printed(fallback) {
  const r = spawnSync(process.execPath, [SCRIPT, '--print', ...(fallback ? ['--fallback'] : [])],
    { encoding: 'utf8', windowsHide: true, timeout: 60000, env: { ...process.env, APPDATA } });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout.replace(/\r\n/g, '\n');
}

// The spec's fenced block that follows a heading.
function specBlock(heading) {
  const s = fs.readFileSync(SPEC, 'utf8').replace(/\r\n/g, '\n');
  const at = s.indexOf(heading);
  assert.ok(at >= 0, heading);
  const open = s.indexOf('```\n', at) + 4;
  return s.slice(open, s.indexOf('\n```', open));
}

const FORBIDDEN = /\b(check|verify|confirm|must|should)\b/i;
/** The numbered steps of a printed text, each as one string. */
const stepsOf = (text) => text.split('\n').filter((l) => /^ ?\d+\. /.test(l)).map((l) => l.trim());
/** Futaba measures 2 to 4 on the main text; 5 on the fallback text. Returns the problems. */
function lint(text, { fallback = false } = {}) {
  const out = [];
  const steps = stepsOf(text);
  if (fallback) {
    if (steps.length) out.push(`fallback prints ${steps.length} step(s)`);
    if (text.includes('?')) out.push('fallback prints a question');
    return out;
  }
  if (!steps.length) out.push('no steps');
  steps.forEach((s, i) => {
    const q = (s.match(/\?/g) || []).length;
    if (q !== 1) out.push(`step ${i + 1}: ${q} question marks`);
    if (!s.endsWith('?')) out.push(`step ${i + 1}: does not end in its question`);
    if (FORBIDDEN.test(s)) out.push(`step ${i + 1}: says ${s.match(FORBIDDEN)[0]}`);
    if ((s.match(/Look at/g) || []).length !== 1) out.push(`step ${i + 1}: "Look at" ${(s.match(/Look at/g) || []).length} times`);
  });
  steps.forEach((s, i) => { if (!s.startsWith(`${i + 1}. `)) out.push(`step numbering at ${i + 1}`); });
  return out;
}

test('try-it measure 1: the printed text equals the spec block, with the real values', () => {
  const out = printed(false);
  const block = specBlock('### The printed text (Ender pastes this');
  const lines = out.split('\n');
  const want = block.split('\n');
  // The script prints a blank line before and after the block.
  assert.equal(lines[0], '');
  const body = lines.slice(1, 1 + want.length);
  want.forEach((w, i) => {
    if (w.includes("${join(desk, 'Desktop')}")) {
      const [pre, post] = w.split("${join(desk, 'Desktop')}");
      assert.ok(body[i].startsWith(pre) && body[i].endsWith(post), `line ${i + 1}: ${body[i]}`);
      const p = body[i].slice(pre.length, body[i].length - post.length);
      assert.ok(path.isAbsolute(p) && /[\\/]ql-regions-tryit[\\/]\d{14}[\\/]desk[\\/]Desktop$/.test(p), p);
    } else {
      assert.equal(body[i], w.replace('${seed.apps.length}', '0').replace('${HOTKEY}', 'Ctrl+Shift+Space'), `line ${i + 1}`);
    }
  });
  assert.equal(lines.slice(1 + want.length).join('\n').trim(), '', 'nothing else is printed');
});

test('try-it measure 1 (fallback): the printed text equals the spec block', () => {
  const out = printed(true);
  const block = specBlock('### The fallback run (`--fallback`)').replace('${seed.apps.length}', '0');
  assert.equal(out.trim(), block.trim());
});

test('try-it measures 2 to 5: eight steps, each actions plus one closing question, no verify words, "Look at" once; the fallback run prints no step and no question', () => {
  const main = printed(false);
  assert.deepEqual(lint(main), []);
  assert.equal(stepsOf(main).length, 8);
  assert.deepEqual(lint(printed(true), { fallback: true }), []);
});

test('the lint fails on each of the spec\'s deliberate breaks (positive control)', () => {
  const main = printed(false);
  const steps = stepsOf(main);
  const swap = (i, s) => main.replace(steps[i], s);
  assert.ok(lint(swap(0, `${steps[0].replace(/\?$/, '.')}`)).some((p) => /does not end/.test(p)), 'a step ending in a statement');
  assert.ok(lint(swap(1, `${steps[1]} Is it fast?`)).some((p) => /2 question marks/.test(p)), 'a step with two questions');
  assert.ok(lint(swap(2, steps[2].replace('Look at the tile.', 'Confirm that the tile moved. Look at the tile.'))).some((p) => /says Confirm/i.test(p)), '"Confirm that"');
  assert.ok(lint(swap(3, steps[3].replace('Look at the menu, ', ''))).some((p) => /"Look at" 0 times/.test(p)), 'a "Look at" deleted');
  assert.ok(lint(`${printed(true)}\n 1. Click a region. Is it clear?\n`, { fallback: true }).length === 2, 'a fallback step with a question');
});
