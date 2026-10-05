'use strict';
// The rules of the safe file move (tech plan § 3, UX spec 5): which files
// move, how a Win32 error reads, the collision-safe names, the OneDrive
// check, the test-mode guard and the box texts. Pure: no fs, no Electron, no
// Win32, so it is unit-tested in plain Node (test/regions/moves-rules.test.js).

const path = require('path');

const MOVE_EXTS = new Set(['.lnk', '.url']);         // shortcut files: moved off a desktop
const ACCEPTED_EXTS = new Set(['.lnk', '.url', '.exe']); // anything else on a drop bounces (spec 5.2)

const STRINGS = Object.freeze({
  // Reasons (spec 9.3; addendum B9).
  reasonAdmin: 'Needs administrator rights.',
  reasonDenied: 'Windows denied access to the file.',
  reasonInUse: 'The file is in use.',
  reasonOtherDrive: 'The desktop is on a different drive.',
  reasonOnlineOnly: 'The file is online only. Keep it on this device, then try again.',
  reasonMissing: 'The file is missing.',
  reasonDisk: 'The disk refused the move.',
  // The store step and the steps before the move (fix-pass addendum C1, C4).
  reasonStoreBlocked: 'A file named “QuickLauncher Shortcuts” is in your user folder. Rename or move it, then try again.',
  reasonStoreDenied: 'Access to the QuickLauncher Shortcuts folder was denied. Check its permissions and your security software.',
  reasonDiskFull: 'The disk is full.',
  reasonTooLong: 'The name is too long for the QuickLauncher Shortcuts folder. Shorten it, then try again.',
  openFolderFailed: "Couldn't open the QuickLauncher Shortcuts folder.",
  unavailable: 'Moving is unavailable. Nothing was changed.',
  unavailableLine: 'Moving is unavailable.', // the Manager's standing line and its disabled buttons (B5)
  noneToMoveBack: 'No shortcuts to move back.', // MOVE ALL BACK… disabled at 0 (B5)
  oneDrive: 'Your desktop is synced by OneDrive. Moved shortcuts stop syncing.',
  moveBackTip: 'Move back to desktop',
  removeTip: 'Remove',
  removeTileTip: 'Remove tile', // the badge on a broken tile (B4)
  moveToDesktopTip: 'Move this shortcut to the desktop', // MOVE TO DESKTOP (B5)
  emptyTitle: 'DROP SHORTCUTS HERE',
  emptySub: 'Drag them off the desktop, or right-click to add.',
});

// Win32 codes (winerror.h) the mapping looks at, and the mover's own codes (negative):
// a placeholder, a name too long for the store folder (C4), and the store step or a
// step before the move failing in Node (C1).
const E = {
  FILE_NOT_FOUND: 2, PATH_NOT_FOUND: 3, ACCESS_DENIED: 5, NOT_SAME_DEVICE: 17, SHARING_VIOLATION: 32, LOCK_VIOLATION: 33,
  PLACEHOLDER: -2, TOO_LONG: -5, STORE_BLOCKED: -6, STORE_DENIED: -7, DISK_FULL: -8,
};
// MAX_PATH: a store path this long or longer is refused before the move (C4).
const MAX_STORE_PATH = 260;

const extOf = (p) => path.extname(String(p || '')).toLowerCase();
const isAccepted = (p) => ACCEPTED_EXTS.has(extOf(p));
const isShortcut = (p) => MOVE_EXTS.has(extOf(p));

function norm(p) {
  return path.resolve(String(p)).replace(/[\\/]+$/, '').toLowerCase();
}
function samePath(a, b) {
  if (!a || !b) return false;
  return norm(a) === norm(b);
}
/** True when `child` is strictly inside `parent` (case-insensitive, Windows). */
function isInside(parent, child) {
  if (!parent || !child) return false;
  const p = norm(parent);
  const c = norm(child);
  return c.length > p.length && c.startsWith(p + path.sep);
}

/**
 * Where a dropped or chosen file goes (spec 5.2). `real` is the file's
 * realpath; `folders` holds the realpaths of the two desktops.
 *   { action: 'move', desktop: 'user' | 'public' }  a top-level .lnk / .url in a desktop folder
 *   { action: 'ref' }                                any other .lnk / .url / .exe (Q11: .exe never moves)
 *   { action: 'reject' }                             anything else
 */
function classify(real, folders) {
  if (!isAccepted(real)) return { action: 'reject' };
  if (!isShortcut(real)) return { action: 'ref' };
  const dir = path.dirname(real);
  if (folders && folders.desktop && samePath(dir, folders.desktop)) return { action: 'move', desktop: 'user' };
  if (folders && folders.publicDesktop && samePath(dir, folders.publicDesktop)) return { action: 'move', desktop: 'public' };
  return { action: 'ref' };
}

/** The reason line for a failed move (tech plan § 3 "Errors mapped"; addendum B9). */
function reasonFor(code, { publicDesktop = false } = {}) {
  if (code === E.STORE_BLOCKED) return STRINGS.reasonStoreBlocked;
  if (code === E.STORE_DENIED) return STRINGS.reasonStoreDenied;
  if (code === E.DISK_FULL) return STRINGS.reasonDiskFull;
  if (code === E.TOO_LONG) return STRINGS.reasonTooLong;
  if (code === E.ACCESS_DENIED) return publicDesktop ? STRINGS.reasonAdmin : STRINGS.reasonDenied;
  if (code === E.SHARING_VIOLATION || code === E.LOCK_VIOLATION) return STRINGS.reasonInUse;
  if (code === E.NOT_SAME_DEVICE) return STRINGS.reasonOtherDrive;
  if (code === E.PLACEHOLDER) return STRINGS.reasonOnlineOnly;
  if (code === E.FILE_NOT_FOUND || code === E.PATH_NOT_FOUND) return STRINGS.reasonMissing;
  return STRINGS.reasonDisk;
}

/**
 * A Node error code from the store step (making the store folder) as the
 * mover's code (C1): something that is not a folder in the way, a denied
 * folder, a full disk; anything else is the catch-all (-1). Only the store
 * step may use the two folder codes.
 */
function storeErrorCode(nodeCode) {
  if (nodeCode === 'EEXIST' || nodeCode === 'ENOTDIR') return E.STORE_BLOCKED;
  if (nodeCode === 'EPERM' || nodeCode === 'EACCES') return E.STORE_DENIED;
  return stepErrorCode(nodeCode);
}
/** Any other step before the move (the journal in the profile folder): a full disk, else the catch-all (C1). */
function stepErrorCode(nodeCode) {
  return nodeCode === 'ENOSPC' ? E.DISK_FULL : -1;
}
/** The OPEN FOLDER box (C1): its reason line only for the three store-step reasons, else none. */
function openFolderFailedBox(code) {
  const known = code === E.STORE_BLOCKED || code === E.STORE_DENIED || code === E.DISK_FULL;
  return { message: STRINGS.openFolderFailed, detail: known ? reasonFor(code) : '' };
}

/** A cloud-only placeholder: refused, never hydrated (tech plan § 3 "OneDrive"). */
function isPlaceholder(attrs) {
  if (attrs == null) return false;
  return (attrs & (0x1000 | 0x40000 | 0x400000)) !== 0; // OFFLINE | RECALL_ON_OPEN | RECALL_ON_DATA_ACCESS
}

/** `Name.lnk`, then `Name (2).lnk`, `Name (3).lnk`, ... (spec 3.4, 5.4: nothing is overwritten). */
function candidateName(fileName, n) {
  if (n <= 1) return fileName;
  const ext = path.extname(fileName);
  const base = fileName.slice(0, fileName.length - ext.length);
  return `${base} (${n})${ext}`;
}

/** The tile name for a shortcut file: its name without the extension. */
function displayName(file) {
  const b = path.basename(String(file || ''));
  const e = path.extname(b);
  return (e ? b.slice(0, -e.length) : b) || b;
}

/** OneDrive roots from the environment (the three variables the sync client sets). */
function oneDriveRoots(env) {
  const e = env || {};
  return ['OneDrive', 'OneDriveConsumer', 'OneDriveCommercial'].map((k) => e[k]).filter((v) => typeof v === 'string' && v.trim());
}
function underOneDrive(desktop, env) {
  return oneDriveRoots(env).some((r) => samePath(r, desktop) || isInside(r, desktop));
}

/**
 * The test-mode guard (--ql-test-desktop=<dir>). Every folder test mode uses
 * must lie inside a temp root, and none may be, hold or sit inside a real
 * desktop, the real store folder or the real profile. `realish` resolves a
 * test path through junctions even when its tail does not exist yet; the real
 * folders are compared as plain paths, so the check never touches them.
 * Returns { ok, reasons[] }.
 */
function testModeCheck({ paths, tempRoots, real, realish = (p) => path.resolve(p) }) {
  const reasons = [];
  const temps = (tempRoots || []).filter(Boolean).map(realish);
  if (!temps.length) reasons.push('no temp folder is known');
  for (const [label, p] of Object.entries(paths || {})) {
    if (!p) { reasons.push(`${label}: no path`); continue; }
    const r = realish(p);
    if (!temps.some((t) => isInside(t, r))) reasons.push(`${label} ${r} is not inside the temp folder`);
    for (const [rl, rp] of Object.entries(real || {})) {
      if (!rp) continue;
      const rr = path.resolve(rp);
      if (samePath(r, rr) || isInside(r, rr) || isInside(rr, r)) reasons.push(`${label} ${r} overlaps the real ${rl} ${rr}`);
    }
  }
  return { ok: reasons.length === 0, reasons };
}

// ── box texts (spec 3.4, 5.2, 5.4, 9.3; addendum B1, B2, B3, B4, B7) ──────
const plural = (n, one, many) => (n === 1 ? one : many);
const quoted = (name) => `“${name}”`;
/** The first 3 names, then "and {n} more" (B1). */
function nameList(list) {
  const names = list.map((f) => f.name);
  const shown = names.slice(0, 3).join(', ');
  return names.length > 3 ? `${shown} and ${names.length - 3} more` : shown;
}
/** The second line: one shared reason, or one "{name}: {reason}" line per listed name (B1). */
function reasonLines(list) {
  const distinct = [...new Set(list.map((f) => f.reason).filter(Boolean))];
  if (distinct.length <= 1) return distinct[0] || '';
  return list.slice(0, 3).map((f) => `${f.name}: ${f.reason}`).join('\n');
}
/** Every failure is a missing file: "where it is now" would be false, so it is left out (B1). */
const allMissing = (list) => list.length > 0 && list.every((f) => f.reason === STRINGS.reasonMissing);
/** "Couldn't move …": one name in quotes, or the count and the list (B1). */
function whatFailed(list, where) {
  return list.length === 1
    ? `Couldn't move ${quoted(list[0].name)} ${where}.`
    : `Couldn't move ${list.length} shortcuts ${where} (${nameList(list)}).`;
}

/** One box per drop or + FILE: the files that did not come off the desktop. */
function moveFailedBox(failures) {
  const n = failures.length;
  const now = allMissing(failures) ? '' : ` ${plural(n, 'It is', 'They are')} still on the desktop.`;
  return { message: `${whatFailed(failures, 'off the desktop')}${now}`, detail: reasonLines(failures) };
}

/**
 * A move back that failed: ↩, Delete, the tile menu, Move all back; or a
 * region delete that kept the region (`regionKept`, with `othersBack` = how
 * many of its shortcuts did go back).
 */
function moveBackFailedBox(failures, { regionKept = false, othersBack = 0 } = {}) {
  const n = failures.length;
  let tail;
  if (regionKept) tail = ' The region was kept.';
  else tail = allMissing(failures) ? '' : ` ${plural(n, 'It is', 'They are')} still in QuickLauncher.`;
  const lines = [reasonLines(failures)];
  if (regionKept && othersBack > 0) lines.push(othersBack === 1 ? '1 other is back on the desktop.' : `${othersBack} others are back on the desktop.`);
  return { message: `${whatFailed(failures, 'back to the desktop')}${tail}`, detail: lines.filter(Boolean).join('\n') };
}

/** The Manager's MOVE TO DESKTOP for a file without a tile (always one file). */
function orphanFailedBox(failure) {
  const now = allMissing([failure]) ? '' : ' It is still in the QuickLauncher Shortcuts folder.';
  return { message: `Couldn't move ${quoted(failure.name)} to the desktop.${now}`, detail: reasonLines([failure]) };
}

/**
 * Move all back (B2). `n` counts shortcuts whose file exists. One region
 * (the region menu, or the Manager when they all sit in one): its name;
 * the Manager with shortcuts in k regions: the number.
 */
function moveAllConfirm(n, { regionName = null, regionCount = 1 } = {}) {
  const leave = regionCount >= 2 || !regionName
    ? `They leave ${regionCount} regions.`
    : `${plural(n, 'It leaves', 'They leave')} ${quoted(regionName)}.`;
  return {
    message: `Move ${n} ${plural(n, 'shortcut', 'shortcuts')} back to the desktop?`,
    detail: `${leave} Names already on the desktop get a number.`,
    buttons: ['Move back', 'Cancel'],
  };
}

function brokenBox(name) {
  return { message: `${quoted(name)} is missing from the QuickLauncher Shortcuts folder.`, buttons: ['Remove tile', 'Keep'] };
}

const movedCountText = (n) => (n === 0 ? 'None moved off the desktop.' : `${n} moved off the desktop.`);
const orphanCountText = (n) => `${n} ${plural(n, 'file', 'files')} without a tile.`;
/** The region notice after a drop with files that are not shortcuts (B7). */
const notShortcutNotice = (n) => (n === 1 ? 'NOT A SHORTCUT' : `${n} FILES ARE NOT SHORTCUTS`);
/** The Manager's ADD BACK tooltip (B5). */
const addBackTip = (regionName) => `Add this shortcut to ${quoted(regionName)}`;

module.exports = {
  MOVE_EXTS, ACCEPTED_EXTS, STRINGS, E, MAX_STORE_PATH,
  extOf, isAccepted, isShortcut, samePath, isInside, classify, reasonFor, isPlaceholder,
  storeErrorCode, stepErrorCode, openFolderFailedBox,
  candidateName, displayName, oneDriveRoots, underOneDrive, testModeCheck,
  moveFailedBox, moveBackFailedBox, orphanFailedBox, moveAllConfirm, brokenBox,
  movedCountText, orphanCountText, notShortcutNotice, addBackTip, nameList,
};
