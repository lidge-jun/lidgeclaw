# claudeclaw

Claude Code host shell of **[lidgeclaw](../..)**.

Skills, shareable agents, and commands come from `plugins/shared/` via relative symlinks. Hooks and the manifest are Claude-unique.

## Official layout

Components live at the plugin root. Only `plugin.json` is inside `.claude-plugin/`.

See [Create plugins](https://code.claude.com/docs/en/plugins) and [Plugins reference](https://code.claude.com/docs/en/plugins-reference).

## Install

From the lidgeclaw checkout:

```bash
./scripts/global-install.sh --target claude
```

Or:

```bash
claude plugin marketplace add /path/to/lidgeclaw
claude plugin install claudeclaw@lidgeclaw
```

Restart the Claude Code session. Invoke `/claudeclaw:status` or `/claudeclaw:dev`.

Do **not** copy plugin skills into `~/.claude/skills/`.
