**English** | [한국어](README.ko.md) | [中文](README.zh.md)

<p align="center">
  <img src="plugins/cursorclaw/assets/logo.png" alt="cursorclaw" width="140" />
</p>

<h1 align="center">cursorclaw</h1>

<p align="center">
  Development discipline and multi-model subagent guidance for <strong>Cursor</strong>,<br>
  forked from <a href="https://github.com/lidge-jun/codexclaw">codexclaw</a> (Codex runtime).
</p>

<p align="center">
  <img src="https://img.shields.io/badge/runtime-Cursor-black" alt="Cursor runtime">
  <img src="https://img.shields.io/badge/upstream-codexclaw-red" alt="upstream codexclaw">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT">
</p>

---

cursorclaw packages the same cli-jaw-style discipline as codexclaw — **dev skill routers**, **PABCD**, and **role-based subagent guidance** — as a **Cursor plugin** (skills, rules, agents, commands, hooks) instead of a Codex plugin.

This repository is an early **0.1.0 scaffold**. Skill bodies and component CLIs are carried forward from upstream; Codex-only hooks live under `plugins/cursorclaw/hooks/codex-legacy/` while Cursor `hooks/hooks.json` is rewired. See [PORTING.md](PORTING.md) and [UPSTREAM.lock](UPSTREAM.lock).

Workflow inspiration remains [OMO / oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent). Credits and pinned sources: [NOTICE.md](NOTICE.md).

## Features (inherited + Cursor packaging)

**Dev Skill Family** — surface routers (`dev-architecture`, `dev-backend`, `dev-frontend`, …) governed by the parent `dev` skill.

**PABCD Workflow** — Plan / Audit / Build / Check / Done with file-backed state (`.cursorclaw/` preferred; `.codexclaw/` still recognized during the port).

**Subagent Roles** — explorer / reviewer / executor / architect prompts shipped as Cursor `agents/*.md` (TOML provenance kept).

**CLI** — `cursorclaw` / `crc` (upstream `cxc` / `codexclaw` names print a redirect hint).

## Install (Cursor plugin)

1. Clone this repository.
2. In Cursor, add the repo (or `plugins/cursorclaw`) as a **local / marketplace-style Cursor plugin** via Customize → Plugins.
3. Restart the agent session.
4. Confirm the `sessionStart` banner and that skills under `plugins/cursorclaw/skills/` are visible.

Dogfood checklist: run the `install-dev` command from the plugin.

Optional PATH CLI from a checkout:

```bash
git clone https://github.com/lidge-jun/cursorclaw
alias crc='node /path/to/cursorclaw/bin/cursorclaw.mjs'
crc status
crc doctor
```

## Layout

```text
.cursor-plugin/marketplace.json          # multi-plugin marketplace entry
plugins/cursorclaw/
  .cursor-plugin/plugin.json             # Cursor plugin manifest
  skills/                                # Agent skills (from upstream)
  rules/                                 # Cursor rules (.mdc)
  agents/                                # Cursor agents (.md) + toml provenance
  commands/                              # Cursor commands
  hooks/hooks.json                       # Cursor hooks
  hooks/codex-legacy/                    # Original Codex hook JSON (reference)
  components/                            # Node CLIs / hook backends (porting)
  scripts/                               # build/gate + Cursor bridge scripts
bin/cursorclaw.mjs                       # crc / cursorclaw entry
PORTING.md                               # surface map + next slices
UPSTREAM.lock                            # pinned codexclaw commit
```

## Relationship to codexclaw

| | codexclaw | cursorclaw |
| --- | --- | --- |
| Runtime | OpenAI Codex plugin | Cursor plugin |
| Manifest | `.codex-plugin/plugin.json` | `.cursor-plugin/plugin.json` |
| CLI | `cxc` / `codexclaw` | `crc` / `cursorclaw` |
| State dir | `.codexclaw/` | `.cursorclaw/` (dual-read during port) |

Upstream project: https://github.com/lidge-jun/codexclaw

## Development

```bash
npm run build
npm run gate
npm test
```

Hook parity and Cursor I/O adapters are tracked in [PORTING.md](PORTING.md).

## License

MIT — see [LICENSE](LICENSE).
