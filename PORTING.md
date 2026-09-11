# Porting map — codexclaw → lidgeclaw

Upstream pin: see `UPSTREAM.lock`.

Umbrella: **lidgeclaw** hosts **cursorclaw** (Cursor) and **zclaw** (ZCode). Skills are owned by `plugins/cursorclaw/skills/`; zclaw symlinks them.

## Goal

Ship the **same** development discipline on Cursor and ZCode that codexclaw ships on Codex: every skill, hook pipelines where the host allows, CLI, agents, commands.

## Status (Cursor — cursorclaw)

| Surface | Status |
| --- | --- |
| Cursor plugin manifest | `.cursor-plugin/` + marketplace |
| Skills (29) | Folder-name == `name:`; dogfood symlinks in `.cursor/skills/` |
| Hooks | Full Codex fan-out via `scripts/cursor-bridge.mjs` on sessionStart / beforeSubmitPrompt / preToolUse / postToolUse / preCompact / stop / subagentStop |
| Dogfood | Repo `.cursor/hooks.json` + `.cursor/rules/` wired to the same bridge |
| Agents | `explorer` / `reviewer` / `executor` / `architect` as Cursor `.md` agents |
| Commands | orchestrate / status / doctor / map / interview / install-dev |
| State | `.cursorclaw/` with legacy `.codexclaw/` migration |
| CLI | `crc` / `cursorclaw` / `lidgeclaw` / `lc` |
| Tooling | gate/inventory retargeted to Cursor `hooks.json` + `.cursor-plugin` |

## Status (ZCode — zclaw)

| Surface | Status |
| --- | --- |
| ZCode plugin manifest | `plugins/zclaw/.zcode-plugin/plugin.json` + root `.zcode-plugin/marketplace.json` |
| Skills / agents / commands | Symlinks → `plugins/cursorclaw/...` |
| Hooks | SessionStart via `hooks/zcode-bridge.mjs` (v0.1); fuller fan-out TBD (ZCode events are Codex-shaped) |

## Known Cursor I/O deltas (not missing features — host shape differences)

- `beforeSubmitPrompt` cannot inject `additional_context`; bridge **stashes** Codex-style context and reinjects on the next `preToolUse`.
- Codex `decision:"block"` on Stop becomes Cursor `followup_message` (auto-continue).
- Codex tool names (`Bash`, `spawn_agent`, `apply_patch`) are mapped from Cursor tools (`Shell`, `Task`, `Write`/`Edit`).
- `config-guard` Codex feature healing still runs but is largely a no-op outside Codex config.toml.

## Legacy

Original Codex hook JSON remains under `plugins/cursorclaw/hooks/codex-legacy/` for provenance.

## Global install

```bash
./scripts/global-install.sh              # cursor + zcode
./scripts/global-install.sh --target cursor
./scripts/global-install.sh --target zcode
```

Cursor: `~/.cursor/plugins/local/cursorclaw`, skills, hooks, rule, CLI.  
ZCode: registers this checkout in `~/.zcode/cli/plugins/known_marketplaces.json` and stages a marketplace copy under `~/.zcode/cli/plugins/marketplaces/lidgeclaw`.
