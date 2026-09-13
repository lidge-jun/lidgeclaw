# 020 — Components + payload (wp-components)

Execute after wp-skills D. Residence: `plugins/cursorclaw/components/` and payload/bin/tests listed below. `plugins/claudeclaw/components` is a symlink — one rebuild covers Claude.

## Loop-spec

Classified 3-way of runtime files. Verifier: `npm run build` then `node plugins/cursorclaw/scripts/test.mjs` on the globs in `package.json:26` (or at least the touched component test dirs). `rg CURSORCLAW_SESSION_ID plugins/cursorclaw/components/pabcd-state/src/session-binding.ts` still hits. Zero `<<<<<<<`. Never copy `../codexclaw/**/dist`.

## Recipe

```text
PIN=a4396f2860e9620db6ea4c39291c96549f485f1c
HEAD=b93e0e8a0a6baeb32b1c0ba08e7d32180c1c96ad
C=../codexclaw
# SAFE-COPY / NEW-COPY (freeze A8; do not chase later sibling HEAD):
git -C $C show $HEAD:plugins/codexclaw/<rel> > plugins/cursorclaw/<mapped>
# MUST-3WAY:
git -C $C show $PIN:plugins/codexclaw/<rel> > /tmp/pin
git -C $C show $HEAD:plugins/codexclaw/<rel> > /tmp/head
git merge-file --diff3 dest /tmp/pin /tmp/head
# then rebuild:
npm run build
```

`bin/cxc.mjs` maps to `plugins/cursorclaw/bin/cursorclaw.mjs` (alias `plugins/cursorclaw/bin/cxc.mjs` stays a 3-line import — do not 3-way the alias).

## NEW (copy HEAD, crc-pass `cxc` in comments/help)

See `001_inventory.md` NEW-COPY list (21). After `source-gate.ts` copy, rewrite `` `cxc session source` `` / `` `cxc receipt test` `` → `crc`.

New tests may import `cxc` help strings — rewrite to `crc` so they match overlay CLIs.

## MODIFY — SAFE-COPY

Byte-copy HEAD onto dest for every SAFE-COPY path under `plugins/cursorclaw/` in `001` (agents.toml, package.json bumps 0.2.24→0.2.25, recall search modules, session-source, source-identity, capabilities, test.mjs, messenger api-compat, …).

Do **not** SAFE-COPY or 3-way overlay-only files whose PIN==HEAD: `recall/src/paths.ts`, `cxc-ops/src/cxc-resolve.ts`, `pabcd-state/src/session-cli.ts` (keep `crc session`; not in pin..HEAD).

## MODIFY — MUST-3WAY hot files

### `pabcd-state/src/session-binding.ts`

- Keep: `resolveCursorSession`, `CURSORCLAW_SESSION_ID` / `CURSOR_CONVERSATION_ID`, nullable `dbPath`, fail-closed invalid `CODEX_THREAD_ID` (no Cursor fallback).
- Take HEAD: `canonical()` via `realpathSync.native` (Windows `\\?\`). Replace overlay `realpathSync(cwd)` at `resolveCanonicalCwd` (`session-binding.ts:20`).
- 3-way `session-binding.test.ts` the same way.

Before (overlay): `const canonicalCwd = realpathSync(cwd);`  
After: HEAD `canonical()` helper using `realpathSync.native`, still called from the Cursor and Codex branches.

### `pabcd-state/src/memory-write-gate.ts` (C4-promotion)

- Take HEAD: `shell-write-destinations` extract, `expandHomePrefix`. HEAD `cwd` text is deny-help for `crc memory allow-write`, not a new allow path.
- Keep overlay: `crc memory allow-write`, `[cursorclaw]` deny text, `CURSOR_HOME`.
- Apply D-HOME-DUAL: `memoriesRoot` = same dual-read as `recall/src/paths.ts` (not comment=`~/.cursor` / code=`~/.codex`).
- Copy NEW `shell-write-destinations.ts` + its test first (import must resolve).
- Envelope stays `hookSpecificOutput.permissionDecision: deny`.

### `pabcd-state/src/{session-source,source-identity}.ts`

SAFE-COPY HEAD (non-git bind #109, git stderr #133). No overlay on these two.

### `pabcd-state/src/{orchestrate-cli,memory-cli,goalplan-cli,cli,attest,review-round-cli}.ts`

3-way (these are in the MUST-3WAY list). Keep `crc` help and `hasHostSessionIdentity`. Take HEAD help-before-action / new verbs. **`session-cli.ts` is PRESERVE — do not 3-way or copy HEAD over it.**

### `recall/src/hook.ts`

- Take HEAD: source-aware briefing, `extractRecallTargets`, freshness labels.
- Keep: `crc` / `$crc-recall` / `CURSORCLAW_CRC` / `~/.cursor` in directive text; import `../../cxc-ops/dist/cxc-resolve.js`.
- Do not change `buildContextOutput` keys.

### `recall/src/{cli,index-db,ingest}.ts` + tests

3-way. Keep `cursorclawHome` / dual corpus. Take HEAD CLI flags and index freshness.

### `subagent-config/src/spawn-attach-hook.ts`

- Take HEAD: V1 items, `dispatchSources`, capability consume, managed-dispatch deny.
- Keep: `$cursorclaw:` / `$crc-` mention prefixes.
- Do not add Cursor `Task` here (bridge already maps it).
- 3-way tests; copy NEW spawn-items / explorer-role tests.

### `config-guard/src/cli.ts`

HEAD help-before-mutate. Keep `*ByCursorclaw` and `crc doctor`.

### `cxc-ops/src/{doctor,hook-trust,map-affordance}.ts` + tests

3-way. Keep `.cursor-plugin` / `CURSOR_HOME`. Take HEAD trust/map hunks.

### `provider-bridge/src/cli.ts`

3-way. NEW `win-exec.ts` is a copy (do not confuse with per-component copies already present).

### `bin/cursorclaw.mjs`

HEAD: HELP `memory allow-write`; config-guard verbs forward `...process.argv.slice(3)` (fixes `--help` drop). Keep `~/.cursor` HELP and `crc` names.

### `inventory.json`

Take HEAD catalog additions. Keep crc / unprefixed skill names (no `cxc-*` revival).

### `test/cli-usage.test.mjs`

3-way so new HELP / shard cases match `crc`.

## Hygiene (MODIFY, not in pin..HEAD)

`pabcd-state/src/{goal-gate,hook,idle-edit}.ts`:

Before: `import("../../ops/dist/resolve.js")`  
After: `import("../../cxc-ops/dist/cxc-resolve.js")`

## DELETE

None. Dist files are regenerated, not hand-deleted as a plan step.

## Out of this phase

`UPSTREAM.lock`, `PORTING.md` pin line, GUI, `.codex-plugin`.

## Accept

- `rg -n '<<<<<<<' plugins/cursorclaw` empty (includes `bin/` and `inventory.json`)
- `rg CURSORCLAW_SESSION_ID plugins/cursorclaw/components/pabcd-state/src/session-binding.ts`
- `rg realpathSync.native plugins/cursorclaw/components/pabcd-state/src/session-binding.ts`
- `rg 'crc session' plugins/cursorclaw/components/pabcd-state/src/session-cli.ts`
- `rg crc memory allow-write plugins/cursorclaw/components/pabcd-state/src/memory-write-gate.ts`
- `rg -n 'CURSOR_HOME|CODEX_HOME' plugins/cursorclaw/components/pabcd-state/src/memory-write-gate.ts` (D-HOME-DUAL; `memoriesRoot` must not be `join(homedir(), ".codex")` alone)
- `rg '\$cursorclaw:|\$crc-' plugins/cursorclaw/components/subagent-config/src/spawn-attach-hook.ts`
- `rg hookSpecificOutput plugins/cursorclaw/components/recall/src/hook.ts`
- `rg setByCursorclaw plugins/cursorclaw/components/config-guard/src`
- `rg 'memory allow-write' plugins/cursorclaw/bin/cursorclaw.mjs`
- `rg 'process.argv.slice(3)' plugins/cursorclaw/bin/cursorclaw.mjs`
- `rg -n 'ops/dist/resolve' plugins/cursorclaw/components` empty
- `test -f plugins/cursorclaw/components/pabcd-state/src/shell-write-destinations.ts`
- `test -f plugins/cursorclaw/components/recall/src/repo-key.ts`
- `npm run build` exit 0
- `node plugins/cursorclaw/scripts/test.mjs` on affected globs exit 0
