// Prints the PASS/FAIL summary of the latest regions-spike run, re-computed
// from the raw samples in its log (so it also works for a run that crashed).
//   node "C:\Antigravity Projects\QuickLaunch-regions-spike\spike\desktop-layer\read-run.mjs"
//   ... read-run.mjs <run-XXXXXXXX-XXXXXX.jsonl> [--timeline]
// The timeline (raw state changes) is printed whenever a step 2-5 failed, so
// a missed Win+D can be judged by eye.
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const S = require('./run-summary.js');

const args = process.argv.slice(2);
const wantTimeline = args.includes('--timeline');
const file = args.find((a) => !a.startsWith('--')) || S.latestRun();
if (!file) {
  console.log(`No run logs in ${S.defaultRunsDir()}`);
  process.exit(2);
}
const events = S.readLog(file);
if (!events.length) {
  console.log(`Empty or unreadable log: ${file}`);
  process.exit(2);
}

// No launcher exit check in the log (started with npx electron, or crashed):
// check now whether the processes it logged are still running.
let exitCheck = null;
if (!events.some((e) => e.event === 'exit-check')) {
  const pids = S.pidsFrom(events);
  const left = S.leftoverPids(pids);
  exitCheck = { by: 'reader', checked: pids.length, leftovers: left || [], tasklist: left !== null };
}
const r = S.analyze(events, { exitCheck });
for (const line of S.format(r, { logFile: file })) console.log(line);

const logged = [...events].reverse().find((e) => e.event === 'summary');
if (!logged) console.log('Note: the run wrote no summary line (it never reached a normal quit); the verdict above is the reader\'s.');
else if (logged.text !== r.text) console.log(`Note: the run's own summary (by the ${logged.by}) said: ${logged.text}`);

if (wantTimeline || r.steps.some((s) => s.result === 'FAIL' && s.n >= 2 && s.n <= 5)) {
  console.log('\nTimeline (raw state changes):');
  for (const line of S.timeline(events)) console.log(`  ${line}`);
}
