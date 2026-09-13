# Corrected layer sharing + claudeclaw — plan

Previous D (`4cb7f99`) documented a common/unique table and restored `.codexclaw/` naming. It did **not** create a mechanical SoT: `plugins/cursorclaw/{skills,components}` stayed full copies of `../codexclaw/plugins/codexclaw`, so they will drift.

This unit corrects that inside **lidgeclaw only**, then adds the Claude Code host.

## Structural decision (ARCH-DECISION-01)

- **Context:** three hosts (Cursor, ZCode, Claude) need one skill/agent/command tree; Codex `.toml` and compiled components stay host-tied; `../codexclaw` must not be edited.
- **Rejected:** symlink lidgeclaw wholesale at `../codexclaw` (wrong direction — Cursor session-binding and `crc` branding already diverge).
- **Chosen:** `plugins/shared/` owns shareable Markdown trees; thin host shells symlink them; components remain in `plugins/cursorclaw/components/` (compiled + overlays). Install flattens via `rsync -aL`.
- **Consequences:** checkout uses relative symlinks; plugin caches never keep dangling links; `scripts/sync-from-upstream.sh` reports drift vs the `UPSTREAM.lock` pin without writing the sibling repo.

## Constraints

- Official Claude layout: components at plugin root; only `plugin.json` inside `.claude-plugin/`.
- aside-jun stays a **user skill** (`~/.claude/skills/aside-jun`). Do not `/plugin install` it and do not copy it into claudeclaw.
- No `~/.claude/skills/<pabcd-skill>` mirrors (duplicate discovery).
- No commit/push unless the user asks.

## Work-phase map

1. **wp-docs** — lock this roadmap (no production patches in the D claim except PORTING/README honesty).
2. **wp-shared** — extract + retarget (020).
3. **wp-claude** — official claudeclaw plugin + bridge (030).
4. **wp-install** — `global-install.sh --target claude` on this machine (040).
