# 010 — Shared skills (wp-skills)

Execute after wp-docs D. Writes only under `plugins/shared/skills/`. Hosts already symlink; do not copy into host trees.

## Loop-spec (this phase)

Satisfy-spec merge of the 13 pin..HEAD skill files. Verifier: `rg -n 'DEV-STACK-08' plugins/shared/skills/dev/references/stacked-prs.md` hits; `test -f plugins/shared/skills/pabcd/references/dispatch-surfaces.md`; each SKILL.md frontmatter `name:` stays unprefixed (`dev`, `loop`, `pabcd`, `recall`, …); `node scripts/check-claudeclaw.mjs` exit 0.

## NEW

### `plugins/shared/skills/pabcd/references/dispatch-surfaces.md`

Source: `git show b93e0e8a:plugins/codexclaw/skills/pabcd/references/dispatch-surfaces.md`.

After copy, crc-pass **CLI invocations only**: every `` `cxc orchestrate` `` → `` `crc orchestrate` `` (HEAD has at least two: table ~:37 and later ~:117). Keep the thread-vs-subagent table. Do not rewrite Codex desktop `create_thread` names. Do not rewrite skill ids (`cxc-pabcd`, `cxc-loop`) — those are upstream names, not `crc-pabcd`.

## MODIFY — SAFE-COPY then crc-pass

Copy HEAD over dest (dest == PIN today):

| Dest | HEAD delta | crc-pass |
| --- | --- | --- |
| `plugins/shared/skills/dev/references/native-execution.md` | +11/− | `cxc` → `crc` if present |
| `plugins/shared/skills/dev/references/peer-collaboration.md` | +1 | same |
| `plugins/shared/skills/dev/references/stacked-prs.md` | +144 DEV-STACK-08 | CLI invocations `cxc ` → `crc ` only; leave `cxc-<skill>` ids |
| `plugins/shared/skills/loop/references/waiting.md` | +6 | same |
| `plugins/shared/skills/pabcd/references/phase-audit.md` | +2/− | same |

## MODIFY — MUST-3WAY

For each file: extract PIN and HEAD to tmp, then write in place (no `-p`; `-p` only prints):

```text
git merge-file --diff3 dest /tmp/pin /tmp/head
```

Keep overlay `name:` / `$CURSOR_HOME` / `crc` / `$crc-` / `$cursorclaw:`. Take HEAD body after leftover resolution — do not replace dest with raw HEAD.

### `plugins/shared/skills/dev/SKILL.md`

HEAD adds stacked-PR / native-exec pointers (~+44). Overlay already has `name: dev` and `crc chat/memory`. After merge: no `name: cxc-dev`. DEV-STACK-08 mention may live in the reference; SKILL.md must still route to `references/stacked-prs.md`.

### `plugins/shared/skills/loop/SKILL.md`

HEAD +17 (waiting / dispatch). Keep `name: loop`, `bin/cursorclaw.mjs`, `crc session`.

### `plugins/shared/skills/lunasearch/SKILL.md`

HEAD +6. Keep `name: lunasearch`, `$crc-search` / `$cursorclaw:search`.

### `plugins/shared/skills/pabcd/SKILL.md`

HEAD +16/−. Keep `name: pabcd`, `crc orchestrate`. Add pointer to `references/dispatch-surfaces.md` if HEAD added one and merge dropped it.

### `plugins/shared/skills/pabcd/references/delegation.md`

Overlay vs PIN is one line: `$CURSOR_HOME/agents/executor.toml`. Take HEAD V1/V2 + dispatch-surface split. Keep that env path. crc-pass `cxc subagents` → `crc subagents`.

### `plugins/shared/skills/recall/SKILL.md`

Largest skill delta (+259/−). Take HEAD flags (`--home/--rank/--json/--full`, freshness, sidecar honesty). Keep `name: recall`. Rebrand every command example to `crc` (fix mixed `cxc chat` + `crc memory` if the merge leaves it). Corpus wording: dual-home (`~/.cursor` and `~/.codex`), not Cursor-only and not Codex-only.

### `plugins/shared/skills/worktree-guardian/SKILL.md`

HEAD +7. Keep `name: worktree-guardian`, `$CURSOR_HOME`, `CURSORCLAW_WORKTREE_ROOTS`.

## DELETE

None.

## Out of this phase

Component src, pin, inventory, bin, agents.toml, leftover-`cxc` in skills **not** listed above.

## Accept

- `test -f plugins/shared/skills/pabcd/references/dispatch-surfaces.md`
- `rg -n 'DEV-STACK-08' plugins/shared/skills/dev/references/stacked-prs.md`
- `rg -n '^name: (dev|loop|pabcd|recall|lunasearch|worktree-guardian)$' plugins/shared/skills/*/SKILL.md`
- `rg -c 'crc orchestrate' plugins/shared/skills/pabcd/references/dispatch-surfaces.md` ≥ 2
- `rg -n 'cxc orchestrate' plugins/shared/skills/pabcd/references/dispatch-surfaces.md` empty
- `rg -n 'cxc-pabcd|cxc-loop' plugins/shared/skills/dev/references/stacked-prs.md` still hits (skill ids not blindly rewritten)
- `node scripts/check-claudeclaw.mjs` exit 0
- `rg -n '<<<<<<<' plugins/shared/skills` empty
