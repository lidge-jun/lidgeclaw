# zclaw

ZCode plugin surface of **[lidgeclaw](../..)**.

Skills, agents, and commands come from `plugins/shared/` via relative symlinks — one tree, three runtimes (cursorclaw / zclaw / claudeclaw).

Host-unique: `.zcode-plugin/` and `hooks/zcode-bridge.mjs`. Common state dir remains `.codexclaw/`.

## Layout

```text
plugins/zclaw/
  .zcode-plugin/plugin.json
  skills/          → ../../shared/skills/*
  agents/          → ../../shared/agents/*.md
  commands/        → ../../shared/commands/*
  hooks/hooks.json # ZCode SessionStart → zcode-bridge.mjs
```

## Install

From the lidgeclaw checkout:

```bash
./scripts/global-install.sh --target zcode
```

Or in ZCode: **Settings → Plugins → Create → Add marketplace** pointing at this repo (reads `.zcode-plugin/marketplace.json`), then install **zclaw**.

Restart the ZCode agent session after install.

## Hooks

v0.1 ships `SessionStart` only. ZCode event names (`SessionStart`, `UserPromptSubmit`, `PreToolUse`, …) are closer to Codex than Cursor; fuller fan-out can reuse `plugins/cursorclaw/components` without the Cursor I/O shim.

## Upstream

- Umbrella: [lidgeclaw](https://github.com/lidge-jun/lidgeclaw)
- Cursor sibling: `plugins/cursorclaw`
- Discipline source: [codexclaw](https://github.com/lidge-jun/codexclaw)
