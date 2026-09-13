# 020 — Extract `plugins/shared`

## Depends on

010 D.

## Moves

| From | To |
| --- | --- |
| `plugins/cursorclaw/skills/<name>/` (real dirs) | `plugins/shared/skills/<name>/` |
| `plugins/cursorclaw/agents/*.md` | `plugins/shared/agents/*.md` |
| `plugins/cursorclaw/commands/*.md` | `plugins/shared/commands/*.md` |

Leave in cursorclaw: `.toml` agents, `README.provenance.md` if Codex-specific (or share the md if zclaw already linked it), components, hooks, rules, bin, `.cursor-plugin`.

## After

```
plugins/cursorclaw/skills/<name> → ../../shared/skills/<name>
plugins/zclaw/skills/<name>      → ../../shared/skills/<name>
plugins/claudeclaw/skills/<name> → ../../shared/skills/<name>   # created in 030
```

Same pattern for `agents/*.md` and `commands/*.md`.

## NEW

- `plugins/shared/README.md` — SoT contract.
- `scripts/sync-from-upstream.sh` — `diff -rq` vs `../codexclaw/plugins/codexclaw/{skills}` (report only).

## Install

`scripts/global-install.sh` Cursor `rsync -a` → `rsync -aL`.

## Accept

- Every host skill symlink `test -e`.
- No real skill directories left under host `skills/` except claudeclaw unique `status/`.
