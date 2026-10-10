'use strict';
// Win32 calls for the desktop layer (koffi FFI, main process only). Ported
// from the 2026-09-30 spike. Everything in the app that touches the shell's
// window tree goes through this module, so the kill switch and the fallback
// live in one place. HWNDs are plain JS numbers (intptr); they fit in 2^53.
//
// If koffi cannot load (blocked by antivirus, missing native package), the
// module still loads: `available` is false and every region runs in the
// fallback window mode.

const { pickHost, DEFVIEW } = require('./pick-host');

let koffi = null;
let loadError = null;
try {
  koffi = require('koffi');
} catch (e) {
  loadError = e;
}

const C = {
  GWL_STYLE: -16, GWL_EXSTYLE: -20,
  WS_CHILD: 0x40000000, WS_POPUP: 0x80000000 | 0, WS_CLIPSIBLINGS: 0x04000000,
  WS_CAPTION: 0x00c00000, WS_THICKFRAME: 0x00040000, WS_SYSMENU: 0x00080000,
  WS_MINIMIZEBOX: 0x00020000, WS_MAXIMIZEBOX: 0x00010000,
  WS_EX_TOOLWINDOW: 0x80, WS_EX_APPWINDOW: 0x40000,
  HWND_TOP: 0, HWND_BOTTOM: 1, HWND_TOPMOST: -1, HWND_NOTOPMOST: -2,
  SWP_NOSIZE: 0x1, SWP_NOMOVE: 0x2, SWP_NOZORDER: 0x4, SWP_NOACTIVATE: 0x10,
  SWP_FRAMECHANGED: 0x20, SWP_SHOWWINDOW: 0x40, SWP_NOOWNERZORDER: 0x200,
  GA_PARENT: 1, GA_ROOT: 2, GW_HWNDNEXT: 2, GW_HWNDPREV: 3, GW_CHILD: 5,
  SW_HIDE: 0, SW_SHOWNA: 8,
};

let W = null;
if (koffi) {
  try {
    const user32 = koffi.load('user32.dll');
    const kernel32 = koffi.load('kernel32.dll');
    koffi.proto('int __stdcall QLR_EnumWindowsProc(intptr hwnd, intptr lParam)');
    W = {
      FindWindowW: user32.func('intptr __stdcall FindWindowW(str16 cls, str16 name)'),
      FindWindowExW: user32.func('intptr __stdcall FindWindowExW(intptr parent, intptr after, str16 cls, str16 name)'),
      EnumWindows: user32.func('int __stdcall EnumWindows(QLR_EnumWindowsProc *cb, intptr lParam)'),
      GetClassNameW: user32.func('int __stdcall GetClassNameW(intptr hwnd, void *buf, int max)'),
      GetWindow: user32.func('intptr __stdcall GetWindow(intptr hwnd, uint32 cmd)'),
      GetAncestor: user32.func('intptr __stdcall GetAncestor(intptr hwnd, uint32 flags)'),
      SetParent: user32.func('intptr __stdcall SetParent(intptr child, intptr parent)'),
      IsWindow: user32.func('int __stdcall IsWindow(intptr hwnd)'),
      IsWindowVisible: user32.func('int __stdcall IsWindowVisible(intptr hwnd)'),
      GetWindowThreadProcessId: user32.func('uint32 __stdcall GetWindowThreadProcessId(intptr hwnd, void *pid)'),
      GetWindowLongW: user32.func('int32 __stdcall GetWindowLongW(intptr hwnd, int idx)'),
      SetWindowLongW: user32.func('int32 __stdcall SetWindowLongW(intptr hwnd, int idx, int32 val)'),
      SetWindowPos: user32.func('int __stdcall SetWindowPos(intptr hwnd, intptr after, int x, int y, int cx, int cy, uint32 flags)'),
      ShowWindow: user32.func('int __stdcall ShowWindow(intptr hwnd, int cmd)'),
      GetWindowRect: user32.func('int __stdcall GetWindowRect(intptr hwnd, void *rect)'),
      MapWindowPoints: user32.func('int __stdcall MapWindowPoints(intptr from, intptr to, void *pts, uint32 n)'),
      GetForegroundWindow: user32.func('intptr __stdcall GetForegroundWindow()'),
      SetForegroundWindow: user32.func('int __stdcall SetForegroundWindow(intptr hwnd)'),
      GetDesktopWindow: user32.func('intptr __stdcall GetDesktopWindow()'),
      SetFocus: user32.func('intptr __stdcall SetFocus(intptr hwnd)'),
      GetLastError: kernel32.func('uint32 __stdcall GetLastError()'),
      SetLastError: kernel32.func('void __stdcall SetLastError(uint32 code)'),
    };
  } catch (e) {
    loadError = e;
    W = null;
  }
}

const available = !!W;
const hex = (h) => (h ? '0x' + h.toString(16) : '0');

function className(hwnd) {
  if (!hwnd) return '';
  const buf = Buffer.alloc(512);
  const n = W.GetClassNameW(hwnd, buf, 256);
  return n > 0 ? buf.toString('utf16le', 0, n * 2) : '';
}

function threadAndPid(hwnd) {
  const pid = Buffer.alloc(4);
  const tid = W.GetWindowThreadProcessId(hwnd, pid);
  return { tid, pid: pid.readUInt32LE(0) };
}

function windowRect(hwnd) {
  const b = Buffer.alloc(16);
  if (!W.GetWindowRect(hwnd, b)) return null;
  const r = { left: b.readInt32LE(0), top: b.readInt32LE(4), right: b.readInt32LE(8), bottom: b.readInt32LE(12) };
  r.width = r.right - r.left;
  r.height = r.bottom - r.top;
  return r;
}

function hwndOf(win) {
  const buf = win.getNativeWindowHandle();
  return Number(buf.length >= 8 ? buf.readBigUInt64LE(0) : buf.readUInt32LE(0));
}

function directChildren(parent) {
  const out = [];
  let h = W.GetWindow(parent, C.GW_CHILD);
  let guard = 0;
  while (h && guard++ < 512) {
    out.push({ hwnd: h, cls: className(h), visible: !!W.IsWindowVisible(h) });
    h = W.GetWindow(h, C.GW_HWNDNEXT);
  }
  return out;
}

function topLevelWindows() {
  const list = [];
  W.EnumWindows((h) => { list.push(h); return 1; }, 0);
  return list;
}

// Snapshot of the shell desktop tree. Read-only; sends no messages to Explorer.
function readDesktopTree() {
  const progman = W.FindWindowW('Progman', null);
  if (!progman) return { progman: 0, progmanChildren: [], workerWs: [] };
  const { tid: shellTid, pid: shellPid } = threadAndPid(progman);
  const workerWs = [];
  for (const h of topLevelWindows()) {
    if (className(h) !== 'WorkerW') continue;
    if (threadAndPid(h).tid !== shellTid) continue; // only Explorer's own desktop WorkerWs
    workerWs.push({ hwnd: h, visible: !!W.IsWindowVisible(h), children: directChildren(h) });
  }
  return { progman, shellTid, shellPid, progmanChildren: directChildren(progman), workerWs };
}

function desktopRoots() {
  const tree = readDesktopTree();
  const set = new Set();
  if (tree.progman) set.add(tree.progman);
  for (const w of tree.workerWs) set.add(w.hwnd);
  return set;
}

function findHost() {
  if (!available) return { ok: false, layout: 'unavailable', reason: `koffi not available: ${loadError && loadError.message}` };
  const tree = readDesktopTree();
  return pickHost(tree);
}

// Screen rect (physical px) -> client coords of `parent`.
function screenToClientRect(parent, r) {
  const pts = Buffer.alloc(16);
  pts.writeInt32LE(r.left, 0); pts.writeInt32LE(r.top, 4);
  pts.writeInt32LE(r.right, 8); pts.writeInt32LE(r.bottom, 12);
  W.MapWindowPoints(0, parent, pts, 2);
  return { x: pts.readInt32LE(0), y: pts.readInt32LE(4), w: r.right - r.left, h: r.bottom - r.top };
}

// Make `hwnd` a WS_CHILD of `host` at `screenRect`, on top of its siblings
// (in front of the icon view). Never activates.
function attachToHost(hwnd, host, screenRect) {
  const oldStyle = W.GetWindowLongW(hwnd, C.GWL_STYLE);
  const strip = C.WS_POPUP | C.WS_CAPTION | C.WS_THICKFRAME | C.WS_SYSMENU | C.WS_MINIMIZEBOX | C.WS_MAXIMIZEBOX;
  const childStyle = (oldStyle & ~strip) | C.WS_CHILD | C.WS_CLIPSIBLINGS;
  W.SetWindowLongW(hwnd, C.GWL_STYLE, childStyle);
  W.SetLastError(0);
  const prev = W.SetParent(hwnd, host);
  const err = W.GetLastError();
  if (!prev && err) {
    W.SetWindowLongW(hwnd, C.GWL_STYLE, oldStyle);
    return { ok: false, error: `SetParent failed, GetLastError=${err}` };
  }
  const rc = screenToClientRect(host, screenRect);
  W.SetWindowPos(hwnd, C.HWND_TOP, rc.x, rc.y, rc.w, rc.h, C.SWP_NOACTIVATE | C.SWP_FRAMECHANGED | C.SWP_NOOWNERZORDER);
  const parent = W.GetAncestor(hwnd, C.GA_PARENT);
  if (parent !== host) return { ok: false, error: `parent after SetParent is ${hex(parent)}, expected ${hex(host)}` };
  return { ok: true, prevParent: prev };
}

// Move/resize a child window: screen rect (physical px) mapped into the host's client area.
function setChildRect(hwnd, host, screenRect) {
  const rc = screenToClientRect(host, screenRect);
  return !!W.SetWindowPos(hwnd, 0, rc.x, rc.y, rc.w, rc.h, C.SWP_NOZORDER | C.SWP_NOACTIVATE | C.SWP_NOOWNERZORDER);
}

// Move/resize a top-level window (fallback mode), screen coords.
function setTopLevelRect(hwnd, screenRect) {
  return !!W.SetWindowPos(hwnd, 0, screenRect.left, screenRect.top, screenRect.right - screenRect.left,
    screenRect.bottom - screenRect.top, C.SWP_NOZORDER | C.SWP_NOACTIVATE | C.SWP_NOOWNERZORDER);
}

function isAboveDefView(hwnd, host) {
  const kids = directChildren(host);
  const me = kids.findIndex((c) => c.hwnd === hwnd);
  const dv = kids.findIndex((c) => c.cls === DEFVIEW);
  return { me, defView: dv, above: me >= 0 && (dv < 0 || me < dv) };
}

function raiseAmongSiblings(hwnd) {
  return !!W.SetWindowPos(hwnd, C.HWND_TOP, 0, 0, 0, 0, C.SWP_NOMOVE | C.SWP_NOSIZE | C.SWP_NOACTIVATE | C.SWP_NOOWNERZORDER);
}

// Drag-only ordering of an attached desktop child. Never promote a top-level
// fallback window above applications, activate a window or set global topmost.
function beginDragRaise(hwnd, host) {
  if (!available || !hwnd || !host || !W.IsWindow(hwnd) || !W.IsWindow(host)
      || W.GetAncestor(hwnd, C.GA_PARENT) !== host
      || !(W.GetWindowLongW(hwnd, C.GWL_STYLE) & C.WS_CHILD)) return null;
  const order = { hwnd, host, previous: W.GetWindow(hwnd, C.GW_HWNDPREV), next: W.GetWindow(hwnd, C.GW_HWNDNEXT) };
  return raiseAmongSiblings(hwnd) ? order : null;
}

function endDragRaise(order) {
  if (!available || !order || !W.IsWindow(order.hwnd) || !W.IsWindow(order.host)
      || W.GetAncestor(order.hwnd, C.GA_PARENT) !== order.host) return false;
  const sibling = (hwnd) => hwnd && W.IsWindow(hwnd) && W.GetAncestor(hwnd, C.GA_PARENT) === order.host;
  let after = order.previous;
  if (after && !sibling(after)) {
    if (!sibling(order.next)) return false;
    after = W.GetWindow(order.next, C.GW_HWNDPREV);
    if (after === order.hwnd) return true;
    if (after && !sibling(after)) return false;
  }
  return !!W.SetWindowPos(order.hwnd, after || C.HWND_TOP, 0, 0, 0, 0,
    C.SWP_NOMOVE | C.SWP_NOSIZE | C.SWP_NOACTIVATE | C.SWP_NOOWNERZORDER);
}

// The window just above the topmost visible desktop root, so a top-level
// fallback window lands on top of the desktop and under everything else.
function insertAfterForBottomOfNormalBand(selfHwnd) {
  const roots = desktopRoots();
  const list = topLevelWindows().filter((h) => h !== selfHwnd);
  const i = list.findIndex((h) => roots.has(h) && W.IsWindowVisible(h));
  if (i < 0) return C.HWND_BOTTOM;
  return i === 0 ? C.HWND_TOP : list[i - 1];
}

// Windows' SetParent ACTIVATES a top-level window it moves, even a hidden one,
// and that can take the foreground from Sergei's app (TechPlan section 7.1,
// measured). So a window that already is top-level is never re-parented. A
// desktop child still is, and while it carries WS_CHILD (the style changes
// only after the call), which a child cannot be activated with.
function toTopLevelParent(hwnd) {
  if (W.GetAncestor(hwnd, C.GA_PARENT) === W.GetDesktopWindow()) return false;
  W.SetParent(hwnd, 0);
  return true;
}

// Fallback: an ordinary top-level tool window sunk to just above the desktop,
// never activated. `show` false keeps it hidden.
function detachToTopLevel(hwnd, screenRect, { show = true } = {}) {
  W.ShowWindow(hwnd, C.SW_HIDE);
  toTopLevelParent(hwnd);
  const style = W.GetWindowLongW(hwnd, C.GWL_STYLE);
  W.SetWindowLongW(hwnd, C.GWL_STYLE, (style & ~C.WS_CHILD) | C.WS_POPUP);
  const ex = W.GetWindowLongW(hwnd, C.GWL_EXSTYLE);
  W.SetWindowLongW(hwnd, C.GWL_EXSTYLE, (ex | C.WS_EX_TOOLWINDOW) & ~C.WS_EX_APPWINDOW);
  const after = insertAfterForBottomOfNormalBand(hwnd);
  // Position, z-slot and show in ONE call: a separate ShowWindow on a hidden
  // top-level window lifts it to the top of the normal band (spike note 4).
  W.SetWindowPos(hwnd, after, screenRect.left, screenRect.top, screenRect.right - screenRect.left,
    screenRect.bottom - screenRect.top,
    C.SWP_NOACTIVATE | C.SWP_FRAMECHANGED | C.SWP_NOOWNERZORDER | (show ? C.SWP_SHOWWINDOW : 0));
  const topLevel = W.GetAncestor(hwnd, C.GA_PARENT) === W.GetDesktopWindow();
  return { ok: topLevel && !(W.GetWindowLongW(hwnd, C.GWL_STYLE) & C.WS_CHILD), insertAfter: after };
}

// Show a fallback window again in its slot just above the desktop (one call, see above).
function showTopLevelAtBottom(hwnd) {
  const after = insertAfterForBottomOfNormalBand(hwnd);
  return !!W.SetWindowPos(hwnd, after, 0, 0, 0, 0,
    C.SWP_NOMOVE | C.SWP_NOSIZE | C.SWP_NOACTIVATE | C.SWP_NOOWNERZORDER | C.SWP_SHOWWINDOW);
}

function showNoActivate(hwnd) { return !!W.ShowWindow(hwnd, C.SW_SHOWNA); }
function hide(hwnd) { return !!W.ShowWindow(hwnd, C.SW_HIDE); }

// Temporary foreground mode touches only this process's region HWND. Restore
// tokens are tied to its thread/process and are never used on a replacement.
function ownedWindow(hwnd) {
  return !!(available && hwnd && W.IsWindow(hwnd) && threadAndPid(hwnd).pid === process.pid);
}
function clearTopmost(hwnd) {
  return ownedWindow(hwnd) && !!W.SetWindowPos(hwnd, C.HWND_NOTOPMOST, 0, 0, 0, 0,
    C.SWP_NOMOVE | C.SWP_NOSIZE | C.SWP_NOACTIVATE | C.SWP_NOOWNERZORDER);
}
function captureForeground(hwnd) {
  if (!ownedWindow(hwnd)) return null;
  const parent = W.GetAncestor(hwnd, C.GA_PARENT);
  return { hwnd, ...threadAndPid(hwnd), parent,
    style: W.GetWindowLongW(hwnd, C.GWL_STYLE), exStyle: W.GetWindowLongW(hwnd, C.GWL_EXSTYLE),
    previous: W.GetWindow(hwnd, C.GW_HWNDPREV), next: W.GetWindow(hwnd, C.GW_HWNDNEXT) };
}
function beginForeground(hwnd, rect, saved = captureForeground(hwnd)) {
  if (!saved || !ownedWindow(hwnd)) return null;
  const identity = threadAndPid(hwnd);
  if (saved.hwnd !== hwnd || saved.pid !== identity.pid || saved.tid !== identity.tid
      || saved.parent !== W.GetAncestor(hwnd, C.GA_PARENT)) return null;
  const detached = detachToTopLevel(hwnd, rect, { show: false });
  if (!detached.ok || !W.SetWindowPos(hwnd, C.HWND_TOPMOST, rect.left, rect.top,
      rect.right - rect.left, rect.bottom - rect.top,
      C.SWP_NOACTIVATE | C.SWP_NOOWNERZORDER | C.SWP_SHOWWINDOW)) {
    // The host owns rollback so it also restores Chromium visibility and its
    // attachment mode; native restoration alone would leave that state stale.
    return { ...saved, failed: true };
  }
  return saved;
}
function restoreForeground(saved, rect) {
  if (!saved || !ownedWindow(saved.hwnd)) return { ok: false };
  const identity = threadAndPid(saved.hwnd);
  if (identity.pid !== saved.pid || identity.tid !== saved.tid) return { ok: false };
  const hwnd = saved.hwnd;
  W.ShowWindow(hwnd, C.SW_HIDE);
  if (!clearTopmost(hwnd)) return { ok: false };
  let host = 0;
  if (saved.style & C.WS_CHILD) {
    // Explorer may have replaced its window tree while the regions were out.
    const pick = findHost();
    if (pick.ok) host = pick.host;
    if (host) {
      const result = attachToHost(hwnd, host, rect);
      if (result.ok) {
        W.SetWindowLongW(hwnd, C.GWL_STYLE, saved.style);
        W.SetWindowLongW(hwnd, C.GWL_EXSTYLE, saved.exStyle);
        setChildRect(hwnd, host, rect);
        if (host === saved.parent) endDragRaise({ hwnd, host, previous: saved.previous, next: saved.next });
        return { ok: true, host, attached: true };
      }
    }
  }
  const result = detachToTopLevel(hwnd, rect, { show: false });
  return { ok: result.ok, host: 0, attached: false };
}
function foregroundToken() {
  if (!available) return null;
  const hwnd = W.GetForegroundWindow();
  return hwnd && W.IsWindow(hwnd) ? { hwnd, ...threadAndPid(hwnd) } : null;
}
function returnFocus(token, regionHwnds) {
  if (!available || !token || !W.IsWindow(token.hwnd) || !W.IsWindowVisible(token.hwnd)) return false;
  const identity = threadAndPid(token.hwnd);
  if (identity.pid !== token.pid || identity.tid !== token.tid || token.pid === process.pid) return false;
  const current = W.GetForegroundWindow();
  if (!regionHwnds.some(hwnd => ownedWindow(hwnd) && hwnd === current)) return false;
  // Never steal focus from an app launched during the foreground session.
  return !!W.SetForegroundWindow(token.hwnd);
}

// Before quitting: take the window out of Explorer's tree so Explorer never
// holds a child from a dying process.
function releaseFromShell(hwnd) {
  if (!available || !W.IsWindow(hwnd)) return false;
  W.ShowWindow(hwnd, C.SW_HIDE);
  toTopLevelParent(hwnd); // a fallback window is already out of the shell's tree
  const style = W.GetWindowLongW(hwnd, C.GWL_STYLE);
  W.SetWindowLongW(hwnd, C.GWL_STYLE, (style & ~C.WS_CHILD) | C.WS_POPUP);
  return true;
}

/**
 * Keyboard focus for a desktop child (spike note 3): Windows activates the
 * desktop on a click but does not give our child keyboard focus. Give it,
 * but only when the desktop already is the foreground window (the user just
 * clicked us), so this can never take focus from another app.
 */
function focusIfDesktopForeground(hwnd) {
  if (!available || !hwnd || !W.IsWindow(hwnd)) return false;
  const fg = W.GetForegroundWindow();
  const root = W.GetAncestor(hwnd, C.GA_ROOT);
  if (!fg || fg !== root || root === hwnd) return false;
  W.SetFocus(hwnd);
  return true;
}

/** Read-only facts about one window, for logs and the self-test. */
function describe(hwnd) {
  if (!available || !hwnd || !W.IsWindow(hwnd)) return { alive: false };
  const parent = W.GetAncestor(hwnd, C.GA_PARENT);
  const style = W.GetWindowLongW(hwnd, C.GWL_STYLE);
  const rect = windowRect(hwnd);
  const out = {
    alive: true, hwnd: hex(hwnd), parent: hex(parent), parentClass: className(parent),
    child: !!(style & C.WS_CHILD), visible: !!W.IsWindowVisible(hwnd), rect,
  };
  if (out.child) out.z = isAboveDefView(hwnd, parent);
  return out;
}

module.exports = {
  available, loadError, C, hex, className, hwndOf, findHost, attachToHost, setChildRect, setTopLevelRect,
  isAboveDefView, raiseAmongSiblings, beginDragRaise, endDragRaise, detachToTopLevel, showTopLevelAtBottom, showNoActivate, hide,
  releaseFromShell, focusIfDesktopForeground, describe,
  captureForeground, beginForeground, restoreForeground, clearTopmost, foregroundToken, returnFocus,
  isWindow: (h) => !!(available && h && W.IsWindow(h)),
  parentOf: (h) => (available ? W.GetAncestor(h, C.GA_PARENT) : 0),
  hasDefView: (host) => !!(available && W.FindWindowExW(host, 0, DEFVIEW, null)),
};
