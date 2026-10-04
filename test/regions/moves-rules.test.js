'use strict';
// Plain Node: node --test test/
// M3 rules (tech plan § 3, UX spec 5): which files move, the error mapping,
// placeholders, names, OneDrive, the test-mode guard and the box texts.
// Pure: no file is touched.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const R = require('../../src/main/moves/rules');
const { resolveMoveSetup, argValue } = require('../../src/main/moves/setup');

const F = { desktop: 'C:\\Users\\Me\\Desktop', publicDesktop: 'C:\\Users\\Public\\Desktop' };

test('classify: a top-level .lnk / .url in either desktop moves; anything else is a reference or bounces (spec 5.2, Q5, Q11)', () => {
  assert.deepEqual(R.classify('C:\\Users\\Me\\Desktop\\Steam.lnk', F), { action: 'move', desktop: 'user' });
  assert.deepEqual(R.classify('c:\\users\\me\\desktop\\Game.URL', F), { action: 'move', desktop: 'user' }, 'case-insensitive');
  assert.deepEqual(R.classify('C:\\Users\\Public\\Desktop\\Zoom.lnk', F), { action: 'move', desktop: 'public' });
  assert.deepEqual(R.classify('C:\\Users\\Me\\Desktop\\Tool.exe', F), { action: 'ref' }, 'an .exe is never moved (Q11)');
  assert.deepEqual(R.classify('C:\\Users\\Me\\Desktop\\Sub\\Inner.lnk', F), { action: 'ref' }, 'not top-level');
  assert.deepEqual(R.classify('C:\\Users\\Me\\Downloads\\X.lnk', F), { action: 'ref' }, 'not a desktop');
  assert.deepEqual(R.classify('C:\\Users\\Me\\Desktop\\notes.txt', F), { action: 'reject' });
  assert.deepEqual(R.classify('C:\\Users\\Me\\Desktop\\Folder', F), { action: 'reject' });
  assert.deepEqual(R.classify('C:\\Users\\Me\\Desktop\\Steam.lnk', { desktop: null, publicDesktop: null }), { action: 'ref' }, 'no folders known: nothing moves');
});

test('reasons (tech plan § 3; addendum B9): the seven lines', () => {
  assert.equal(R.reasonFor(5, { publicDesktop: true }), 'Needs administrator rights.');
  assert.equal(R.reasonFor(5, { publicDesktop: false }), 'Windows denied access to the file.');
  assert.equal(R.reasonFor(32), 'The file is in use.');
  assert.equal(R.reasonFor(33), 'The file is in use.');
  assert.equal(R.reasonFor(17), 'The desktop is on a different drive.');
  assert.equal(R.reasonFor(-2), 'The file is online only. Keep it on this device, then try again.');
  assert.equal(R.reasonFor(2), 'The file is missing.');
  assert.equal(R.reasonFor(3), 'The file is missing.');
  for (const code of [80, 183, -1, -3, -4, 0, 1450]) assert.equal(R.reasonFor(code), 'The disk refused the move.', `code ${code}`);
  assert.equal(R.reasonFor(17, { publicDesktop: true }), 'The desktop is on a different drive.', 'only 5 depends on the folder');
});

test('placeholders: OFFLINE, RECALL_ON_OPEN and RECALL_ON_DATA_ACCESS are refused; ordinary attributes are not', () => {
  assert.equal(R.isPlaceholder(0x1000), true);
  assert.equal(R.isPlaceholder(0x40000 | 0x20), true);
  assert.equal(R.isPlaceholder(0x400000 | 0x20), true);
  for (const a of [0x20, 0x1, 0x2, 0x4, 0x80, 0x2000]) assert.equal(R.isPlaceholder(a), false, `0x${a.toString(16)}`);
  assert.equal(R.isPlaceholder(null), false);
});

test('collision-safe names: Name.lnk, Name (2).lnk, Name (3).lnk; the tile name drops the extension', () => {
  assert.equal(R.candidateName('Steam.lnk', 1), 'Steam.lnk');
  assert.equal(R.candidateName('Steam.lnk', 2), 'Steam (2).lnk');
  assert.equal(R.candidateName('My Game.url', 3), 'My Game (3).url');
  assert.equal(R.displayName('C:\\x\\Steam (2).lnk'), 'Steam (2)');
  assert.equal(R.displayName('C:\\x\\Notes.url'), 'Notes');
});

test('OneDrive: a desktop under %OneDrive%, %OneDriveConsumer% or %OneDriveCommercial% gets the note', () => {
  const env = { OneDrive: 'C:\\Users\\Me\\OneDrive' };
  assert.equal(R.underOneDrive('C:\\Users\\Me\\OneDrive\\Desktop', env), true);
  assert.equal(R.underOneDrive('C:\\Users\\Me\\onedrive\\desktop', env), true, 'case-insensitive');
  assert.equal(R.underOneDrive('C:\\Users\\Me\\Desktop', env), false);
  assert.equal(R.underOneDrive('C:\\Users\\Me\\OneDriveX\\Desktop', env), false, 'a sibling with the same prefix is not inside');
  assert.equal(R.underOneDrive('D:\\Work\\Desktop', { OneDriveCommercial: 'D:\\Work' }), true);
  assert.equal(R.underOneDrive('C:\\Users\\Me\\Desktop', {}), false);
  assert.equal(R.STRINGS.oneDrive, 'Your desktop is synced by OneDrive. Moved shortcuts stop syncing.');
});

const FL = (name, reason = 'The file is in use.') => ({ name, reason });

test('failure boxes (addendum B1): what failed, where it is now, the reason; one in quotes, more as a count and up to 3 names', () => {
  // Drop or + FILE.
  assert.deepEqual(R.moveFailedBox([FL('Steam')]), { message: "Couldn't move “Steam” off the desktop. It is still on the desktop.", detail: 'The file is in use.' });
  assert.deepEqual(R.moveFailedBox([FL('Steam'), FL('Notes')]), { message: "Couldn't move 2 shortcuts off the desktop (Steam, Notes). They are still on the desktop.", detail: 'The file is in use.' });
  // ↩, Delete, the tile menu, Move all back.
  assert.deepEqual(R.moveBackFailedBox([FL('Steam')]), { message: "Couldn't move “Steam” back to the desktop. It is still in QuickLauncher.", detail: 'The file is in use.' });
  assert.equal(R.moveBackFailedBox([FL('Steam'), FL('Notes')]).message, "Couldn't move 2 shortcuts back to the desktop (Steam, Notes). They are still in QuickLauncher.");
  // 4 names: three, then "and 1 more"; 5: "and 2 more".
  assert.equal(R.moveBackFailedBox([FL('Steam'), FL('Notes'), FL('Mail'), FL('Chat')]).message,
    "Couldn't move 4 shortcuts back to the desktop (Steam, Notes, Mail and 1 more). They are still in QuickLauncher.");
  assert.equal(R.nameList([FL('a'), FL('b'), FL('c'), FL('d'), FL('e')]), 'a, b, c and 2 more');
  // Two different reasons: one "{name}: {reason}" line per listed name (the first 3).
  assert.equal(R.moveFailedBox([FL('Steam'), FL('Zoom', 'Needs administrator rights.')]).detail, 'Steam: The file is in use.\nZoom: Needs administrator rights.');
  assert.equal(R.moveFailedBox([FL('a'), FL('b', 'x'), FL('c'), FL('d', 'y')]).detail, 'a: The file is in use.\nb: x\nc: The file is in use.');
  // Region delete, region kept, with and without others back.
  assert.deepEqual(R.moveBackFailedBox([FL('Steam')], { regionKept: true, othersBack: 5 }),
    { message: "Couldn't move “Steam” back to the desktop. The region was kept.", detail: 'The file is in use.\n5 others are back on the desktop.' });
  assert.equal(R.moveBackFailedBox([FL('Steam'), FL('Notes')], { regionKept: true, othersBack: 1 }).detail, 'The file is in use.\n1 other is back on the desktop.');
  assert.equal(R.moveBackFailedBox([FL('Steam'), FL('Notes')], { regionKept: true }).message, "Couldn't move 2 shortcuts back to the desktop (Steam, Notes). The region was kept.");
  assert.equal(R.moveBackFailedBox([FL('Steam')], { regionKept: true, othersBack: 0 }).detail, 'The file is in use.', 'none back: no line');
  // A file without a tile, MOVE TO DESKTOP.
  assert.deepEqual(R.orphanFailedBox(FL('Steam')), { message: "Couldn't move “Steam” to the desktop. It is still in the QuickLauncher Shortcuts folder.", detail: 'The file is in use.' });
  // Every reason "missing": "where it is now" would be false, so it is left out.
  const gone = 'The file is missing.';
  assert.equal(R.moveBackFailedBox([FL('Steam', gone)]).message, "Couldn't move “Steam” back to the desktop.");
  assert.equal(R.moveFailedBox([FL('A', gone), FL('B', gone)]).message, "Couldn't move 2 shortcuts off the desktop (A, B).");
  assert.equal(R.orphanFailedBox(FL('Steam', gone)).message, "Couldn't move “Steam” to the desktop.");
  assert.equal(R.moveBackFailedBox([FL('A', gone), FL('B')]).message, "Couldn't move 2 shortcuts back to the desktop (A, B). They are still in QuickLauncher.", 'one not missing: the sentence stays');
});

test('Move all back (addendum B2), counts (B3), broken box (B4), notice (B7), tooltips (B5)', () => {
  const one = R.moveAllConfirm(1, { regionName: 'Games' });
  assert.deepEqual(one, { message: 'Move 1 shortcut back to the desktop?', detail: 'It leaves “Games”. Names already on the desktop get a number.', buttons: ['Move back', 'Cancel'] });
  assert.equal(R.moveAllConfirm(7, { regionName: 'Games' }).detail, 'They leave “Games”. Names already on the desktop get a number.');
  assert.equal(R.moveAllConfirm(7, { regionName: 'Games', regionCount: 1 }).message, 'Move 7 shortcuts back to the desktop?');
  assert.equal(R.moveAllConfirm(4, { regionCount: 3 }).detail, 'They leave 3 regions. Names already on the desktop get a number.');
  assert.equal(R.moveAllConfirm(4, { regionName: 'Games', regionCount: 2 }).detail, 'They leave 2 regions. Names already on the desktop get a number.', 'two or more regions: the number, never one name');
  assert.deepEqual(R.brokenBox('Steam'), { message: '“Steam” is missing from the QuickLauncher Shortcuts folder.', buttons: ['Remove tile', 'Keep'] });
  assert.equal(R.movedCountText(0), 'None moved off the desktop.');
  assert.equal(R.movedCountText(1), '1 moved off the desktop.');
  assert.equal(R.movedCountText(7), '7 moved off the desktop.');
  assert.equal(R.orphanCountText(2), '2 files without a tile.');
  assert.equal(R.orphanCountText(1), '1 file without a tile.');
  assert.equal(R.notShortcutNotice(1), 'NOT A SHORTCUT');
  assert.equal(R.notShortcutNotice(2), '2 FILES ARE NOT SHORTCUTS');
  assert.equal(R.addBackTip('QUICK.LAUNCH'), 'Add this shortcut to “QUICK.LAUNCH”');
  assert.equal(R.STRINGS.moveToDesktopTip, 'Move this shortcut to the desktop');
  assert.equal(R.STRINGS.noneToMoveBack, 'No shortcuts to move back.');
  assert.equal(R.STRINGS.unavailableLine, 'Moving is unavailable.');
  assert.equal(R.STRINGS.unavailable, 'Moving is unavailable. Nothing was changed.');
});

// ── the test-mode guard ─────────────────────────────────────────────────────
const TEMP = 'C:\\Users\\Me\\AppData\\Local\\Temp';
const REAL = { desktop: 'C:\\Users\\Me\\Desktop', publicDesktop: 'C:\\Users\\Public\\Desktop', store: 'C:\\Users\\Me\\QuickLauncher Shortcuts', profile: 'C:\\Users\\Me\\AppData\\Roaming\\QuickLauncher' };
const paths = (root, profile) => ({ desktop: path.join(root, 'Desktop'), pub: path.join(root, 'Public Desktop'), store: path.join(root, 'QuickLauncher Shortcuts'), profile });

test('test-mode guard: folders and profile inside %TEMP% pass', () => {
  const r = R.testModeCheck({ paths: paths(`${TEMP}\\t1\\desk`, `${TEMP}\\t1\\profile`), tempRoots: [TEMP], real: REAL });
  assert.equal(r.ok, true, r.reasons.join('; '));
});

test('test-mode guard refuses (positive control): outside %TEMP%, the temp root itself, the real desktop, a real profile', () => {
  const out = R.testModeCheck({ paths: paths('C:\\Antigravity Projects\\x', `${TEMP}\\p`), tempRoots: [TEMP], real: REAL });
  assert.equal(out.ok, false);
  assert.equal(out.reasons.filter((s) => /not inside the temp folder/.test(s)).length, 3);
  const realDesk = R.testModeCheck({ paths: { desktop: REAL.desktop }, tempRoots: [TEMP], real: REAL });
  assert.equal(realDesk.ok, false);
  assert.ok(realDesk.reasons.some((s) => /overlaps the real desktop/.test(s)), realDesk.reasons.join('; '));
  const root = R.testModeCheck({ paths: { desktop: TEMP }, tempRoots: [TEMP], real: REAL });
  assert.equal(root.ok, false, 'the temp folder itself is not inside it');
  const prof = R.testModeCheck({ paths: { profile: REAL.profile }, tempRoots: [TEMP], real: REAL });
  assert.equal(prof.ok, false, 'the real profile is refused');
  // A real folder that sits inside the test tree (e.g. a desktop moved into %TEMP%) is refused too.
  const inside = R.testModeCheck({ paths: { desktop: `${TEMP}\\t\\Desktop` }, tempRoots: [TEMP], real: { desktop: `${TEMP}\\t\\Desktop\\x` } });
  assert.equal(inside.ok, false);
  const none = R.testModeCheck({ paths: { desktop: `${TEMP}\\t\\Desktop` }, tempRoots: [], real: REAL });
  assert.equal(none.ok, false, 'no temp root known: refused');
});

test('resolveMoveSetup: --ql-test-desktop inside %TEMP% is test mode with the three folders; outside is refused; hooks alone make moving unavailable', () => {
  const win32 = { available: true, knownFolder: (n) => (n === 'Desktop' ? REAL.desktop : REAL.publicDesktop) };
  const env = { TEMP, TMP: TEMP, USERPROFILE: 'C:\\Users\\Me', APPDATA: 'C:\\Users\\Me\\AppData\\Roaming', PUBLIC: 'C:\\Users\\Public' };
  const realishFn = (p) => path.resolve(p);
  const ok = resolveMoveSetup({ argv: ['x', `--ql-test-desktop=${TEMP}\\t\\desk`], env, userData: `${TEMP}\\t\\profile`, win32, realishFn });
  // os.tmpdir() is also a temp root: it may differ from the fake TEMP above, so test only what this env decides.
  assert.equal(ok.refused, null, String(ok.refused));
  assert.equal(ok.testMode, true);
  assert.equal(ok.folders.desktop, path.join(`${TEMP}\\t\\desk`, 'Desktop'));
  assert.equal(ok.folders.publicDesktop, path.join(`${TEMP}\\t\\desk`, 'Public Desktop'));
  assert.equal(ok.folders.store, path.join(`${TEMP}\\t\\desk`, 'QuickLauncher Shortcuts'));
  assert.deepEqual(ok.confineTo, [path.resolve(`${TEMP}\\t\\desk`), path.resolve(`${TEMP}\\t\\desk`)], 'test mode moves nothing outside the test folder');
  const bad = resolveMoveSetup({ argv: ['x', '--ql-test-desktop=C:\\Antigravity Projects\\nope'], env, userData: `${TEMP}\\t\\profile`, win32, realishFn });
  assert.ok(Array.isArray(bad.refused) && bad.refused.length >= 3, 'refused');
  const realProfile = resolveMoveSetup({ argv: ['x', `--ql-test-desktop=${TEMP}\\t\\desk`], env, userData: REAL.profile, win32, realishFn });
  assert.ok(Array.isArray(realProfile.refused), 'test mode on the real profile is refused');
  const empty = resolveMoveSetup({ argv: ['x', '--ql-test-desktop='], env, userData: `${TEMP}\\p`, win32, realishFn });
  assert.ok(Array.isArray(empty.refused));
  const hooks = resolveMoveSetup({ argv: ['x'], env, userData: REAL.profile, win32, testHooks: true, realishFn });
  assert.equal(hooks.refused, null);
  assert.equal(hooks.available, false);
  assert.deepEqual(hooks.folders, { desktop: null, publicDesktop: null, store: null }, 'no real folder is even named');
  const normal = resolveMoveSetup({ argv: ['x'], env, userData: REAL.profile, win32, realishFn });
  assert.equal(normal.available, true);
  assert.deepEqual(normal.folders, { desktop: REAL.desktop, publicDesktop: REAL.publicDesktop, store: REAL.store });
  const noKoffi = resolveMoveSetup({ argv: ['x'], env, userData: REAL.profile, win32: { available: false }, realishFn });
  assert.equal(noKoffi.available, false, 'without koffi moving is unavailable');
  assert.equal(argValue(['--ql-test-desktop="C:\\a b"'], 'ql-test-desktop'), 'C:\\a b');
});
