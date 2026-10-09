'use strict';
// Win32 calls for the safe file move (tech plan § 3), through koffi. Main
// process only; nothing else in the move code calls Win32.
//
// The one file operation here is MoveFileExW with MOVEFILE_WRITE_THROUGH and
// nothing else: no MOVEFILE_REPLACE_EXISTING (so it fails when the target
// exists) and no MOVEFILE_COPY_ALLOWED (so it fails across volumes instead of
// copying). It is an atomic same-volume rename or it is nothing. This module
// has no delete, copy or overwrite of any kind (test/regions/moves-never-delete
// scans it).
//
// If koffi cannot load, the module still loads: `available` is false and the
// app runs with references only ("Moving is unavailable").

let koffi = null;
let loadError = null;
try {
  koffi = require('koffi');
} catch (e) {
  loadError = e;
}

const MOVEFILE_WRITE_THROUGH = 0x8;
// The only flags MoveFileExW is ever called with.
const MOVE_FLAGS = MOVEFILE_WRITE_THROUGH;

const ATTR = Object.freeze({
  READONLY: 0x1, HIDDEN: 0x2, SYSTEM: 0x4, DIRECTORY: 0x10, OFFLINE: 0x1000,
  RECALL_ON_OPEN: 0x40000, RECALL_ON_DATA_ACCESS: 0x400000, INVALID: 0xffffffff,
});

const ERR = Object.freeze({
  FILE_NOT_FOUND: 2, PATH_NOT_FOUND: 3, ACCESS_DENIED: 5, NOT_SAME_DEVICE: 17,
  SHARING_VIOLATION: 32, LOCK_VIOLATION: 33, FILE_EXISTS: 80, ALREADY_EXISTS: 183,
});

const FOLDERID = Object.freeze({
  Desktop: '{B4BFCC3A-DB2C-424C-B029-7FE99A87C641}',
  PublicDesktop: '{C4AA340D-F20F-4863-AFEF-F87EF2E6BA25}',
});

let W = null;
if (koffi) {
  try {
    const kernel32 = koffi.load('kernel32.dll');
    const shell32 = koffi.load('shell32.dll');
    const ole32 = koffi.load('ole32.dll');
    W = {
      MoveFileExW: kernel32.func('int __stdcall MoveFileExW(str16 src, str16 dst, uint32 flags)'),
      GetFileAttributesW: kernel32.func('uint32 __stdcall GetFileAttributesW(str16 name)'),
      GetLastError: kernel32.func('uint32 __stdcall GetLastError()'),
      SetLastError: kernel32.func('void __stdcall SetLastError(uint32 code)'),
      CreateFileW: kernel32.func('intptr __stdcall CreateFileW(str16 name, uint32 access, uint32 share, intptr security, uint32 disposition, uint32 flags, intptr templateFile)'),
      GetFileInformationByHandleEx: kernel32.func('int __stdcall GetFileInformationByHandleEx(intptr file, int infoClass, _Out_ void *info, uint32 size)'),
      CloseHandle: kernel32.func('int __stdcall CloseHandle(intptr file)'),
      SHGetKnownFolderPath: shell32.func('int32 __stdcall SHGetKnownFolderPath(void *rfid, uint32 flags, intptr token, _Out_ void **path)'),
      CoTaskMemFree: ole32.func('void __stdcall CoTaskMemFree(void *pv)'),
    };
  } catch (e) {
    loadError = e;
    W = null;
  }
}

const available = !!W;

function guidBytes(s) {
  const h = String(s).replace(/[{}-]/g, '');
  const b = Buffer.alloc(16);
  b.writeUInt32LE(parseInt(h.slice(0, 8), 16), 0);
  b.writeUInt16LE(parseInt(h.slice(8, 12), 16), 4);
  b.writeUInt16LE(parseInt(h.slice(12, 16), 16), 6);
  for (let i = 0; i < 8; i++) b[8 + i] = parseInt(h.slice(16 + i * 2, 18 + i * 2), 16);
  return b;
}

/**
 * Same-volume rename that never replaces and never copies.
 * Returns { ok: true } or { ok: false, code } (the Win32 error).
 */
function moveFileNoReplace(src, dst) {
  if (!available) return { ok: false, code: -1 };
  W.SetLastError(0);
  const ok = W.MoveFileExW(String(src), String(dst), MOVE_FLAGS);
  if (ok) return { ok: true };
  return { ok: false, code: W.GetLastError() || -1 };
}

/** File attributes, or null when the path does not exist or cannot be read. Never opens the file. */
function attributes(p) {
  if (!available) return null;
  const a = W.GetFileAttributesW(String(p));
  return a === ATTR.INVALID ? null : a >>> 0;
}

// Read metadata only, without following a reparse point or opening contents.
// The creation time distinguishes recycled IDs; callers retain ambiguity as
// broken state rather than substituting a file merely sharing its old path.
function fileIdentity(p) {
  if (!available) return null;
  const attrs = attributes(p);
  if (attrs == null || (attrs & (ATTR.DIRECTORY | ATTR.OFFLINE | ATTR.RECALL_ON_OPEN | ATTR.RECALL_ON_DATA_ACCESS | 0x400))) return null;
  const file = W.CreateFileW(String(p), 0x80, 7, 0, 3, 0x200000, 0);
  if (file === -1 || !file) return null;
  try {
    const id = Buffer.alloc(24), basic = Buffer.alloc(40);
    if (!W.GetFileInformationByHandleEx(file, 18, id, id.length) || !W.GetFileInformationByHandleEx(file, 0, basic, basic.length)) return null;
    if (basic.readUInt32LE(32) & (ATTR.DIRECTORY | ATTR.OFFLINE | ATTR.RECALL_ON_OPEN | ATTR.RECALL_ON_DATA_ACCESS | 0x400)) return null;
    if (id.subarray(8).every(b => b === 0)) return null;
    return { volume: id.readBigUInt64LE(0).toString(16), id: id.subarray(8).toString('hex'), created: basic.readBigUInt64LE(0).toString(16) };
  } finally { W.CloseHandle(file); }
}

/** SHGetKnownFolderPath: the real folder (OneDrive-redirected or not), or null. */
function knownFolder(name) {
  if (!available || !FOLDERID[name]) return null;
  const out = [null];
  const hr = W.SHGetKnownFolderPath(guidBytes(FOLDERID[name]), 0, 0, out);
  if (hr !== 0 || !out[0]) return null;
  try {
    return koffi.decode(out[0], 'char16_t', -1) || null;
  } finally {
    W.CoTaskMemFree(out[0]);
  }
}

module.exports = { available, loadError, MOVE_FLAGS, ATTR, ERR, FOLDERID, moveFileNoReplace, attributes, fileIdentity, knownFolder };
