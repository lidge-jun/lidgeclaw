# 001 — File class table (pin a4396f28 → HEAD b93e0e8a)

Research only. No diffs that belong in decade docs.

Classifier: for each non-dist path in `git diff --name-only a4396f28..HEAD -- plugins/codexclaw`, compare PIN bytes, current lidge dest, HEAD bytes.

Dest map: `skills/` → `plugins/shared/skills/`; `bin/cxc.mjs` → `plugins/cursorclaw/bin/cursorclaw.mjs`; else `plugins/cursorclaw/<rest>`.

Counts: SAFE-COPY 43, NEW-COPY 21, MUST-3WAY 43, SKIP 5, MISSING-LIDGE 0.

## Overlay keep-list (survive every merge)

These host facts must still exist after wp-components:

- `CURSORCLAW_SESSION_ID` then `CURSOR_CONVERSATION_ID` in `session-binding.ts`
- `hasHostSessionIdentity` / nullable `dbPath` in orchestrate/session CLIs
- `pabcd-state/src/session-cli.ts` — PIN==HEAD, overlay `crc session`; **PRESERVE**, not 3-way
- `crc` / `[cursorclaw]` / `$crc-` / `$cursorclaw:` branding
- `recall/src/paths.ts` dual-read (`CURSOR_HOME` / `CODEX_HOME` / `~/.cursor` / `~/.codex`) — PIN==HEAD, do not overwrite
- `cxc-ops/src/cxc-resolve.ts` `CURSORCLAW_CRC` + `bin/cursorclaw.mjs` — PIN==HEAD, do not overwrite
- config-guard `*ByCursorclaw` fields — PIN==HEAD on activate/deactivate; keep through cli.ts 3-way
- Hook envelope `hookSpecificOutput.additionalContext` unchanged (bridges already parse it)

## SAFE-COPY (43) — dest == PIN, take HEAD bytes

Then crc-pass only the five skill reference files (D-SCOPE-REFS amend).

```
plugins/cursorclaw/agents/{architect,executor,explorer,reviewer}.toml
plugins/cursorclaw/components/bg-wake/package.json
plugins/cursorclaw/components/config-guard/package.json
plugins/cursorclaw/components/cxc-ops/package.json
plugins/cursorclaw/components/messenger-bridge/package.json
plugins/cursorclaw/components/messenger-bridge/src/api-compat.ts
plugins/cursorclaw/components/messenger-bridge/test/crlf-where.test.ts
plugins/cursorclaw/components/pabcd-state/package.json
plugins/cursorclaw/components/pabcd-state/src/session-source.ts
plugins/cursorclaw/components/pabcd-state/src/source-identity.ts
plugins/cursorclaw/components/pabcd-state/test/attest-batch.test.ts
plugins/cursorclaw/components/provider-bridge/package.json
plugins/cursorclaw/components/provider-bridge/test/detect.test.ts
plugins/cursorclaw/components/recall/src/{chat-search,cwd-context,format,index-search,memory-search,query-words,rollout,synonyms,threads-db}.ts
plugins/cursorclaw/components/recall/test/{chat-fallback,cwd-context,cwd-scope,index,query-words,synonyms}.test.ts
plugins/cursorclaw/components/skill-search/package.json
plugins/cursorclaw/components/subagent-config/package.json
plugins/cursorclaw/components/subagent-config/src/{capabilities,capability-lock}.ts
plugins/cursorclaw/components/subagent-config/test/{capabilities,capability-lock}.test.ts
plugins/cursorclaw/scripts/test.mjs
plugins/shared/skills/dev/references/{native-execution,peer-collaboration,stacked-prs}.md
plugins/shared/skills/loop/references/waiting.md
plugins/shared/skills/pabcd/references/phase-audit.md
```

## NEW-COPY (21) — dest missing, add HEAD, then crc-pass `cxc` strings

```
plugins/cursorclaw/components/pabcd-state/src/{shell-write-destinations,source-gate}.ts
plugins/cursorclaw/components/pabcd-state/test/{nongit-bound-cycle,reviewer-producer-contract,shell-write-destinations,source-gate,split-cwd-cycle}.test.ts
plugins/cursorclaw/components/provider-bridge/src/win-exec.ts
plugins/cursorclaw/components/recall/src/repo-key.ts
plugins/cursorclaw/components/recall/test/{cli-arg-hygiene,format-freshness,index-freshness,nl-query,repo-key}.test.ts
plugins/cursorclaw/components/subagent-config/test/{explorer-role-routing,spawn-items-boundaries,spawn-items-managed,spawn-items-routing}.test.ts
plugins/shared/skills/pabcd/references/dispatch-surfaces.md
plugins/cursorclaw/test/{recall-skill-synopsis,test-shard}.test.mjs
```

## MUST-3WAY (43) — dest ≠ PIN and PIN ≠ HEAD

`git merge-file <dest> <pin-tmp> <head-tmp>` then resolve leftovers keeping overlay keep-list.

Skills (wp-skills):

```
plugins/shared/skills/dev/SKILL.md
plugins/shared/skills/loop/SKILL.md
plugins/shared/skills/lunasearch/SKILL.md
plugins/shared/skills/pabcd/SKILL.md
plugins/shared/skills/pabcd/references/delegation.md
plugins/shared/skills/recall/SKILL.md
plugins/shared/skills/worktree-guardian/SKILL.md
```

Runtime (wp-components):

```
plugins/cursorclaw/bin/cursorclaw.mjs
plugins/cursorclaw/inventory.json
plugins/cursorclaw/test/cli-usage.test.mjs
plugins/cursorclaw/components/config-guard/src/cli.ts
plugins/cursorclaw/components/cxc-ops/src/{doctor,hook-trust,map-affordance}.ts
plugins/cursorclaw/components/cxc-ops/test/{hook-trust,map-affordance}.test.ts
plugins/cursorclaw/components/pabcd-state/src/{attest,cli,goalplan-cli,memory-cli,memory-write-gate,orchestrate-cli,review-round-cli,session-binding}.ts
plugins/cursorclaw/components/pabcd-state/test/{crlf-inputs,goalplan,help-verbs,memory-write-gate,session-binding,worktree-source-integration}.test.ts
plugins/cursorclaw/components/provider-bridge/src/cli.ts
plugins/cursorclaw/components/recall/package.json
plugins/cursorclaw/components/recall/src/{cli,hook,index-db,ingest}.ts
plugins/cursorclaw/components/recall/test/fixtures.ts
plugins/cursorclaw/components/recall/test/hook.test.ts
plugins/cursorclaw/components/recall/test/memory-search.test.ts
plugins/cursorclaw/components/subagent-config/src/{fallback-dispatch-cli,spawn-attach-hook}.ts
plugins/cursorclaw/components/subagent-config/test/{spawn-attach-hook,spawn-wrapper}.test.ts
```

## SKIP (5)

`.codex-plugin/plugin.json`, `agents/README.md`, `gui/package.json`, `gui/src/server/middleware.ts`, `gui/test/crlf-where.test.ts`.

## Hygiene (not in pin..HEAD)

```
plugins/cursorclaw/components/pabcd-state/src/{goal-gate,hook,idle-edit}.ts
```

Dead import `../../ops/dist/resolve.js` → `../../cxc-ops/dist/cxc-resolve.js`.

## Preserve (PIN==HEAD, overlay already present)

Do not copy HEAD over: `recall/src/paths.ts`, `cxc-ops/src/cxc-resolve.ts`, `pabcd-state/src/session-cli.ts`, `config-guard/src/activate.ts` (and other `*ByCursorclaw` files not in the 112).
