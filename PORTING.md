# Porting map — codexclaw → cursorclaw

Upstream pin: see `UPSTREAM.lock`.

## Goal

Ship the **same** development discipline on Cursor that codexclaw ships on Codex: every skill, every hook pipeline, CLI, agents, commands.

## Status (parity push)

| Surface | Status |
| --- | --- |
| Cursor plugin manifest | `.cursor-plugin/` + marketplace |
| Skills (29) | Folder-name == `name:`; bodies rebranded to Cursor/`crc`; dogfood symlinks in `.cursor/skills/` |
| Hooks | Full Codex fan-out via `scripts/cursor-bridge.mjs` on sessionStart / beforeSubmitPrompt / preToolUse / postToolUse / preCompact / stop / subagentStop |
| Dogfood | Repo `.cursor/hooks.json` + `.cursor/rules/` wired to the same bridge |
| Agents | `explorer` / `reviewer` / `executor` / `architect` as Cursor `.md` agents |
| Commands | orchestrate / status / doctor / map / interview / install-dev |
| State | `.cursorclaw/` with legacy `.cursorclaw/` migration |
| CLI | `crc` / `cursorclaw` |
| Tooling | gate/inventory retargeted to Cursor `hooks.json` + `.cursor-plugin` |

## Known Cursor I/O deltas (not missing features — host shape differences)

- `beforeSubmitPrompt` cannot inject `additional_context`; bridge **stashes** Codex-style context and reinjects on the next `preToolUse`.
- Codex `decision:"block"` on Stop becomes Cursor `followup_message` (auto-continue).
- Codex tool names (`Bash`, `spawn_agent`, `apply_patch`) are mapped from Cursor tools (`Shell`, `Task`, `Write`/`Edit`).
- `config-guard` Codex feature healing still runs but is largely a no-op outside Codex config.toml.

## Legacy

Original Codex hook JSON remains under `hooks/codex-legacy/` for provenance.

## Global install

`./scripts/global-install.sh` copies the plugin into `~/.cursor/plugins/local/cursorclaw`, links skills, writes user hooks, installs the core rule, and puts `crc` on `~/.local/bin`.
