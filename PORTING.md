# Porting map — codexclaw → lidgeclaw

Upstream pin: see `UPSTREAM.lock`.

Umbrella: **lidgeclaw** hosts **cursorclaw** (Cursor), **zclaw** (ZCode), and **claudeclaw** (Claude Code). Shareable Markdown lives in `plugins/shared/`; each host is a thin shell.

## Goal

Ship the **same** development discipline on Cursor, ZCode, and Claude Code that codexclaw ships on Codex: every skill, hook pipelines where the host allows, CLI, agents, commands. Last reflected sibling SHA is `b93e0e8a` (codexclaw 0.2.25 + dispatch-taxonomy #163). GUI and Codex CI were not ported.

## Layer sharing (common vs unique)

`4cb7f99` restored `.codexclaw/` naming and wrote the first layer table. That was **policy**, not a mechanical SoT — `plugins/cursorclaw/skills` stayed a full copy of upstream. Correction: **`plugins/shared/`** owns shareable trees; host plugins symlink them. `../codexclaw` is not edited; `scripts/sync-from-upstream.sh` only reports drift against `UPSTREAM.lock`.

| Layer | Kind | Share rule |
| --- | --- | --- |
| Skills | Common | SoT `plugins/shared/skills/`. cursorclaw / zclaw / claudeclaw → relative symlinks. |
| Agent `.md` / commands | Unique format, shared content | SoT `plugins/shared/agents/*.md` and `plugins/shared/commands/`. Same three hosts symlink. |
| Codex agent `.toml` | Unique | Stays in `plugins/cursorclaw/agents/` (Codex format; not Claude/Cursor plugin agents). |
| Components | Common logic, unique residence | Compiled trees stay in `plugins/cursorclaw/components/` (Cursor overlays). claudeclaw mounts them via symlink for hook fan-out. |
| `structure/` | Common | Repo-root discipline docs. |
| Project state | Common | `.codexclaw/` for every host (do **not** diverge to `.cursorclaw/`). |
| CLI | Common concept | `crc` / `cursorclaw` / `lidgeclaw` ↔ upstream `cxc` / `codexclaw`. |
| Hook wiring | Unique | Cursor: `cursor-bridge.mjs`. ZCode: `zcode-bridge.mjs`. Claude: `claude-bridge.mjs` + PascalCase `hooks/hooks.json` + `$CLAUDE_PLUGIN_ROOT`. Codex: `hooks/codex-legacy/`. |
| Plugin manifest | Unique | `.cursor-plugin` / `.zcode-plugin` / `.claude-plugin` / upstream `.codex-plugin`. |

Do **not** mirror plugin skills into `~/.cursor/skills`, `.cursor/skills`, `~/.zcode/skills`, or `~/.claude/skills` — hosts would list each skill twice. aside-jun stays a **user skill**, not a plugin component.

Claude plugin layout follows the official contract: only `plugin.json` inside `.claude-plugin/`; `skills/`, `agents/`, `commands/`, and `hooks/` sit at the plugin root.

> 출처: [Plugins reference](https://code.claude.com/docs/en/plugins-reference)

Plan units: `devlog/_plan/260913_shared_layers/` (naming) and `devlog/_plan/260913_claudeclaw_shared/` (mechanical share + Claude). Roadmap locked in this cycle; extraction starts at 020.

## Status (Cursor — cursorclaw)

| Surface | Status |
| --- | --- |
| Cursor plugin manifest | `.cursor-plugin/` + marketplace |
| Skills (29) | Folder-name == `name:`; owned by plugin only (no `~/.cursor/skills` or `.cursor/skills` mirror — those duplicate discovery) |
| Hooks | Full Codex fan-out via `scripts/cursor-bridge.mjs` on sessionStart / beforeSubmitPrompt / preToolUse / postToolUse / preCompact / stop / subagentStop |
| Dogfood | Repo `.cursor/hooks.json` + `.cursor/rules/` wired to the same bridge |
| Agents | `explorer` / `reviewer` / `executor` / `architect` as Cursor `.md` agents |
| Commands | orchestrate / status / doctor / map / interview / install-dev |
| State | `.codexclaw/` (Cursor + ZCode + Claude) |
| CLI | `crc` / `cursorclaw` / `lidgeclaw` / `lc` |
| Tooling | gate/inventory retargeted to Cursor `hooks.json` + `.cursor-plugin` |

## Status (ZCode — zclaw)

| Surface | Status |
| --- | --- |
| ZCode plugin manifest | `plugins/zclaw/.zcode-plugin/plugin.json` + root `.zcode-plugin/marketplace.json` |
| Skills / agents / commands | Symlinks → `plugins/shared/...` |
| Hooks | SessionStart via `hooks/zcode-bridge.mjs` (v0.1); fuller fan-out TBD (ZCode events are Codex-shaped) |

## Status (Claude Code — claudeclaw)

| Surface | Status |
| --- | --- |
| Claude plugin manifest | `plugins/claudeclaw/.claude-plugin/plugin.json` + root `.claude-plugin/marketplace.json` |
| Skills / agents / commands | Symlinks → `plugins/shared/...` plus unique `skills/status/` |
| Hooks | PascalCase `hooks/hooks.json` → `hooks/claude-bridge.mjs`. Do **not** also set `hooks` in `plugin.json` — the default file is auto-loaded and a duplicate path fails to load. |
| Install | `./scripts/global-install.sh --target claude` → `claude plugin marketplace add` + `claude plugin install claudeclaw@lidgeclaw` |
| Validate | `claude plugin validate plugins/claudeclaw` succeeds with a symlink-skip warning. `--strict` treats that warning as an error; `scripts/check-claudeclaw.mjs` is the intended gate. Marketplace `--strict` must pass. |

## Known Cursor I/O deltas (not missing features — host shape differences)

- `beforeSubmitPrompt` cannot inject `additional_context`; bridge **stashes** Codex-style context and reinjects on the next `preToolUse`.
- Codex `decision:"block"` on Stop becomes Cursor `followup_message` (auto-continue).
- Codex tool names (`Bash`, `spawn_agent`, `apply_patch`) are mapped from Cursor tools (`Shell`, `Task`, `Write`/`Edit`).
- `config-guard` Codex feature healing still runs but is largely a no-op outside Codex config.toml.
- Session identity: Codex uses `CODEX_THREAD_ID` + `state_N.sqlite`; Cursor uses `CURSORCLAW_SESSION_ID` (SessionStart) or `CURSOR_CONVERSATION_ID` (host). `crc session current|bind` accepts either host; it never invents `CODEX_THREAD_ID`.

## Legacy

Original Codex hook JSON remains under `plugins/cursorclaw/hooks/codex-legacy/` for provenance.

## Global install

```bash
./scripts/global-install.sh              # cursor + zcode + claude
./scripts/global-install.sh --target cursor
./scripts/global-install.sh --target zcode
./scripts/global-install.sh --target claude
```

Cursor: `~/.cursor/plugins/local/cursorclaw` (rsync `-aL` flattens shared symlinks), hooks, rule, CLI.  
ZCode: registers this checkout in `~/.zcode/cli/plugins/known_marketplaces.json` and stages a marketplace copy under `~/.zcode/cli/plugins/marketplaces/lidgeclaw`.  
Claude: `claude plugin marketplace add <repo>` then `claude plugin install claudeclaw@lidgeclaw` (user scope).
