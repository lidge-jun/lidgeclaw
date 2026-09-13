# 030 — Official claudeclaw plugin

## Depends on

020 (shared trees exist).

## Official contract (Claude Code 2.1.263)

- Manifest: `plugins/claudeclaw/.claude-plugin/plugin.json` (`name` required; `skills`/`agents`/`commands`/`hooks` optional path fields).
- Components at **plugin root**, not inside `.claude-plugin/`.
- Hooks: `hooks/hooks.json` PascalCase events; `type: command`; `"${CLAUDE_PLUGIN_ROOT}"`.
- Marketplace: repo-root `.claude-plugin/marketplace.json` with `"source": "./plugins/claudeclaw"`.
- Skills: folder name == frontmatter `name` (aside-jun / official skills).
- Agents: Markdown frontmatter only — no `hooks`/`mcpServers`/`permissionMode`.
- aside-jun: **not** vendored.

## NEW files

```
plugins/claudeclaw/
  .claude-plugin/plugin.json
  skills/<shared>          → ../../shared/skills/<shared>
  skills/status/SKILL.md   # unique, truthful
  agents/*.md              → ../../shared/agents/
  commands/*.md            → ../../shared/commands/
  hooks/hooks.json
  hooks/claude-bridge.mjs
  components               → ../cursorclaw/components
  assets/logo.png          → ../cursorclaw/assets/logo.png
  README.md
.claude-plugin/marketplace.json
```

## Bridge

Map Claude events → existing component hook pipelines (same set as cursor-bridge). Emit Claude `hookSpecificOutput` (`additionalContext`, `permissionDecision`). Session id from Claude `session_id`. State remains `.codexclaw/`.

Events: SessionStart (incl. compact matcher), UserPromptSubmit, PreToolUse, PostToolUse, Stop, SubagentStop, PreCompact.

## Accept

`claude plugin validate plugins/claudeclaw --strict` exit 0.
`claude plugin validate . --strict` (marketplace) exit 0 or documented warning.
