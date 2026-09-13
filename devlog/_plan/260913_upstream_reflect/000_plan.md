# Reflect codexclaw b93e0e8a into lidgeclaw

Who reads this: the next agent (or human) executing this unit. They decide how to copy HEAD without wiping Cursor/ZCode/Claude overlays.

codexclaw moved from pin `a4396f28` to `b93e0e8a` (0.2.25 + dispatch-taxonomy #163). lidgeclaw still has the older bytes plus host overlays (`crc`, `CURSORCLAW_SESSION_ID`, dual-home recall). The answer is a classified 3-way: copy files that match the pin, add files HEAD invented, merge the 43 files that both overlay and HEAD touched, then move the pin last.

Evidence inventory: [001_inventory.md](001_inventory.md). Decade docs: [010](010_skills.md), [020](020_components.md), [030](030_hosts_pin.md).

## Loop-spec

| Field | Content |
| --- | --- |
| Loop archetype | Satisfy-spec port. No divergence. |
| Trigger | User: reflect the latest sibling `../codexclaw` update into lidgeclaw (loop attached). |
| Goal | Shared skills + cursorclaw components + pin track `b93e0e8a`. Host overlays survive. |
| Non-goals | Edit `../codexclaw`. Push/PR/release. aside-jun. Skill mirrors under `~/.{cursor,zcode,claude}/skills`. Codex CI/WSL/GUI. Repo-wide leftover-`cxc` sweep of files **not** in pin..HEAD. Commit only if the user later asks. |
| Verifier | See §Verifiers. Each command was run in this P. |
| Stop condition | `UPSTREAM.lock` pin equals `b93e0e8a0a6baeb32b1c0ba08e7d32180c1c96ad`, affected tests exit 0, overlays still present. |
| Memory artifact | This folder + `.codexclaw/goalplans/reflect-the-latest-sibling-checkout-codexclaw-up/`. |
| Expected terminals | DONE / NOOP / BLOCKED / UNSAFE / NEEDS_HUMAN as in the goalplan. |
| Escalation | Overlay vs HEAD conflict that would drop `CURSORCLAW_SESSION_ID` or weaken memory-write-gate → NEEDS_HUMAN. Dispatch fail twice → main reclaims. |

HOTL bounds: write lidgeclaw only. No new credentials. No push. No `../codexclaw` writes.

## Architect dispositions

Proposal: [architect](5077fd5e-ef70-4f30-ad1b-b42effed8017). Classifier counts refreshed in this P: SAFE-COPY 43, NEW-COPY 21, MUST-3WAY 43, SKIP 5.

| ID | Disposition |
| --- | --- |
| D-LAYER-SHARED / COMPONENTS / BRIDGES | **Accept.** SoT stays `plugins/shared` + `plugins/cursorclaw/components`. Bridges stay I/O adapters. |
| D-LAYER-BIN | **Accept.** HEAD `bin/cxc.mjs` hunks land on `plugins/cursorclaw/bin/cursorclaw.mjs`. |
| D-PORT-METHOD / D-CLASS | **Accept.** `git merge-file` (PIN base, lidge ours, HEAD theirs) for MUST-3WAY. Byte-copy HEAD for SAFE-COPY / NEW-COPY. |
| D-PHASE-ORDER | **Accept.** docs → skills → components → pin. |
| D-HOME-DUAL | **Accept.** After merging memory-write-gate, `memoriesRoot` follows `recall/src/paths.ts` dual-read. Do not ship the current comment/`~/.codex` mismatch. |
| D-DIST-REBUILD | **Accept.** `npm run build` after src merge. Never copy upstream `dist/`. |
| D-HYGIENE-OPS | **Accept.** Rewrite `../../ops/dist/resolve.js` → `../../cxc-ops/dist/cxc-resolve.js` on three pabcd-state files (not in pin..HEAD; leftover overlay bug). |
| D-SCOPE-REFS | **Amend.** No repo-wide leftover-`cxc` sweep. For the **13 pin..HEAD skill files**, take HEAD functional text. crc-pass **CLI invocations only** (`cxc orchestrate` → `crc orchestrate`). Leave skill ids (`cxc-pabcd`) and Codex `create_thread` alone. Pin-identical refs in that set are SAFE-COPY then that same crc-pass. |
| D-SCOPE-HOSTS / D-NO-NEW-BOUNDARY | **Accept.** No zclaw fan-out expansion. No new package. GUI + `.codex-plugin` skipped. |
| A3 Claude memories root | **Accept.** Share Cursor dual-home this cycle; no `~/.claude` memories seam. |
| A5 gui / inventory | **Amend.** GUI skipped. `inventory.json` is MUST-3WAY and ships in wp-components. |
| A8 HEAD freeze | **Accept.** Freeze at `b93e0e8a`. Do not chase later sibling commits. |

Rejected alternatives (same as architect): repo-level git merge; copy-then-rebrand as the only method; copy upstream `dist/`; extract `plugins/shared/components`.

## Work-phase map (PHASE-SPLIT-01)

1. **wp-docs** — this cycle. Lock the class table and decade docs. No production src.
2. **wp-skills** — Markdown contract first (`010`). Agents read these; compile nothing.
3. **wp-components** — runtime + overlays (`020`). Needs new modules named by skills (`dispatch-surfaces`, write-destinations, V1/V2 spawn).
4. **wp-hosts** — pin + SoT honesty + verify (`030`). Pin last so `sync-from-upstream.sh` cannot lie mid-port.

## Scope

**IN:** the classified paths in `001_inventory.md`; `UPSTREAM.lock`; `PORTING.md` pin sentence; optional README pin mention; D-HYGIENE-OPS three imports.

**OUT:** `../codexclaw`; GUI; `.codex-plugin`; Codex CI/WSL; aside-jun; skill mirrors; push.

## Verifiers (PLAN-VERIFIER-REAL-01)

| Command | Ran in P | Exit | Observes this unit |
| --- | --- | --- | --- |
| `git -C ../codexclaw rev-parse HEAD` | yes | 0 | Target SHA `b93e0e8a0a6baeb32b1c0ba08e7d32180c1c96ad` |
| `bash scripts/sync-from-upstream.sh` | yes | 0 | `plugins/shared/skills` vs sibling; already lists `dispatch-surfaces.md` only-in-upstream |
| `node scripts/check-claudeclaw.mjs` | yes | 0 | Claude plugin + symlink skill names |
| `node plugins/cursorclaw/scripts/test.mjs plugins/cursorclaw/components/pabcd-state/test/session-binding.test.ts` | yes | 0, 64 pass | Direct arg is a wp-components change target |
| `npm test` (`package.json:26` → same `test.mjs` globs) | harness exists; full suite **not** run in docs cycle | — | Globs include `components/{pabcd-state,recall,subagent-config,cxc-ops,config-guard,provider-bridge,messenger-bridge}/test/*.test.ts` and `plugins/cursorclaw/test/*.test.mjs` — those are the wp-components targets. Full run is C of wp-components / wp-hosts. |

`check-claudeclaw.mjs` does not read component src. After skill edits it still proves host symlinks. After pin move, `sync-from-upstream.sh` must only show expected overlay/crc leftovers, not missing HEAD files.

## Conditional paths

| Path | Activation in C | Observable |
| --- | --- | --- |
| MUST-3WAY conflict leftover | After `git merge-file`, `rg -n '<<<<<<<'` on dest files | Zero conflict markers |
| memory-write-gate deny | Existing tests + HEAD `shell-write-destinations` cases | deny envelope unchanged; Cursor `crc` grant text remains |
| session bind Cursor-only | `session-binding.test.ts` Cursor cases | still pass after `realpathSync.native` |
| recall hook envelope | `recall/test/hook.test.ts` | still `hookSpecificOutput.additionalContext` |

## SoT sync (SOT-SYNC-01)

C of wp-hosts patches `PORTING.md` (pin SHA) and `UPSTREAM.lock`. `plugins/shared/README.md` already names the drift script.

## Resource / bypass (PLAN-BYPASS-NAMED-01)

No new enforcement layer. Existing memory-write-gate bypass remains the CLI grant + prompt idiom. This unit must not add a silent bypass.

## Attestation

**wp-docs B (this cycle):** decade docs are on disk. A folded two Highs (`fixtures.ts` path; `merge-file` without `-p`) and re-audit **PASS**. Fresh-reader of `000_plan.md`: answer (classified 3-way, pin last) was clear; stumble was that the class table lives in `001` (expected). No production src in this cycle.

**wp-docs D:** roadmap locked. Next direction unchanged: execute `010_skills.md`.

**wp-skills P:** stale-check 2026-09-13 — all 12 existing skill targets still present; `dispatch-surfaces.md` still missing (NEW). Sibling HEAD still `b93e0e8a`. No amendment to 010 except continuity.

**wp-skills B:** merged 13 skill files. recall/SKILL.md took HEAD body + `name: recall` + dual-home (7 conflict hunks). `dispatch-surfaces.md` added. check-claudeclaw OK.

**wp-skills D:** skill contract now includes DEV-STACK-08 + dispatch-surfaces. Next direction unchanged: execute `020_components.md`.

**wp-components P:** stale-check — NEW src files still missing; overlay keep-list files still present; HEAD still `b93e0e8a`. No 020 amendment.

**wp-components B:** classified 3-way applied. SAFE/NEW copied; MUST-3WAY resolved (keep `CURSORCLAW_SESSION_ID`, dual-home `memoriesRoot`, `$cursorclaw:`/`$crc-`, `hookSpecificOutput`). Hygiene: `ops/dist/resolve.js` → `cxc-ops/dist/cxc-resolve.js`. Root `bin/cursorclaw.mjs` got HEAD #132 `--help` forwarding + `memory allow-write` HELP so both entry points match `cli-usage` / `help-verbs`. `hook.ts` Stop regexes now match `crc orchestrate` (session injection). Resolver fail-open is `crc`. Mention scanner accepts `$crc-`/`$cursorclaw:`/`$cxc-`. Leaf catalog follows skill-dir symlinks. Scoped suite 577 pass / 0 fail / 4 skip (Codex per-event hook JSON absent). `npm run build` OK. Overlay keep-list rgs hit. Residual: host-layout tests in `plugins/cursorclaw/test/{hook-e2e,packaging,probe-*,win-exec-bin}` still assume Codex hook JSON / committed dist — not this cycle's accept list.

**wp-components C:** receipt `.codexclaw/evidence/72cf3ada-1116-48aa-abb0-f0ae9d1c7950/test-receipt.json` — 577 pass / 0 fail. Overlay keep-list confirmed. c-2 met. Full `npm test` globs still include Codex-layout hook-e2e/packaging; not used as this unit's gate.

**wp-components D:** components track HEAD b93e0e8a runtime with crc overlays. Next direction unchanged: execute `030_hosts_pin.md`.

**wp-hosts P:** LOOP-CONTINUITY — previous D said execute 030; direction unchanged. Stale-check 2026-09-13: sibling HEAD still `b93e0e8a`; lock still `a4396f28`; READMEs do not name the old pin. `upstream-tag` from sibling = `v0.2.25-15-gb93e0e8a`. Architect consultation reused wp-docs ALIGNED (D-PHASE-ORDER pin last). No 030 amendment.

**wp-hosts A:** PASS. Pin-last publish only.

**wp-hosts B:** wrote `UPSTREAM.lock` (`b93e0e8a` / `v0.2.25-15-gb93e0e8a`) and one PORTING sentence.

**wp-hosts C:** lock SHA matches sibling HEAD; `sync-from-upstream.sh` exit 0 (crc overlay diffs remain; `dispatch-surfaces.md` on both sides); `check-claudeclaw.mjs` OK. c-3 met.

**wp-hosts D:** pin published. Goal criteria c-1/c-2/c-3 met. Did not improve: full `npm test` still fails Codex-layout hook-e2e/packaging (out of accept). Hypothesis that would kill this direction: a later sibling commit after the A8 freeze that we refused to chase.

**completion-audit leftover (C1):** Cursor/ZCode/Claude actually read `plugins/shared/agents/*.md` (hosts symlink). Those files still lacked #163 shared-cwd / no-branch-git sentences after toml SAFE-COPY. Synced architect/executor/explorer/reviewer.md plus the matching README.provenance paragraphs. Commands had no pin..HEAD delta.
