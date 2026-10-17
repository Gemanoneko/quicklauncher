# Code Review — QuickLaunch v1.104.2

## Header

```
Reviewer: Senua (Code Reviewer)
Date: 2026-10-17
Tool: QuickLaunch (Electron / Windows, NSIS installer)
Release: v1.104.2
Commit range: d99a4f985a0099e0957deb42f6978ddb515c3734 (tag v1.104.1)..a7d1cece2e66dd27a6d05ada73ccfee51037d6dd
Files changed: 5 files, +100 / -12 — scripts/release.mjs (+60/-2), src/main/desktop/desktop-layer.js (+5/-2),
  package.json (+10/-2), package-lock.json (+15/-5), CHANGELOG.md (+13)
Stand-down dimensions: None.
```

---

## Summary

Lean, red-team review of six commits: the draft-first release flow in `scripts/release.mjs` (`d6c5add`, plus js-yaml 4.1.1 → 4.3.2 in the lockfile), `electronLanguages` en-US/en-GB (`2c12688`), js-yaml `build.files` excludes (`ee4b037`), the `restoreForeground` WS_VISIBLE fix (`88ac906`), and the version bump and CHANGELOG (`8868690`, `a7d1cec`).

Method: source only. I read the diff and its callers (`region-host.js` `endForeground`/`setHidden`, `controller.js` `toggleForeground`/`_returnToDesktop`). I read the installed electron-builder 26.17.0 publisher (`electron-publish/out/gitHubPublisher.js`), the unchanged `postbuild` hook `scripts/cleanup-releases.js`, and the js-yaml 4.3.2 package layout. I also ran read-only `npm ls`, `gh --version` (2.89.0), `gh release list`/`gh api …/releases` and `git ls-remote --tags`. GitHub currently has no drafts, the four published releases v1.103.1 to v1.104.1 all carry `latest.yml`, `.exe` and `.blockmap`, and the `v1.104.2` tag is not pushed yet. I ran no app, build or test, and did not touch `dist/`.

Result: no Critical finding, and the safety floor is intact. The draft flow cannot overwrite or delete a published release, and it has no injection surface. The WS_VISIBLE fix is correct and keeps hidden regions hidden. Both Majors concern how the new draft state interacts with existing release machinery: a reused draft never re-checks the tag, and the unchanged `postbuild` cleanup counts drafts.

---

## Focus-area answers

**1. `release.mjs` failure paths.**
- *Build fails after the draft was created:* the draft stays unpublished and the script exits non-zero. A re-run reuses the draft (`view` returns `true`), and electron-builder's `getOrCreateRelease` returns the draft; same-named assets go through `overwriteArtifact` (delete then re-upload on 422). Partial assets are never made public. The cleanup hook does not run, because npm skips `postbuild` when `build` fails.
- *Leftover draft:* it is reused. See M1, because the reuse path skips the tag check, and M2, because the cleanup counts drafts.
- *Tag not pushed:* on a first run, `--verify-tag` refuses and the script exits 1 before any build. On a reuse run nothing checks the tag (M1).
- *Publish fails after a good upload:* the draft keeps the full asset set and the script exits 1. Nothing is public and nothing is deleted. The old releases have already been pruned by `postbuild` (M2).
- *Missing assets / delete / overwrite:* the script never deletes a release. It refuses when `view` reports a published release, and electron-builder only overwrites assets on the release it resolved, which is the draft. The only way to publish a release with missing assets is for electron-builder to exit 0 after logging `skipped publishing`. That needs it to resolve no release at all, which a present draft rules out, except in the races covered by m1.
- *Injection:* none. Every `gh` call is `spawnSync` with an argv array and no shell. The tag is always `v`-prefixed, so it cannot be read as a flag. `version` and owner/repo come from our own `package.json`. The token goes only to the `npm run build` env (pre-existing), and none of the `gh` stderr that is printed contains it.

**2. WS_VISIBLE fix.**
- `saved.style` has only one consumer: `restoreForeground`, `desktop-layer.js:322`. `attachToHost`, `detachToTopLevel` and `releaseFromShell` read the *current* style after their own `SW_HIDE`, so none of them can write a stale WS_VISIBLE back.
- A region hidden before the press stays hidden. `captureForeground` records `hidden: this.hidden`, and `endForeground` calls `setHidden(saved.hidden)` (`region-host.js:284`), which goes to `d.hide`. For such a region, `saved.style` never had WS_VISIBLE anyway. Display-suppressed and shape-blocked regions never take part in the session.
- The fix routes the return through the ordinary attached unhide path: `showNoActivate` (SW_SHOWNA, no z-order change), then `_showToChromium`. That path already runs on every unhide. `endDragRaise` runs while the window is still hidden, and `finishForegroundOrder` runs afterwards, so the sibling order is unchanged.
- The `beginForeground` rollback (`failed: true` → `endForeground`) gets the same fix.
- One rare flash path is listed as m4.

**3. Packaging exclusions.**
- Runtime js-yaml is loaded only by `electron-updater` (`AppUpdater.js`, `Provider.js`, `PrivateGitHubProvider.js`) through `require` → `exports.require` = `./index.js` → `./lib/*`. None of the excluded files (`bin/`, `dist/*.map`, `dist/js-yaml{.js,.min.js}`, `lib/index_vite_proxy.tmp.mjs`) is reachable from that path, and `dist/js-yaml.mjs` (the `import` condition) is kept.
- `electronLanguages` keeps `en-US.pak`, Chromium's mandatory fallback. Its runtime effect is limited to the locale (m3).

---

## Rubric

### 1. Security

- Status: Pass
- Findings: none. The `gh` calls take argv arrays without a shell, nothing is deleted, the token is not logged, and no Electron or renderer surface changed.

### 2. Correctness & Logic

- Status: Concerns
- Findings:
  - **M1** `scripts/release.mjs:72-73, 86` [Major]: The reuse-draft branch skips `--verify-tag`, and no run checks that `HEAD` equals the remote tag's commit or that the tree is clean.
    - The documented recovery is "Build failed → fix the cause and re-run (it reuses the draft)" (release-pipeline SKILL step 6). A re-run after a code fix therefore uploads binaries built from a commit the tag does not point to.
    - If the tag was deleted or moved in between, `gh release edit --draft=false` (line 96) makes GitHub cut the tag from the draft's `target_commitish`. That defaults to `main`, not the release branch, which is the failure the comment at lines 14-15 says the script prevents.
    - Fix: on every run, before create or reuse, resolve `git ls-remote origin refs/tags/v<ver>` and require it to equal `git rev-parse HEAD` with a clean tree. Optionally pass `--target <sha>` on create.
  - **m1** `scripts/release.mjs:96` [Minor]: Nothing checks the draft's assets before it is published.
    - The v1.104.1 failure mode was exactly a missing `latest.yml`.
    - electron-builder exits 0 after a `skipped publishing` warning whenever it resolves a null release. A present draft prevents that today, but any future change, or a same-tag release published concurrently, would publish an incomplete release silently.
    - Fix: `gh release view <tag> --json assets` and require the `.exe`, its `.blockmap` and `latest.yml` before line 96.
  - **m2** `scripts/release.mjs:67-68` [Minor]: Any non-zero exit from `gh release view` counts as "no release", whether the cause is network, auth or rate limit.
    - With a leftover draft, a transient failure makes the script create a second draft on the same tag. GitHub allows duplicate drafts, and electron-builder and `gh release edit` each pick "the first matching", both newest-first, so they most likely agree.
    - The create-failure text always blames the tag (line 78) and never prints `create.error`.
    - Fix: tell "release not found" apart from other errors, and print `.error`.

### 3. Crash / Stability Safety

- Status: Pass
- Findings: none. `restoreForeground` keeps every existing guard (owned window, pid/tid identity, `ok:false` → hide → `pending`). The mask is a 32-bit signed AND, consistent with the other style writes.

### 4. Performance

- Status: Pass
- Findings: none. This change only removes package files.

### 5. State & Data Safety

- Status: Concerns
- Findings:
  - **M2** `package.json:21` (`postbuild`) + `scripts/cleanup-releases.js:68-77` (unchanged) [Major]: `npm run build` now finishes while the new release is still a draft, so `postbuild` runs keep-last-4 at that moment.
    - (a) The cleanup counts drafts (sorted by `created_at`, no `draft` filter). Every abandoned draft takes one slot permanently, and its published neighbours and their tags are deleted instead. The studio does abandon versions after a failed publish (v1.104.1 → v1.104.2). With three stale drafts, the current latest published release is deleted before the new one is public.
    - (b) Old releases and tags are pruned *before* publish. If line 96 then fails, one fewer published release is left.
    - (c) A cleanup network failure makes `npm run build` non-zero. `release.mjs` then reports "Build failed … re-run", although every asset was uploaded, and a re-run rebuilds and re-uploads everything.
    - For the v1.104.2 run itself the count is correct: draft + v1.104.1, v1.104.0, v1.103.2 are kept, v1.103.1 is deleted.
    - Fix: move the cleanup out of `postbuild` and run it from `release.mjs` after a successful publish, and make it skip drafts other than the current tag.
  - **m4** `src/main/regions/controller.js:1675-1679` with `region-host.js:284` [Minor]: If a region became display-suppressed or shape-blocked during the foreground session, `endForeground` now *really* shows it (`setHidden(false)` → SW_SHOWNA + `showInactive`), and the controller hides it again in the same tick. This is a possible one-frame flash on a rare path (display change while regions are forward). Before the fix, the window was flagged visible without a show, so the exposure is equivalent. Noted for Futaba.

### 6. Input Handling

- Status: Pass
- Findings: none. `version`, `owner` and `repo` come from our own `package.json`, and a missing `owner`/`repo` exits 1.

### 7. Maintainability (no Critical findings on its own)

- Status: Concerns
- Findings:
  - **m5** `src/main/desktop/desktop-layer.js:319-322` [Minor]: There is no automated regression check for the Ctrl+Space return trip. `scripts/regions-selftest.mjs` never calls `toggleForeground`, so this Chromium-compositing regression can only be caught by hand (Ender's 10-toggle check, Futaba). A test hook that asserts `IsWindowVisible` plus a painted frame after `_returnToDesktop` would pin it.

### 8. Doc/Code Drift (no Critical findings on its own)

- Status: Concerns
- Findings:
  - **m6** `CHANGELOG.md:17-18` [Minor]: "Packaged-build QA and code review pending." goes stale the moment this release ships. The same note recurs in earlier entries, so it should be updated at release or dropped as a pattern.
  - The `release.mjs` header comment and release-pipeline SKILL step 6 match the code apart from the M1 gap. The comment's claim that the tag must be pushed, or GitHub tags the default branch, holds only for the create path.

### 9. Build & Release Hygiene

- Status: Concerns
- Findings:
  - The version bump is present and moves `package.json` and `package-lock.json` (both entries) in step at 1.104.2. js-yaml 4.3.2 is deduped across electron-builder and electron-updater, with integrity from registry.npmjs.org. No secrets are added to the package.
  - **m3** `package.json` `build.electronLanguages` [Minor]: Without the non-English `.pak` files, Chromium's app locale falls back to en-US on a non-English Windows display language. Renderer sorting (`Intl.Collator(undefined)` `src/renderer/app.js:720`, `localeCompare` `app.js:652`, `manager.js:880`) then uses en-US collation rather than the system locale, and Chromium-owned strings (edit context menus, built-in dialogs) appear in English. This only matters if the display language is neither en-US nor en-GB. Nothing functional is dropped, and ICU data lives in `icudtl.dat`, not in the `.pak` files.
  - The js-yaml `files` excludes are safe (see Focus 3).
  - M1 and M2 also belong under this dimension. They are tagged above.

---

## Patterns

Second release in a row whose release-pipeline risk sits in how a new tool version interacts with unchanged surrounding scripts: builder 26 vs. the NSIS template in v1.104.1, and builder 26 vs. `postbuild` cleanup now. Changes to `release.mjs` should be reviewed together with every npm lifecycle hook that `npm run build` triggers.

---

## Verdict

- Total Critical: 0
- Total Major: 2
- Total Minor: 6

**Verdict:** RELEASE CLEAR

Majors M1 and M2 and Minors m1 to m6 are logged for Ender's next cycle. None blocks v1.104.2.

| # | Sev | Dim | file:line | Finding | Next cycle |
|---|-----|-----|-----------|---------|------------|
| M1 | Major | 2 Correctness | `scripts/release.mjs:72-73` | Reused draft skips the tag check, and no run checks HEAD against the tag commit | Check that the remote tag commit equals HEAD and the tree is clean on every run |
| M2 | Major | 5 State | `package.json:21` + `scripts/cleanup-releases.js:68-77` | `postbuild` keep-4 runs while the release is a draft, counts drafts and prunes before publish | Run the cleanup after publish and skip foreign drafts |
| m1 | Minor | 2 Correctness | `scripts/release.mjs:96` | No asset check before publishing | Require `.exe`, `.blockmap` and `latest.yml` |
| m2 | Minor | 2 Correctness | `scripts/release.mjs:67-68` | `view` error counted as not-found; misleading create error | Tell not-found apart from other errors; print `.error` |
| m3 | Minor | 9 Build | `package.json` `electronLanguages` | Locale falls back to en-US on a non-English display language | Accept, or document |
| m4 | Minor | 5 State | `controller.js:1675-1679` | Possible show-then-hide flash for a region suppressed mid-session | Futaba to watch |
| m5 | Minor | 7 Maint | `desktop-layer.js:319-322` | No automated check of the Ctrl+Space return | Add a selftest hook |
| m6 | Minor | 8 Drift | `CHANGELOG.md:17-18` | "QA and code review pending" note goes stale | Update at release |
