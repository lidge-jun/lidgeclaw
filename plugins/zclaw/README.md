# zclaw

ZCode plugin surface of **[lidgeclaw](../..)**.

Skills, agents, and commands are **shared** with `plugins/cursorclaw` via relative symlinks — one skill tree, two runtimes.

Host-unique: `.zcode-plugin/` and `hooks/zcode-bridge.mjs`. Common state dir remains `.codexclaw/` (aligned with codexclaw).

## Layout

```text
plugins/zclaw/
  .zcode-plugin/plugin.json
  skills/          → ../../cursorclaw/skills/*
  agents/          → ../../cursorclaw/agents/*.md
  commands/        → ../../cursorclaw/commands/*
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
