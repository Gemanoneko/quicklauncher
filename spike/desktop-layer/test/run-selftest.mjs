// Self-test runner for the desktop-layer spike. Non-intrusive: it never
// touches Explorer, never sends input, never kills anything it did not start.
//   node spike/desktop-layer/test/run-selftest.mjs <outDir>
// 1. starts a "fake desktop" (hidden window, separate Electron process)
// 2. starts the panel in self-test mode, parented to that fake desktop
// 3. when the panel says so, kills the fake desktop (by PID, its own tree)
//    -> stands in for Explorer dying; the watchdog must recover onto the real desktop
// 4. waits for the panel to finish its checks and exit, then confirms every
//    process it started is gone.
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const mainJs = path.resolve(here, '..', 'main.js');
const electron = require('electron'); // path to electron.exe from the worktree
const outDir = path.resolve(process.argv[2] || path.join(here, '..', '.out'));
fs.mkdirSync(outDir, { recursive: true });
for (const f of ['fake.json', 'fake-cmd.json', 'panel.log', 'fake.log', 'selftest-results.json']) fs.rmSync(path.join(outDir, f), { force: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const started = [];
function launch(args, logName) {
  const p = spawn(electron, [mainJs, ...args], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: false });
  started.push(p.pid);
  const log = fs.createWriteStream(path.join(outDir, logName + '.stdout.txt'));
  p.stdout.pipe(log); p.stderr.pipe(log);
  return p;
}
function alive(pid) {
  try {
    const out = execFileSync('tasklist', ['/FI', `PID eq ${pid}`, '/NH', '/FO', 'CSV'], { encoding: 'utf8' });
    return out.includes(`"${pid}"`);
  } catch { return false; }
}
function killTree(pid) {
  try { execFileSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' }); } catch { /* already gone */ }
}

const fakeJson = path.join(outDir, 'fake.json');
const fakeCmd = path.join(outDir, 'fake-cmd.json');
const fake = launch(['--ql-mode=fake-desktop', `--ql-hwnd-out=${fakeJson}`, '--ql-lifetime-ms=60000', `--ql-cmd=${fakeCmd}`, `--ql-log=${path.join(outDir, 'fake.log')}`], 'fake');
let fakeInfo = null;
for (let i = 0; i < 150 && !fakeInfo; i++) {
  try { fakeInfo = JSON.parse(fs.readFileSync(fakeJson, 'utf8')); } catch { await sleep(100); }
}
if (!fakeInfo) { console.error('fake desktop did not start'); killTree(fake.pid); process.exit(2); }
const { hwnd, pids: fakePids = [] } = fakeInfo;
console.log(`fake desktop pid ${fake.pid}, hwnd 0x${hwnd.toString(16)}`);

const panelLog = path.join(outDir, 'panel.log');
const panel = launch(['--ql-mode=selftest', `--ql-out=${outDir}`, `--ql-fake-parent=${hwnd}`, `--ql-fake-cmd=${fakeCmd}`, `--ql-log=${panelLog}`], 'panel');
const panelExit = new Promise((r) => panel.on('exit', (code) => r(code)));

let killedAt = 0;
const t0 = Date.now();
let exitCode = null;
panelExit.then((c) => { exitCode = c; });
while (exitCode === null && Date.now() - t0 < 170000) {
  if (!killedAt && fs.existsSync(panelLog) && fs.readFileSync(panelLog, 'utf8').includes('"ready-for-parent-kill"')) {
    killTree(fake.pid);
    killedAt = Date.now();
    console.log('killed the fake desktop process tree');
  }
  await sleep(100);
}
if (exitCode === null) { console.error('panel did not finish in time; killing its tree'); killTree(panel.pid); await sleep(1000); }
if (!killedAt) killTree(fake.pid);
await sleep(1500);

let results = null;
try { results = JSON.parse(fs.readFileSync(path.join(outDir, 'selftest-results.json'), 'utf8')); } catch { /* none */ }
const childPids = results ? results.pids.map((p) => p.pid) : [];
const leftovers = [...new Set([...started, ...childPids, ...fakePids.map(Number)])].filter(alive);

console.log('\n== desktop-layer spike self-test ==');
if (results) {
  console.log(`Electron ${results.env.electron}, Windows ${results.env.osRelease}, scale ${results.env.display.scaleFactor}, displays ${results.env.displays}`);
  console.log(`tree: ${results.tree}`);
  console.log(`layout: ${results.pick.layout}${results.pick.reason ? ' (' + results.pick.reason + ')' : ''}; free spot: ${results.spot.free}`);
  for (const [k, v] of Object.entries(results.checks)) console.log(`${v.pass ? 'PASS' : 'FAIL'}  ${k}`);
  for (const n of results.notes) console.log(`NOTE  ${n}`);
}
console.log(`${leftovers.length ? 'FAIL' : 'PASS'}  every process started by the test has exited${leftovers.length ? ' (still alive: ' + leftovers.join(',') + ')' : ''}`);
console.log(`panel exit code: ${exitCode}`);
process.exit(results && results.summary.failed.length === 0 && leftovers.length === 0 ? 0 : 1);
