#!/usr/bin/env node
// Bridges the GitHub PAT from `gh` CLI (Windows Credential Manager / keyring)
// into electron-builder via GH_TOKEN. Invoked by `npm run release`.
// Rationale: Studio Illuminati's Team/Docs/ProcessRules.md — avoids per-machine
// env-var management and lets PAT rotations flow through `gh auth login` alone.
//
// It also pre-creates the GitHub release as a DRAFT on the already-pushed tag
// and publishes it only after the build succeeds. Root cause (v1.104.1 HTTP 422
// `already_exists`): electron-builder 26.x `PublishManager.getOrCreatePublisher`
// awaits `createPublisher()` between its cache get and set, so the installer and
// its .blockmap each get their own GitHubPublisher; both list releases, see none,
// and both POST-create — the loser fails and latest.yml is never written. With
// the draft already present, every publisher finds it and only uploads.
// The tag must already be pushed (`--verify-tag`): without it GitHub would tag
// the default branch, not the release commit.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

function resolveGhPath() {
  if (process.platform !== 'win32') return 'gh';
  const candidates = [
    `${process.env.PROGRAMFILES ?? 'C:\\Program Files'}\\GitHub CLI\\gh.exe`,
    `${process.env['PROGRAMFILES(X86)'] ?? 'C:\\Program Files (x86)'}\\GitHub CLI\\gh.exe`,
    `${process.env.LOCALAPPDATA ?? ''}\\Programs\\GitHub CLI\\gh.exe`,
    `${process.env.LOCALAPPDATA ?? ''}\\GitHub CLI\\gh.exe`,
  ];
  for (const p of candidates) {
    if (p && existsSync(p)) return p;
  }
  return 'gh'; // last-ditch fall back to PATH lookup
}

const ghPath = resolveGhPath();
const tokenRun = spawnSync(ghPath, ['auth', 'token'], { encoding: 'utf8' });
if (tokenRun.status !== 0) {
  console.error(`[release] \`${ghPath} auth token\` failed (exit ${tokenRun.status}).`);
  console.error('[release] Is GitHub CLI installed and authenticated? Run `gh auth login` to fix.');
  if (tokenRun.error) console.error(`[release] ${tokenRun.error.message}`);
  if (tokenRun.stderr) console.error(tokenRun.stderr.trim());
  process.exit(1);
}

const token = tokenRun.stdout.trim();
if (!token) {
  console.error('[release] `gh auth token` returned empty output.');
  console.error('[release] Re-authenticate via `gh auth login`.');
  process.exit(1);
}

console.log(`[release] Token sourced from gh CLI (${ghPath}).`);

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const { owner, repo } = pkg.build?.publish ?? {};
if (!owner || !repo) {
  console.error('[release] build.publish.owner / build.publish.repo missing from package.json.');
  process.exit(1);
}
const version = pkg.version;
const tag = `v${version}`;
const repoArg = ['-R', `${owner}/${repo}`];

function gh(args) {
  return spawnSync(ghPath, [...args, ...repoArg], { encoding: 'utf8' });
}

const view = gh(['release', 'view', tag, '--json', 'isDraft', '--jq', '.isDraft']);
const existing = view.status === 0 ? view.stdout.trim() : null;
if (existing === 'false') {
  console.error(`[release] GitHub release ${tag} is already published. Refusing to publish over it.`);
  process.exit(1);
} else if (existing === 'true') {
  console.log(`[release] Reusing existing draft release ${tag}.`);
} else {
  const create = gh(['release', 'create', tag, '--draft', '--verify-tag', '--title', version, '--notes', '']);
  if (create.status !== 0) {
    console.error(`[release] Could not create draft release ${tag} (exit ${create.status}).`);
    console.error('[release] Is the tag pushed? Push the named tag before `npm run release`.');
    if (create.stderr) console.error(create.stderr.trim());
    process.exit(1);
  }
  console.log(`[release] Created draft release ${tag}.`);
}

console.log('[release] Starting build + upload to the draft...');
const build = spawnSync('npm', ['run', 'build'], {
  env: { ...process.env, GH_TOKEN: token },
  stdio: 'inherit',
  shell: true, // npm on Windows is npm.cmd — needs shell
});
if (build.status !== 0) {
  console.error(`[release] Build failed (exit ${build.status}). Draft ${tag} left unpublished; re-run reuses it.`);
  process.exit(build.status ?? 1);
}

const publish = gh(['release', 'edit', tag, '--draft=false', '--latest']);
if (publish.status !== 0) {
  console.error(`[release] Build succeeded but publishing draft ${tag} failed (exit ${publish.status}).`);
  if (publish.stderr) console.error(publish.stderr.trim());
  process.exit(1);
}
console.log(`[release] Published ${tag}.`);
