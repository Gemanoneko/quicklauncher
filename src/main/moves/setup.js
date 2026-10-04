'use strict';
// Which folders the safe file move uses (tech plan § 3), resolved once at
// start, before any window exists.
//
//   normal:      the real Desktop and Public Desktop (SHGetKnownFolderPath,
//                OneDrive-redirected or not) and %USERPROFILE%\QuickLauncher Shortcuts
//   --ql-test-desktop=<dir>:  <dir>\Desktop, <dir>\Public Desktop and
//                <dir>\QuickLauncher Shortcuts replace them. Refused (the app
//                exits before anything else runs) unless every one of them, and
//                the profile folder, lies inside the temp folder and none of
//                them overlaps a real desktop, the real store folder or the
//                real profile.
//   --ql-test-hooks without --ql-test-desktop: moving is unavailable, so a
//                test run can never move a real desktop file.

const fs = require('fs');
const os = require('os');
const path = require('path');
const R = require('./rules');

const STORE_NAME = 'QuickLauncher Shortcuts';

/** realpath of the nearest existing ancestor, plus the rest (resolves junctions for paths that do not exist yet). */
function realish(p) {
  let cur = path.resolve(String(p));
  const rest = [];
  for (;;) {
    try {
      const r = fs.realpathSync.native(cur);
      return rest.length ? path.join(r, ...rest.reverse()) : r;
    } catch {
      const up = path.dirname(cur);
      if (up === cur) return path.resolve(String(p));
      rest.push(path.basename(cur));
      cur = up;
    }
  }
}

function tempRoots(env) {
  return [...new Set([os.tmpdir(), env.TEMP, env.TMP].filter(Boolean).map((p) => path.resolve(p)))];
}

function argValue(argv, name) {
  const pre = `--${name}=`;
  const a = (argv || []).find((x) => typeof x === 'string' && x.startsWith(pre));
  return a === undefined ? null : a.slice(pre.length).replace(/^"(.*)"$/, '$1');
}

/**
 * Returns { refused: null | [reasons], testMode, available, reason, folders: { desktop, publicDesktop, store } }.
 * `real` (the real folders) is returned too, for the self-test's report.
 */
function resolveMoveSetup({ argv, env = process.env, userData, win32, testHooks = false, realishFn = realish }) {
  const home = env.USERPROFILE || os.homedir();
  const realDesktop = win32 && win32.available ? win32.knownFolder('Desktop') : null;
  const realPublic = win32 && win32.available ? win32.knownFolder('PublicDesktop') : null;
  const real = {
    desktop: realDesktop || path.join(home, 'Desktop'),
    publicDesktop: realPublic || path.join(env.PUBLIC || path.join(path.parse(home).root, 'Users', 'Public'), 'Desktop'),
    store: path.join(home, STORE_NAME),
    profile: env.APPDATA ? path.join(env.APPDATA, 'QuickLauncher') : null,
  };
  const testDir = argValue(argv, 'ql-test-desktop');
  if (testDir !== null) {
    if (!testDir.trim()) return { refused: ['--ql-test-desktop needs a folder'], real };
    const folders = {
      desktop: path.join(testDir, 'Desktop'),
      publicDesktop: path.join(testDir, 'Public Desktop'),
      store: path.join(testDir, STORE_NAME),
    };
    const chk = R.testModeCheck({
      paths: { 'test desktop': folders.desktop, 'test public desktop': folders.publicDesktop, 'test store folder': folders.store, profile: userData },
      tempRoots: tempRoots(env),
      real,
      realish: realishFn,
    });
    if (!chk.ok) return { refused: chk.reasons, real };
    const available = !!(win32 && win32.available);
    return { refused: null, testMode: true, available, reason: available ? null : 'win32 unavailable', folders, real, confineTo: [path.resolve(testDir), realishFn(testDir)] };
  }
  if (testHooks) {
    return { refused: null, testMode: false, available: false, reason: 'test hooks without --ql-test-desktop', folders: { desktop: null, publicDesktop: null, store: null }, real };
  }
  // Normal run. Without koffi or the known-folder lookup the desktops are only
  // used to recognise desktop files, so their drops are refused ("Moving is unavailable").
  const folders = { desktop: real.desktop, publicDesktop: real.publicDesktop, store: real.store };
  if (!win32 || !win32.available) return { refused: null, testMode: false, available: false, reason: 'win32 unavailable', folders, real };
  if (!realDesktop) return { refused: null, testMode: false, available: false, reason: 'desktop folder lookup failed', folders, real };
  return { refused: null, testMode: false, available: true, reason: null, folders, real };
}

module.exports = { resolveMoveSetup, realish, tempRoots, argValue, STORE_NAME };
