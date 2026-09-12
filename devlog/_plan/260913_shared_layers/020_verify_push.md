# 020 — Verify WIP alignment and push

## Depends on

010 docs cycle D (layer map locked).

## Scope

Ship the already-staged working tree that restores common-layer alignment with codexclaw, plus the docs from 010.

## Invariants to verify before commit

1. `rg '\.cursorclaw' --glob '!devlog/**'` on live product paths → no hits (or only historical comments explicitly marked legacy).
2. Component `STATE_DIR` / home defaults → `.codexclaw` / `CODEXCLAW_HOME`.
3. `plugins/zclaw/{skills,agents,commands}/*` → symlinks into `plugins/cursorclaw/...`.
4. `plugins/cursorclaw/hooks/hooks.json` + `scripts/cursor-bridge.mjs` remain Cursor-unique; `plugins/zclaw/hooks/zcode-bridge.mjs` remains ZCode-unique.
5. `global-install.sh` does not mirror skills into `~/.cursor/skills` or `~/.zcode/skills`.

## Commands

```bash
node plugins/cursorclaw/scripts/build.mjs
# targeted: pabcd-state / session binding tests, or npm test if fast enough
git add -A  # excluding secrets
git commit -m "[agent] fix: share .codexclaw common layer; keep host-unique bridges"
git push origin HEAD
```

## Diff expectation

Mostly MODIFY across plugins/cursorclaw (state path restore), docs, install script, delete obsolete `.cursor/skills` dogfood symlinks. NEW: plan unit + PORTING layer section.

## Accept

- Commit on `main`, `git status` clean for shipped paths.
- `origin/main` == HEAD.
- Goal criteria c-1..c-4 met with captured evidence.
