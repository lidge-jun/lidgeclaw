# Porting map — codexclaw → lidgeclaw

Upstream pin: see `UPSTREAM.lock`.

Umbrella: **lidgeclaw** hosts **cursorclaw** (Cursor) and **zclaw** (ZCode). Skills are owned by `plugins/cursorclaw/skills/`; zclaw symlinks them.

## Goal

Ship the **same** development discipline on Cursor and ZCode that codexclaw ships on Codex: every skill, hook pipelines where the host allows, CLI, agents, commands.

## Layer sharing (common vs unique)

lidgeclaw keeps **codexclaw’s common layer** and only forks what the host format forces. When a host-unique surface still has shareable content, share it (zclaw already does).

| Layer | Kind | Share rule |
| --- | --- | --- |
| Skills | Common | SoT `plugins/cursorclaw/skills/`; zclaw → relative symlinks. Same family as codexclaw `$crc-*`. |
| Components | Common | SoT `plugins/cursorclaw/components/`; project state under `.codexclaw/`. |
| `structure/` | Common | Same discipline docs as codexclaw. |
| Project state | Common | `.codexclaw/` for Cursor + ZCode (do **not** diverge to `.cursorclaw/`). |
| CLI | Common concept | `crc` / `cursorclaw` / `lidgeclaw` ↔ upstream `cxc` / `codexclaw`. |
| Agents / commands | Unique format, shared content | Cursor/ZCode `.md` owned by cursorclaw; zclaw symlinks when present. Codex upstream uses `.toml`. |
| Hook wiring | Unique | Cursor: `hooks.json` + `cursor-bridge.mjs`. ZCode: `zcode-bridge.mjs`. Codex: per-event JSON in `hooks/codex-legacy/`. |
| Plugin manifest | Unique | `.cursor-plugin` / `.zcode-plugin` / upstream `.codex-plugin`. |

Do **not** also mirror skills into `~/.cursor/skills`, `.cursor/skills`, or `~/.zcode/skills` — hosts would list each skill twice.

Plan unit for this alignment: `devlog/_plan/260913_shared_layers/`.

## Status (Cursor — cursorclaw)

| Surface | Status |
| --- | --- |
| Cursor plugin manifest | `.cursor-plugin/` + marketplace |
| Skills (29) | Folder-name == `name:`; owned by plugin only (no `~/.cursor/skills` or `.cursor/skills` mirror — those duplicate discovery) |
| Hooks | Full Codex fan-out via `scripts/cursor-bridge.mjs` on sessionStart / beforeSubmitPrompt / preToolUse / postToolUse / preCompact / stop / subagentStop |
| Dogfood | Repo `.cursor/hooks.json` + `.cursor/rules/` wired to the same bridge |
| Agents | `explorer` / `reviewer` / `executor` / `architect` as Cursor `.md` agents |
| Commands | orchestrate / status / doctor / map / interview / install-dev |
| State | `.codexclaw/` (Cursor + ZCode) |
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
- Session identity: Codex uses `CODEX_THREAD_ID` + `state_N.sqlite`; Cursor uses `CURSORCLAW_SESSION_ID` (SessionStart) or `CURSOR_CONVERSATION_ID` (host). `crc session current|bind` accepts either host; it never invents `CODEX_THREAD_ID`.

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
