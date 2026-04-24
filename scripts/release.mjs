#!/usr/bin/env node
// Bridges the GitHub PAT from `gh` CLI (Windows Credential Manager / keyring)
// into electron-builder via GH_TOKEN. Invoked by `npm run release`.
// Rationale: Studio Illuminati's Team/Docs/ProcessRules.md — avoids per-machine
// env-var management and lets PAT rotations flow through `gh auth login` alone.

import { spawnSync } from 'node:child_process';

const tokenRun = spawnSync('gh', ['auth', 'token'], { encoding: 'utf8', shell: true });
if (tokenRun.status !== 0) {
  console.error('[release] `gh auth token` failed.');
  console.error('[release] Is GitHub CLI installed and authenticated? Run `gh auth login` to fix.');
  if (tokenRun.stderr) console.error(tokenRun.stderr.trim());
  process.exit(1);
}

const token = tokenRun.stdout.trim();
if (!token) {
  console.error('[release] `gh auth token` returned empty output.');
  console.error('[release] Re-authenticate via `gh auth login`.');
  process.exit(1);
}

console.log('[release] Token sourced from gh CLI; starting build + publish...');

const build = spawnSync('npm', ['run', 'build'], {
  env: { ...process.env, GH_TOKEN: token },
  stdio: 'inherit',
  shell: true,
});
process.exit(build.status ?? 1);
