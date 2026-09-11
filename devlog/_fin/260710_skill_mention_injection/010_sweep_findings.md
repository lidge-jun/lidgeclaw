# 010 — Bare-Mention Emitter Sweep (read-only, McClintock/gpt-5.6-sol)

- Date: 2026-07-10
- Method: read-only rg sweep of components/src, skills, structure, docs-site.

## RUNTIME-EMITTED (strings that reach spawn messages/directives)

1. `plugins/cursorclaw/components/pabcd-state/src/hook.ts`
   - L170 (A directive): "Attach the discipline as $cxc mentions in the spawn message
     ($crc-dev-code-reviewer AND $crc-search plus the matching $crc-dev-* surface skill)"
   - L181 (B directive): "put the surface's $crc-dev-* mention in the spawn message"
   - L188 (C directive): "dispatch with $crc-dev-code-reviewer mentioned in the spawn message"
   - dist/hook.js mirrors the same strings (rebuild required).
2. `plugins/cursorclaw/components/subagent-config/src/spawn-wrapper.ts`
   - L195 `skillMention()` non-link-safe fallback returns bare `$crc-<folder>`
     (dormant builder path, but exported + doc-referenced).

## DOC-TAUGHT (instruction prose that teaches the broken form for spawns)

3. `plugins/cursorclaw/skills/dev/SKILL.md` L143-145, L153-156 (plain `$crc-<skill>` option).
4. `plugins/cursorclaw/skills/pabcd/SKILL.md` L133 (AUDIT-LOOP-01 packet), L443-445 (DISPATCH-TASK-01).
5. `plugins/cursorclaw/skills/search/SKILL.md` L189-193 (SEARCH-ATTACH-01), L215-217
   (stale claim that the spawn-attach hook prepends $crc-search — v2 path does no skill work).
6. `plugins/cursorclaw/skills/lunasearch/SKILL.md` L47 (L57 example already skill:// safe).
7. `structure/10_subagent_skill_routing.md` L106-108, L122-123 (plain-name fallback doctrine).
8. `docs-site/src/content/docs/guides/skills.md` L33-35, L40-41.

## Dependencies

- `spawn-wrapper.test.ts` L242-245 asserts the bare fallback -> must change with impl.
- `mentionedFolders()` (spawn-attach-hook.ts L148+) already recognizes bare/prefixed/link
  forms — keep as detection/dedupe input for normalization.
- MIND_DISPATCH_DIRECTIVE, agents/*.toml: no spawn-bound bare-form hits.
