# 010 — Docs: honest layer map + Claude row

## Scope (docs-only)

### MODIFY `PORTING.md`

- State that **4cb7f99** aligned *naming* only.
- Mechanical SoT is now `plugins/shared/{skills,agents/*.md,commands}`.
- Add Claude host row: `.claude-plugin/plugin.json`, `hooks/hooks.json` PascalCase, `$CLAUDE_PLUGIN_ROOT`.
- Unique: manifests, bridges, Codex `.toml`, `components/`.
- Cite official plugin structure (components at plugin root).

### MODIFY `README.md` / `README.ko.md` / `README.zh.md`

- Third runtime: **claudeclaw** (Claude Code).
- Layout: `plugins/shared/` + three shells.

## Out of scope

File moves, install script, Claude plugin files (020–040).
