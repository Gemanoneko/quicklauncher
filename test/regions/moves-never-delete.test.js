'use strict';
// Plain Node: node --test test/
// "Never delete" (tech plan § 3): the move code contains no unlink, rm, rmdir,
// copy (a copy-then-delete path) or Win32 delete, and no fs.rename outside the
// journal's own file (fs.rename replaces an existing target on Windows), and
// MoveFileExW is never given MOVEFILE_REPLACE_EXISTING or MOVEFILE_COPY_ALLOWED.
// The scanner is first shown to fail on fixtures that do each of those.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const DIR = path.join(__dirname, '..', '..', 'src', 'main', 'moves');
// Allow-list of the files the scan covers: a new file in moves/ fails the test
// until it is added here (and so scanned).
const FILES = ['journal.js', 'mover.js', 'rules.js', 'setup.js', 'win32.js'];
// The journal writes only its own two files and may rename its own .tmp over them.
const RENAME_OK = new Set(['journal.js']);

const DELETE = [
  /\bunlink(Sync)?\s*\(/, /\.rm(Sync)?\s*\(/, /\brmdir(Sync)?\s*\(/, /\bcopyFile(Sync)?\s*\(/, /\.cp(Sync)?\s*\(/,
  /\btruncate(Sync)?\s*\(/, /\bDeleteFile[AW]?\b/, /\bRemoveDirectory[AW]?\b/, /\bSHFileOperation/, /\bCopyFile(Ex)?[AW]?\b/,
  /MOVEFILE_REPLACE_EXISTING/, /MOVEFILE_COPY_ALLOWED/, /\bshell\.trashItem\b/,
];
const RENAME = [/\brename(Sync)?\s*\(/];

function strip(src) {
  // Comments are prose ("no unlink"); only code counts.
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
}

function scan(name, src) {
  const code = strip(src);
  const hits = [];
  for (const re of DELETE) if (re.test(code)) hits.push(re.source);
  if (!RENAME_OK.has(name)) for (const re of RENAME) if (re.test(code)) hits.push(re.source);
  // MoveFileExW's flags: only MOVEFILE_WRITE_THROUGH (0x8). 0x1 = REPLACE_EXISTING, 0x2 = COPY_ALLOWED.
  const flags = /MOVE_FLAGS\s*=\s*([^;]+);/.exec(code);
  if (name === 'win32.js' && (!flags || flags[1].trim() !== 'MOVEFILE_WRITE_THROUGH')) hits.push(`MOVE_FLAGS = ${flags ? flags[1].trim() : '(missing)'}`);
  if (name === 'win32.js' && !/MOVEFILE_WRITE_THROUGH\s*=\s*0x8\s*;/.test(code)) hits.push('MOVEFILE_WRITE_THROUGH is not 0x8');
  return hits;
}

test('the scanner fails on fixtures (positive control): each forbidden call is caught, comments are not', () => {
  const bad = [
    "fs.unlinkSync(p);", "await fsp.unlink(p);", "fs.rmSync(dir, { recursive: true });", "await this.fsp.rm(p);",
    "fs.rmdirSync(d);", "await fsp.copyFile(a, b);", "fs.cpSync(a, b);", "fs.truncateSync(p);",
    "k32.func('int DeleteFileW(str16 p)')", "k32.func('int RemoveDirectoryW(str16 p)')", "SHFileOperationW(op)",
    "k32.func('int CopyFileExW()')", "const f = MOVEFILE_REPLACE_EXISTING;", "const f = MOVEFILE_COPY_ALLOWED;", "shell.trashItem(p)",
  ];
  for (const line of bad) assert.ok(scan('mover.js', line).length > 0, `not caught: ${line}`);
  assert.ok(scan('mover.js', 'await this.fsp.rename(a, b);').length > 0, 'fs.rename outside the journal is caught');
  assert.ok(scan('mover.js', 'fs.renameSync(a, b);').length > 0);
  assert.equal(scan('journal.js', 'await this.fsp.rename(this.tmpPath, this.path);').length, 0, 'the journal may rename its own file');
  assert.equal(scan('mover.js', '// no unlink here\n/* fs.rmSync(x) */ const a = 1;').length, 0, 'comments do not count');
  assert.ok(scan('win32.js', 'const MOVEFILE_WRITE_THROUGH = 0x8;\nconst MOVE_FLAGS = MOVEFILE_WRITE_THROUGH | 0x1;').length > 0, 'extra flags are caught');
  assert.ok(scan('win32.js', 'const MOVEFILE_WRITE_THROUGH = 0x9;\nconst MOVE_FLAGS = MOVEFILE_WRITE_THROUGH;').length > 0, 'a wrong flag value is caught');
});

test('the move code deletes nothing, copies nothing, renames nothing but the journal, and moves with WRITE_THROUGH only', () => {
  const present = fs.readdirSync(DIR).filter((f) => f.endsWith('.js')).sort();
  assert.deepEqual(present, [...FILES].sort(), 'every file in src/main/moves is on the scan list');
  for (const name of FILES) {
    const hits = scan(name, fs.readFileSync(path.join(DIR, name), 'utf8'));
    assert.deepEqual(hits, [], `${name}: ${hits.join(', ')}`);
  }
});

module.exports = { scan };
