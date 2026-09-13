---
name: status
description: Report which claudeclaw capabilities are implemented on this Claude Code host. Use when the user asks what claudeclaw can do or whether the plugin is installed.
disable-model-invocation: true
---

# claudeclaw status

Report this list. Do not invent extra surfaces.

Implemented:

- Official Claude Code plugin manifest (`.claude-plugin/plugin.json`)
- Shared PABCD skills via `plugins/shared/skills/` (namespaced `/claudeclaw:<name>`)
- Shared Markdown agents and commands
- Unique `/claudeclaw:status` skill
- PascalCase hooks → `hooks/claude-bridge.mjs` (SessionStart, UserPromptSubmit, Pre/PostToolUse, PreCompact, Stop, SubagentStop)
- Project state under `.codexclaw/`
- Local marketplace install (`claudeclaw@lidgeclaw`)

Not in this plugin:

- aside-jun (user skill at `~/.claude/skills/aside-jun`, not a plugin)
- Codex `.toml` agent files
- A second copy of skills under `~/.claude/skills/`
