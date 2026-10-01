// Regions spike - one-line try-it for Sergei. Works from any folder and shell:
//   node "C:\Antigravity Projects\QuickLaunch-regions-spike\spike\desktop-layer\tryit.mjs"
// Starts the spike with a run log, waits for it to end (the x on the panel, or
// Ctrl+C here), checks that every process it started has exited, appends that
// to the log and prints the PASS/FAIL summary. Read it again later with
// read-run.mjs.
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const S = require('./run-summary.js');
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const electron = require('electron'); // electron.exe from this worktree

const runsDir = S.defaultRunsDir();
fs.mkdirSync(runsDir, { recursive: true });
const logFile = path.join(runsDir, `run-${S.runStamp()}.jsonl`);
const controlFile = logFile.replace(/\.jsonl$/, '.control');
// Test-only flags pass through; anything else is ignored.
const passThrough = process.argv.slice(2).filter((a) => /^--ql-(no-focus|sim-sd=|sim-parent=|max-minutes=)/.test(a));

console.log('Regions spike is running. Follow the numbered steps on the panel.');
console.log(`Log: ${logFile}`);
const child = spawn(electron, [path.join(here, 'main.js'), `--ql-log=${logFile}`, `--ql-control=${controlFile}`, ...passThrough], {
  cwd: root, stdio: ['ignore', 'inherit', 'inherit'], windowsHide: false,
});

// Ctrl+C: ask the spike to quit through its own clean path (control file);
// force-kill its process tree only if it is still there 8 s later.
let forced = false;
let asked = false;
process.on('SIGINT', () => {
  try { fs.writeFileSync(controlFile, 'quit'); } catch { /* it will be forced below */ }
  if (asked) return;
  asked = true;
  setTimeout(() => {
    if (child.exitCode === null && child.signalCode === null) {
      forced = true;
      try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch { /* already gone */ }
    }
  }, 8000).unref();
});

function append(obj) {
  const now = Date.now();
  const entry = { t: now, ts: new Date(now).toISOString(), mode: 'tryit', ...obj };
  try { fs.appendFileSync(logFile, JSON.stringify(entry) + '\n'); } catch { /* log gone */ }
  return entry;
}

child.on('exit', (code, signal) => setTimeout(() => {
  const events = S.readLog(logFile);
  const pids = S.pidsFrom(events, child.pid);
  const left = S.leftoverPids(pids);
  const check = append({
    event: 'exit-check', by: 'launcher', code, signal: signal || null,
    checked: pids.length, leftovers: left || [], tasklist: left !== null, forced,
  });
  const r = S.analyze([...events, check]);
  append({ event: 'summary', by: 'launcher', ...S.summaryFields(r) });
  try { fs.rmSync(controlFile, { force: true }); } catch { /* fine */ }
  console.log('');
  for (const line of S.format(r, { logFile })) console.log(line);
  process.exit(r.overall === 'PASS' ? 0 : 1);
}, 1500));
