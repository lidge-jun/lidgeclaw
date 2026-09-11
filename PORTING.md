# Porting map — codexclaw → cursorclaw

Upstream pin: see `UPSTREAM.lock`.

## Goal

Ship the same development discipline (dev skill family, PABCD, multi-model subagent guidance, recall/map/skill-search surfaces) on the **Cursor** agent runtime instead of the OpenAI Codex plugin runtime.

## Surface mapping

| codexclaw (Codex) | cursorclaw (Cursor) | Status |
| --- | --- | --- |
| `plugins/codexclaw/.codex-plugin/plugin.json` | `plugins/cursorclaw/.cursor-plugin/plugin.json` + repo `.cursor-plugin/marketplace.json` | Scaffolded |
| `skills/*/SKILL.md` (+ `agents/openai.yaml`) | `skills/*/SKILL.md` (Cursor discovery) | Copied; `crc-dev` / `crc-pabcd` alias skills added |
| Codex `hooks/*.json` event names | `hooks/hooks.json` Cursor events | **Bridge live**: `scripts/cursor-bridge.mjs` maps sessionStart / beforeSubmitPrompt / preToolUse(pending inject) / stop / subagentStop; legacy JSON in `hooks/codex-legacy/` |
| `agents/*.toml` | `agents/*.md` (+ toml kept for provenance) | Scaffolded |
| `cxc` / `codexclaw` CLI | `crc` / `cursorclaw` CLI | Entry renamed; component paths still Codex-era |
| `.codexclaw/` state | `.cursorclaw/` | Bridge migrates legacy → modern on first hook; component `STATE_DIR` still writes `.codexclaw` until src rename lands |
| Codex feature-flag config-guard | Cursor settings / plugin variables | Deferred |
| `~/.codex` recall artifacts | Cursor conversation / memory surfaces | Deferred |
| Messenger GUI / serve | Optional later | Deferred |

## Hook event translation (initial)

| Codex event | Cursor event | Notes |
| --- | --- | --- |
| `SessionStart` | `sessionStart` | Banner script live |
| `UserPromptSubmit` | `beforeSubmitPrompt` | Passthrough stub |
| `Stop` | `stop` | Passthrough stub |
| `PreToolUse` / `PostToolUse` | `preToolUse` / `postToolUse` | Not yet rewired |
| `SubagentStop` | `subagentStop` | Not yet rewired |
| `PostCompact` | `preCompact` | Semantics differ; needs redesign |

## Non-goals for 0.1.0 scaffold

- Full behavioral parity of every Codex hook
- Marketplace submission polish
- Automatic rewrite of every skill string from `cxc` → `crc`

## Next port slices

1. ~~Rewire high-value hooks onto Cursor JSON I/O.~~ Done via `scripts/cursor-bridge.mjs` (prompt context deferred to `preToolUse` because Cursor `beforeSubmitPrompt` has no `additional_context`).
2. Rename component `STATE_DIR` (and siblings) from `.codexclaw` → `.cursorclaw` in source + rebuild dist; keep one-shot migration.
3. Expand soft-rebrand beyond `crc-dev` / `crc-pabcd` aliases (or dual frontmatter names).
4. Replace Codex-only recall roots with Cursor-compatible stores.
5. Docs-site + README localization pass for Cursor install instructions.
