**English** | [한국어](README.ko.md) | [中文](README.zh.md)

<p align="center">
  <img src="plugins/cursorclaw/assets/logo.png" alt="lidgeclaw" width="140" />
</p>

<h1 align="center">lidgeclaw</h1>

<p align="center">
  <img src="https://img.shields.io/badge/runtime-Cursor-black" alt="Cursor runtime">
  <img src="https://img.shields.io/badge/runtime-ZCode-blue" alt="ZCode runtime">
  <img src="https://img.shields.io/badge/skills-29-blue" alt="29 skills">
  <img src="https://img.shields.io/badge/hooks-7-blue" alt="7 hooks">
  <img src="https://img.shields.io/badge/tests-0_passing-lightgrey" alt="0 tests passing">
  <img src="https://img.shields.io/badge/upstream-codexclaw-red" alt="upstream codexclaw">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="MIT"></a>
</p>

<p align="center">
  One repo, two runtimes: <strong>cursorclaw</strong> (Cursor) + <strong>zclaw</strong> (ZCode).<br>
  Shared skills and cli-jaw-style discipline, forked from
  <a href="https://github.com/lidge-jun/codexclaw">codexclaw</a>.
</p>

---

**lidgeclaw** is the umbrella for:

| Plugin | Runtime | Path |
| --- | --- | --- |
| **cursorclaw** | Cursor | `plugins/cursorclaw/` |
| **zclaw** | ZCode | `plugins/zclaw/` |

Skills live once under `plugins/cursorclaw/skills/`; zclaw mounts them via relative symlinks. Workflow inspiration remains [OMO / oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent). Credits: [NOTICE.md](NOTICE.md).

## Install

### Cursor (cursorclaw)

```bash
./scripts/global-install.sh --target cursor
# or: ./scripts/global-install.sh   # default installs both
```

Installs plugin → `~/.cursor/plugins/local/cursorclaw`, skills, hooks, rule, and `crc` / `cursorclaw` / `lidgeclaw` CLI. Restart the Cursor agent session.

### ZCode (zclaw)

```bash
./scripts/global-install.sh --target zcode
```

Registers this checkout as a local ZCode marketplace and stages `zclaw`. In ZCode you can also **Settings → Plugins → Create → Add marketplace** → this repo, then install **zclaw**. Restart the ZCode session.

Check status: `./scripts/global-install.sh --status`.

## Layout

```text
.cursor-plugin/marketplace.json   # Cursor marketplace (cursorclaw)
.zcode-plugin/marketplace.json    # ZCode marketplace (zclaw)
plugins/cursorclaw/               # Cursor plugin (skills source of truth)
plugins/zclaw/                    # ZCode plugin (symlinked skills + thin hooks)
bin/cursorclaw.mjs                # crc / cursorclaw / lidgeclaw entry
PORTING.md
UPSTREAM.lock
```

## CLI

```bash
lidgeclaw status   # aliases: crc, cursorclaw, lc
crc doctor
```

## Development

```bash
npm run build
npm run gate
npm test
```

Cursor hook parity: [PORTING.md](PORTING.md). ZCode hooks start at SessionStart — see [plugins/zclaw/README.md](plugins/zclaw/README.md).

## License

MIT — see [LICENSE](LICENSE).
