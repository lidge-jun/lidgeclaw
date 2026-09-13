# 030 — Pin, SoT, verify (wp-hosts)

Execute after wp-components D. No new runtime features. This phase publishes the pin and proves the port.

## Loop-spec

Move `UPSTREAM.lock` to HEAD, tell PORTING the truth, run the gates that observe the pin and the suites.

## MODIFY `UPSTREAM.lock`

Before:

```
upstream-codexclaw=a4396f2860e9620db6ea4c39291c96549f485f1c
upstream-tag=v0.2.20-153-ga4396f28
forked-at=2026-09-11T15:33:30Z
```

After:

```
upstream-codexclaw=b93e0e8a0a6baeb32b1c0ba08e7d32180c1c96ad
upstream-tag=<describe --tags --always of sibling HEAD>
forked-at=2026-09-11T15:33:30Z
```

`upstream-tag` = `git -C ../codexclaw describe --tags --always HEAD` (run fresh; do not invent). Keep `forked-at`.

## MODIFY `PORTING.md`

First paragraph already says “Upstream pin: see `UPSTREAM.lock`.” Add one factual sentence under Goal or Status: last reflected sibling SHA is `b93e0e8a` (0.2.25 + #163 dispatch taxonomy). Do not claim GUI/CI were ported.

## MODIFY `README.md` / `README.ko.md` / `README.zh.md`

Only if they currently name the old pin or `0.2.24` as the tracked upstream. If they only point at `UPSTREAM.lock`, leave them.

## MODIFY `scripts/sync-from-upstream.sh`

None unless the script still assumes pin == skills identity. After the pin move it will still list crc-rewritten SKILL.md diffs — that is expected overlay, not a miss.

## Bridges

No edit unless wp-components C proves `hookSpecificOutput.additionalContext` vanished (it must not). Cursor stash / Claude `permissionDecision` stay.

## Global install

Do **not** re-run `global-install.sh` unless `crc --help` or Claude plugin list is broken after the local build. User asked for a reflect, not a reinstall. If a smoke is needed: `node plugins/cursorclaw/bin/cursorclaw.mjs memory --help` and `node scripts/check-claudeclaw.mjs`.

## DELETE

None.

## Accept (all run fresh in C)

| Command | Expect |
| --- | --- |
| `git -C ../codexclaw rev-parse HEAD` | `b93e0e8a0a6baeb32b1c0ba08e7d32180c1c96ad` |
| `awk -F= '/^upstream-codexclaw=/{print $2}' UPSTREAM.lock` | same SHA |
| `bash scripts/sync-from-upstream.sh` | exit 0; `dispatch-surfaces.md` no longer “Only in upstream”; remaining diffs are crc/name overlays |
| `node scripts/check-claudeclaw.mjs` | exit 0 |
| `npm test` or the `package.json:26` glob via `test.mjs` | exit 0 |
| `rg CURSORCLAW_SESSION_ID plugins/cursorclaw/components/pabcd-state/src/session-binding.ts` | hit |
| `rg -n '<<<<<<<' plugins/shared/skills plugins/cursorclaw/components` | empty |

## Out of this phase

Push, commit (unless user asks), `../codexclaw` writes, GUI port, leftover-`cxc` sweep.
