# 010 — Docs: common vs unique layer map

## Scope

MODIFY only documentation in this phase.

## Diff plan

### MODIFY `PORTING.md`

Insert section **Layer sharing (common vs unique)** after the Goal section:

- Common: skills, components, `structure/`, `.codexclaw/` state, CLI discipline.
- Unique-but-shared-when-possible: agents/commands (zclaw symlinks to cursorclaw).
- Unique host-local: manifests, hook bridges, Codex legacy hook JSON.
- Explicit rule: do not diverge project state to `.cursorclaw/`; do not double-install skills into user skill dirs.

### MODIFY `README.md` Layout blurb

One sentence pointing at PORTING layer table; note zclaw shares agents/commands as well as skills.

### MODIFY `README.ko.md` / `README.zh.md`

Mirror the same one-line layer note (no divergent semantics).

### NEW `devlog/_plan/260913_shared_layers/000_plan.md` + this file + `020_verify_push.md`

Roadmap lock for wp-push.

## Out of scope

Code/test/build changes (wp-push). Editing `../codexclaw`.

## Accept

- PORTING has the layer table.
- READMEs mention common/unique share rule.
- No production patches in this cycle's D claim.
