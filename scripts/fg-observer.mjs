#!/usr/bin/env node
/**
 * fg-observer.mjs: read-only, out-of-process foreground observer for the
 * regions self-test (TechPlan section 7: the 500 ms sampler missed every
 * foreground event a SetParent call caused; this hook sees each one).
 *
 *   node scripts/fg-observer.mjs <out.jsonl> <seconds>
 *
 * Out-of-context WinEvent hooks only (no DLL injection, no input, no window of
 * its own): every foreground change (EVENT_SYSTEM_FOREGROUND) and every
 * top-level show, hide and destroy, as JSON lines with the class name and the
 * process name. The process path is kept only for QuickLauncher.exe, to tell
 * the test build from the installed one. Never a window title. It stops after
 * <seconds> or when <out.jsonl>.stop exists. scripts/fg-verdict.cjs reads it.
 */
import { appendFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const koffi = require(join(HERE, '..', 'node_modules', 'koffi'));
const OUT = process.argv[2];
const SECONDS = Math.max(5, Math.min(1800, Number(process.argv[3] || 300)));
if (!OUT) { console.error('usage: fg-observer.mjs <out.jsonl> <seconds>'); process.exit(2); }
const STOP = `${OUT}.stop`;
const log = (o) => appendFileSync(OUT, `${JSON.stringify({ t: Date.now(), ...o })}\n`);

const u = koffi.load('user32.dll');
const k = koffi.load('kernel32.dll');
const WinEventProc = koffi.proto('void __stdcall QLF_WinEventProc(intptr hook, uint32 ev, intptr hwnd, int32 idObject, int32 idChild, uint32 tid, uint32 time)');
const SetWinEventHook = u.func('intptr __stdcall SetWinEventHook(uint32 eMin, uint32 eMax, intptr hmod, QLF_WinEventProc *cb, uint32 pid, uint32 tid, uint32 flags)');
const UnhookWinEvent = u.func('int __stdcall UnhookWinEvent(intptr h)');
const PeekMessageW = u.func('int __stdcall PeekMessageW(void *msg, intptr hwnd, uint32 min, uint32 max, uint32 remove)');
const DispatchMessageW = u.func('intptr __stdcall DispatchMessageW(void *msg)');
const GetForegroundWindow = u.func('intptr __stdcall GetForegroundWindow()');
const GetWindowThreadProcessId = u.func('uint32 __stdcall GetWindowThreadProcessId(intptr hwnd, void *pid)');
const GetClassNameW = u.func('int __stdcall GetClassNameW(intptr hwnd, void *buf, int max)');
const GetAncestor = u.func('intptr __stdcall GetAncestor(intptr hwnd, uint32 flags)');
const GetDesktopWindow = u.func('intptr __stdcall GetDesktopWindow()');
const IsWindow = u.func('int __stdcall IsWindow(intptr hwnd)');
const IsWindowVisible = u.func('int __stdcall IsWindowVisible(intptr hwnd)');
const OpenProcess = k.func('intptr __stdcall OpenProcess(uint32 access, int inherit, uint32 pid)');
const CloseHandle = k.func('int __stdcall CloseHandle(intptr h)');
const QueryFullProcessImageNameW = k.func('int __stdcall QueryFullProcessImageNameW(intptr h, uint32 flags, void *buf, void *size)');

const hex = (h) => (h ? `0x${BigInt.asUintN(64, BigInt(h)).toString(16)}` : '0');
const DESKTOP = GetDesktopWindow();
const cls = (h) => { const b = Buffer.alloc(512); const n = GetClassNameW(h, b, 256); return n > 0 ? b.toString('utf16le', 0, n * 2) : ''; };
const pidOf = (h) => { const b = Buffer.alloc(4); GetWindowThreadProcessId(h, b); return b.readUInt32LE(0); };
const procs = new Map();
function proc(pid) {
  if (procs.has(pid)) return procs.get(pid);
  let name = '?';
  const h = OpenProcess(0x1000, 0, pid); // PROCESS_QUERY_LIMITED_INFORMATION
  if (h) {
    const buf = Buffer.alloc(2048);
    const size = Buffer.alloc(4);
    size.writeUInt32LE(1024, 0);
    if (QueryFullProcessImageNameW(h, 0, buf, size)) {
      const full = buf.toString('utf16le', 0, size.readUInt32LE(0) * 2);
      name = /quicklauncher\.exe$/i.test(full) ? full : basename(full);
    }
    CloseHandle(h);
  }
  procs.set(pid, name);
  return name;
}
const info = (h) => (h && IsWindow(h)
  ? { h: hex(h), cls: cls(h), proc: proc(pidOf(h)), visible: !!IsWindowVisible(h) }
  : { h: hex(h), alive: false });

const NAMES = { 0x3: 'FOREGROUND', 0x8001: 'DESTROY', 0x8002: 'SHOW', 0x8003: 'HIDE' };
const known = new Map(); // top-level hwnd -> "class|process"
let prev = GetForegroundWindow();
log({ ev: 'start', fg: info(prev) });

const cb = koffi.register((hook, ev, hwnd, idObject, idChild) => {
  try {
    if (ev === 0x3) {
      log({ ev: 'FOREGROUND', now: info(hwnd), prev: info(prev) });
      prev = hwnd;
      return;
    }
    if (idObject !== 0 || idChild !== 0 || !hwnd) return;
    if (ev === 0x8001) {
      const was = known.get(hwnd);
      if (was) { log({ ev: 'DESTROY', h: hex(hwnd), id: was }); known.delete(hwnd); }
      return;
    }
    if (GetAncestor(hwnd, 1) !== DESKTOP) return; // top-level windows only
    const id = `${cls(hwnd)}|${proc(pidOf(hwnd))}`;
    if (ev === 0x8002) known.set(hwnd, id);
    log({ ev: NAMES[ev], h: hex(hwnd), id });
  } catch (e) {
    log({ ev: 'cb-error', error: String(e && e.message) });
  }
}, koffi.pointer(WinEventProc));

const FLAGS = 0x0000 | 0x0002; // WINEVENT_OUTOFCONTEXT | WINEVENT_SKIPOWNPROCESS
const hooks = [SetWinEventHook(0x3, 0x3, 0, cb, 0, 0, FLAGS), SetWinEventHook(0x8001, 0x8003, 0, cb, 0, 0, FLAGS)];
log({ ev: 'hooks', ok: hooks.map((h) => !!h) });
const msg = Buffer.alloc(64);
const end = Date.now() + SECONDS * 1000;
const pump = setInterval(() => {
  while (PeekMessageW(msg, 0, 0, 0, 1)) DispatchMessageW(msg);
  if (Date.now() > end || existsSync(STOP)) {
    clearInterval(pump);
    for (const h of hooks) if (h) UnhookWinEvent(h);
    koffi.unregister(cb);
    log({ ev: 'end', fg: info(GetForegroundWindow()) });
    process.exit(0);
  }
}, 5);
