# Shared layers with codexclaw — plan

## Objective

Keep **lidgeclaw** aligned with **codexclaw** on the common discipline layer, and share host-unique surfaces across Cursor/ZCode whenever the content is shareable. Then push the in-flight alignment to `origin/main`.

## Constraints

- Do **not** modify `../codexclaw` in this unit.
- Do **not** invent a divergent project state dir (no live `.cursorclaw/` model).
- Do **not** mirror skills into `~/.cursor/skills` or `.cursor/skills` (duplicate discovery).
- Host bridges stay host-local; share only content that is format-compatible.

## Layer map (locked)

| Layer | Kind | Owner / share rule |
| --- | --- | --- |
| Skills | **Common** | SoT: `plugins/cursorclaw/skills/`. zclaw → relative symlinks. Semantics match codexclaw `$crc-*` family. |
| Components | **Common** | SoT: `plugins/cursorclaw/components/`. Shared runtime logic; state under `.codexclaw/`. |
| Structure docs | **Common** | `structure/` — same discipline as codexclaw. |
| Project state | **Common** | `.codexclaw/` (Cursor + ZCode + Codex family). |
| CLI entry | **Common concept / unique binary names** | `crc` / `cursorclaw` / `lidgeclaw` vs upstream `cxc` / `codexclaw`. |
| Agents / commands | **Unique format, shared content when possible** | Cursor/ZCode `.md` under cursorclaw; zclaw symlinks. Codex uses `.toml` in upstream. |
| Hook wiring | **Unique** | Cursor: `hooks.json` + `cursor-bridge.mjs`. ZCode: `zcode-bridge.mjs`. Codex: per-event JSON (kept as `hooks/codex-legacy/`). |
| Plugin manifest | **Unique** | `.cursor-plugin` / `.zcode-plugin` / upstream `.codex-plugin`. |

## Work-phase map

1. **wp-docs** (this cycle) — docs-only: lock map in `PORTING.md` + this unit's decade docs. No production code claims.
2. **wp-push** — verify WIP alignment (`.codexclaw` restore, skill-mirror cleanup, zclaw symlinks), commit, push `origin/main`.

## Accept criteria

- PORTING documents the table above.
- Live non-devlog paths use `.codexclaw`.
- zclaw skills/agents/commands remain symlinks into cursorclaw.
- Targeted verification passes; HEAD pushed to origin/main.
