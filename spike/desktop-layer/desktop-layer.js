'use strict';
// Win32 helpers for the desktop-layer spike (koffi FFI, main process only).
// Everything that touches the shell's window tree lives here, behind small
// functions, so the real app can swap or kill-switch it in one place.
//
// HWNDs are carried as plain JS numbers (intptr); they fit in 2^53.

const koffi = require('koffi');
const { pickHost, DEFVIEW } = require('./pick-host');

const user32 = koffi.load('user32.dll');
const gdi32 = koffi.load('gdi32.dll');
const kernel32 = koffi.load('kernel32.dll');
const dwmapi = koffi.load('dwmapi.dll');

const POINT = koffi.struct('QL_POINT', { x: 'int32', y: 'int32' });
const EnumWindowsProc = koffi.proto('int __stdcall QL_EnumWindowsProc(intptr hwnd, intptr lParam)');

const W = {
  FindWindowW: user32.func('intptr __stdcall FindWindowW(str16 cls, str16 name)'),
  FindWindowExW: user32.func('intptr __stdcall FindWindowExW(intptr parent, intptr after, str16 cls, str16 name)'),
  EnumWindows: user32.func('int __stdcall EnumWindows(QL_EnumWindowsProc *cb, intptr lParam)'),
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
  WindowFromPoint: user32.func('intptr __stdcall WindowFromPoint(QL_POINT pt)'),
  GetForegroundWindow: user32.func('intptr __stdcall GetForegroundWindow()'),
  GetDesktopWindow: user32.func('intptr __stdcall GetDesktopWindow()'),
  SetFocus: user32.func('intptr __stdcall SetFocus(intptr hwnd)'),
  GetFocus: user32.func('intptr __stdcall GetFocus()'),
  PostMessageW: user32.func('int __stdcall PostMessageW(intptr hwnd, uint32 msg, uintptr wp, intptr lp)'),
  SendMessageTimeoutW: user32.func('intptr __stdcall SendMessageTimeoutW(intptr hwnd, uint32 msg, uintptr wp, intptr lp, uint32 flags, uint32 timeout, void *result)'),
  GetDpiForWindow: user32.func('uint32 __stdcall GetDpiForWindow(intptr hwnd)'),
  IsIconic: user32.func('int __stdcall IsIconic(intptr hwnd)'),
  DwmGetWindowAttribute: dwmapi.func('int32 __stdcall DwmGetWindowAttribute(intptr hwnd, uint32 attr, void *pv, uint32 cb)'),
  GetDC: user32.func('intptr __stdcall GetDC(intptr hwnd)'),
  ReleaseDC: user32.func('int __stdcall ReleaseDC(intptr hwnd, intptr hdc)'),
  CreateCompatibleDC: gdi32.func('intptr __stdcall CreateCompatibleDC(intptr hdc)'),
  CreateCompatibleBitmap: gdi32.func('intptr __stdcall CreateCompatibleBitmap(intptr hdc, int w, int h)'),
  SelectObject: gdi32.func('intptr __stdcall SelectObject(intptr hdc, intptr obj)'),
  BitBlt: gdi32.func('int __stdcall BitBlt(intptr dst, int x, int y, int w, int h, intptr src, int sx, int sy, uint32 rop)'),
  GetDIBits: gdi32.func('int __stdcall GetDIBits(intptr hdc, intptr bmp, uint32 start, uint32 lines, void *bits, void *bmi, uint32 usage)'),
  DeleteObject: gdi32.func('int __stdcall DeleteObject(intptr obj)'),
  DeleteDC: gdi32.func('int __stdcall DeleteDC(intptr hdc)'),
  GetLastError: kernel32.func('uint32 __stdcall GetLastError()'),
  SetLastError: kernel32.func('void __stdcall SetLastError(uint32 code)'),
};

const C = {
  GWL_STYLE: -16, GWL_EXSTYLE: -20,
  WS_CHILD: 0x40000000, WS_POPUP: 0x80000000 | 0, WS_VISIBLE: 0x10000000,
  WS_CLIPSIBLINGS: 0x04000000, WS_CAPTION: 0x00c00000, WS_THICKFRAME: 0x00040000,
  WS_SYSMENU: 0x00080000, WS_MINIMIZEBOX: 0x00020000, WS_MAXIMIZEBOX: 0x00010000,
  WS_EX_TOOLWINDOW: 0x80, WS_EX_APPWINDOW: 0x40000, WS_EX_LAYERED: 0x80000,
  WS_EX_NOREDIRECTIONBITMAP: 0x00200000, WS_EX_TRANSPARENT: 0x20, WS_EX_NOACTIVATE: 0x08000000,
  HWND_TOP: 0, HWND_BOTTOM: 1,
  SWP_NOSIZE: 0x1, SWP_NOMOVE: 0x2, SWP_NOZORDER: 0x4, SWP_NOACTIVATE: 0x10,
  SWP_FRAMECHANGED: 0x20, SWP_SHOWWINDOW: 0x40, SWP_NOOWNERZORDER: 0x200,
  GA_PARENT: 1, GA_ROOT: 2, GW_HWNDNEXT: 2, GW_HWNDPREV: 3, GW_OWNER: 4, GW_CHILD: 5,
  WS_EX_TOPMOST: 0x8, DWMWA_CLOAKED: 14,
  SW_HIDE: 0, SW_SHOWNA: 8,
  WM_NCHITTEST: 0x84, WM_MOUSEMOVE: 0x200, WM_LBUTTONDOWN: 0x201, WM_LBUTTONUP: 0x202, MK_LBUTTON: 1,
  SMTO_ABORTIFHUNG: 0x2, HTCLIENT: 1,
};

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

// Top-level windows in z-order, topmost first.
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
    const t = threadAndPid(h);
    if (t.tid !== shellTid) continue; // only Explorer's own desktop WorkerWs
    workerWs.push({ hwnd: h, visible: !!W.IsWindowVisible(h), children: directChildren(h) });
  }
  return {
    progman,
    shellTid,
    shellPid,
    progmanVisible: !!W.IsWindowVisible(progman),
    progmanRect: windowRect(progman),
    progmanChildren: directChildren(progman),
    workerWs,
  };
}

function describeTree(tree) {
  if (!tree.progman) return 'no Progman';
  const kid = (c) => `${c.cls}${c.visible ? '' : '(hidden)'}`;
  const parts = [`Progman ${hex(tree.progman)} {${tree.progmanChildren.map(kid).join(', ')}}`];
  for (const w of tree.workerWs) parts.push(`WorkerW ${hex(w.hwnd)}${w.visible ? '' : '(hidden)'} {${w.children.map(kid).join(', ')}}`);
  return parts.join(' | ');
}

// Desktop roots = Progman plus Explorer's top-level WorkerWs.
function desktopRoots() {
  const tree = readDesktopTree();
  const set = new Set();
  if (tree.progman) set.add(tree.progman);
  for (const w of tree.workerWs) set.add(w.hwnd);
  return set;
}

function findHost({ simulateUnknown = false } = {}) {
  if (simulateUnknown) return { ok: false, layout: 'unknown', reason: 'simulated unknown layout' };
  const tree = readDesktopTree();
  const pick = pickHost(tree);
  pick.tree = tree;
  return pick;
}

// Screen rect (physical px) -> client coords of `parent`.
function screenToClientRect(parent, r) {
  const pts = Buffer.alloc(16);
  pts.writeInt32LE(r.left, 0); pts.writeInt32LE(r.top, 4);
  pts.writeInt32LE(r.right, 8); pts.writeInt32LE(r.bottom, 12);
  W.MapWindowPoints(0, parent, pts, 2);
  return { x: pts.readInt32LE(0), y: pts.readInt32LE(4), w: r.right - r.left, h: r.bottom - r.top };
}

// Make `hwnd` a WS_CHILD of `host`, at `screenRect`, on top of its siblings
// (i.e. in front of the icon view). Never activates.
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
  return { ok: true, prevParent: prev, style: childStyle >>> 0 };
}

// Index of `hwnd` among `parent`'s children (0 = topmost), -1 if absent.
function siblingIndex(parent, hwnd) {
  return directChildren(parent).findIndex((c) => c.hwnd === hwnd);
}

// Is the panel above (in front of) the icon view among host's children?
function isAboveDefView(hwnd, host) {
  const kids = directChildren(host);
  const me = kids.findIndex((c) => c.hwnd === hwnd);
  const dv = kids.findIndex((c) => c.cls === DEFVIEW);
  return { me, defView: dv, above: me >= 0 && (dv < 0 || me < dv) };
}

function raiseAmongSiblings(hwnd) {
  return !!W.SetWindowPos(hwnd, C.HWND_TOP, 0, 0, 0, 0, C.SWP_NOMOVE | C.SWP_NOSIZE | C.SWP_NOACTIVATE | C.SWP_NOOWNERZORDER);
}

// The window just above the lowest desktop root, so a top-level fallback
// window lands directly on top of the desktop and under everything else.
function insertAfterForBottomOfNormalBand(selfHwnd) {
  const roots = desktopRoots();
  const list = topLevelWindows().filter((h) => h !== selfHwnd);
  // Topmost VISIBLE desktop root (Progman on 24H2+, the icon WorkerW on classic).
  const i = list.findIndex((h) => roots.has(h) && W.IsWindowVisible(h));
  if (i < 0) return C.HWND_BOTTOM;
  return i === 0 ? C.HWND_TOP : list[i - 1];
}

// Clean fallback: an ordinary top-level tool window, sunk to just above the
// desktop, never activated. Used when no known desktop layout is found.
function detachToTopLevel(hwnd, screenRect) {
  W.ShowWindow(hwnd, C.SW_HIDE);
  W.SetParent(hwnd, 0);
  const style = W.GetWindowLongW(hwnd, C.GWL_STYLE);
  W.SetWindowLongW(hwnd, C.GWL_STYLE, (style & ~C.WS_CHILD) | C.WS_POPUP);
  const ex = W.GetWindowLongW(hwnd, C.GWL_EXSTYLE);
  W.SetWindowLongW(hwnd, C.GWL_EXSTYLE, (ex | C.WS_EX_TOOLWINDOW) & ~C.WS_EX_APPWINDOW);
  const after = insertAfterForBottomOfNormalBand(hwnd);
  // Position, z-slot and show in ONE call: a separate ShowWindow(SW_SHOWNA)
  // on a hidden top-level window lifts it to the top of the normal band
  // (measured: z index 502 -> 79), i.e. over Sergei's windows.
  W.SetWindowPos(hwnd, after, screenRect.left, screenRect.top, screenRect.right - screenRect.left,
    screenRect.bottom - screenRect.top, C.SWP_NOACTIVATE | C.SWP_FRAMECHANGED | C.SWP_NOOWNERZORDER | C.SWP_SHOWWINDOW);
  const topLevel = W.GetAncestor(hwnd, C.GA_PARENT) === W.GetDesktopWindow();
  return { ok: topLevel && !(W.GetWindowLongW(hwnd, C.GWL_STYLE) & C.WS_CHILD), insertAfter: after };
}

// Before quitting: take the panel out of Explorer's tree so Explorer never
// holds a child from a dying process.
function releaseFromShell(hwnd) {
  if (!W.IsWindow(hwnd)) return false;
  W.ShowWindow(hwnd, C.SW_HIDE);
  W.SetParent(hwnd, 0);
  const style = W.GetWindowLongW(hwnd, C.GWL_STYLE);
  W.SetWindowLongW(hwnd, C.GWL_STYLE, (style & ~C.WS_CHILD) | C.WS_POPUP);
  return true;
}

function isCloaked(hwnd) {
  const b = Buffer.alloc(4);
  return W.DwmGetWindowAttribute(hwnd, C.DWMWA_CLOAKED, b, 4) === 0 && b.readUInt32LE(0) !== 0;
}

const SHELL_CHROME = new Set(['Progman', 'WorkerW', 'Shell_TrayWnd', 'Shell_SecondaryTrayWnd']);

// One pass over the top-level z-order (topmost first): how many ordinary app
// windows (Alt+Tab-like: unowned or WS_EX_APPWINDOW, not tool windows) are
// showing / minimised / cloaked / topmost, and whether a desktop root sits
// above the first ordinary showing one. Reads window STATE only - class,
// style, owner, cloak, minimised, rect - never titles, never pixels.
function windowScene(roots, selfPid) {
  const apps = { shown: 0, min: 0, cloaked: 0, topmost: 0 };
  let firstAppZ = -1;
  let desktopZ = -1;
  const list = topLevelWindows();
  for (let i = 0; i < list.length; i++) {
    const h = list[i];
    if (!W.IsWindowVisible(h)) continue;
    if (roots.has(h)) { if (desktopZ < 0) desktopZ = i; continue; }
    if (SHELL_CHROME.has(className(h))) continue;
    if (threadAndPid(h).pid === selfPid) continue;
    const ex = W.GetWindowLongW(h, C.GWL_EXSTYLE);
    const owned = !!W.GetWindow(h, C.GW_OWNER);
    if (!(ex & C.WS_EX_APPWINDOW) && (owned || (ex & C.WS_EX_TOOLWINDOW))) continue;
    if (isCloaked(h)) { apps.cloaked++; continue; }
    if (W.IsIconic(h)) { apps.min++; continue; }
    const r = windowRect(h);
    if (!r || r.width <= 0 || r.height <= 0) continue;
    if (ex & C.WS_EX_TOPMOST) { apps.topmost++; continue; }
    apps.shown++;
    if (firstAppZ < 0) firstAppZ = i;
  }
  return {
    apps, firstAppZ, desktopZ, topLevel: list.length,
    desktopAboveApps: desktopZ >= 0 && firstAppZ >= 0 && desktopZ < firstAppZ,
  };
}

// GDI copy of a screen rect (physical px), BGRA top-down. Reads only that rect.
function captureRect(x, y, w, h) {
  const screen = W.GetDC(0);
  const mem = W.CreateCompatibleDC(screen);
  const bmp = W.CreateCompatibleBitmap(screen, w, h);
  const old = W.SelectObject(mem, bmp);
  W.BitBlt(mem, 0, 0, w, h, screen, x, y, 0x00cc0020 | 0x40000000); // SRCCOPY | CAPTUREBLT
  W.SelectObject(mem, old);
  const bmi = Buffer.alloc(44);
  bmi.writeUInt32LE(40, 0); bmi.writeInt32LE(w, 4); bmi.writeInt32LE(-h, 8);
  bmi.writeUInt16LE(1, 12); bmi.writeUInt16LE(32, 14); bmi.writeUInt32LE(0, 16);
  const bits = Buffer.alloc(w * h * 4);
  const lines = W.GetDIBits(mem, bmp, 0, h, bits, bmi, 0);
  W.DeleteObject(bmp); W.DeleteDC(mem); W.ReleaseDC(0, screen);
  return { ok: lines === h, w, h, bits };
}

function pixel(cap, x, y) {
  const i = (y * cap.w + x) * 4;
  return { r: cap.bits[i + 2], g: cap.bits[i + 1], b: cap.bits[i] };
}

module.exports = {
  W, C, hex, className, threadAndPid, windowRect, hwndOf, directChildren, topLevelWindows,
  readDesktopTree, describeTree, desktopRoots, findHost, attachToHost, siblingIndex,
  isAboveDefView, raiseAmongSiblings, detachToTopLevel, releaseFromShell, captureRect, pixel,
  isCloaked, windowScene,
};
