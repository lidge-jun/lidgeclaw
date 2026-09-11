**中文** | [English](README.md) | [한국어](README.ko.md)

# cursorclaw

<p align="center">
  <img src="https://img.shields.io/badge/runtime-Cursor-black" alt="Cursor runtime">
  <img src="https://img.shields.io/badge/skills-29-blue" alt="29 skills">
  <img src="https://img.shields.io/badge/hooks-7-blue" alt="7 hooks">
  <img src="https://img.shields.io/badge/tests-0_passing-lightgrey" alt="0 tests passing">
  <img src="https://img.shields.io/badge/upstream-codexclaw-red" alt="upstream codexclaw">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="MIT"></a>
</p>

[cursorclaw](https://github.com/lidge-jun/codexclaw) 的 **Cursor 运行时分支**。把同样的开发纪律（dev skill 家族、PABCD、子代理角色）打成 Cursor 插件，而不是 Codex 插件。

**0.2.0** 完整打包：全部 skills、Codex 级 hook fan-out、agents/commands、dogfood `.cursor/`、`crc` CLI。移植对照见 [PORTING.md](PORTING.md)，上游钉扎见 [UPSTREAM.lock](UPSTREAM.lock)。

## 安装

1. Clone 本仓库。
2. 在 Cursor **Customize → Plugins** 中添加本仓库（或 `plugins/cursorclaw`）。
3. 重启 agent 会话并确认 `sessionStart` 横幅。

MIT — 见 [LICENSE](LICENSE)。
