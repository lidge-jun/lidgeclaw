**中文** | [English](README.md) | [한국어](README.ko.md)

# lidgeclaw

<p align="center">
  <img src="https://img.shields.io/badge/runtime-Cursor-black" alt="Cursor runtime">
  <img src="https://img.shields.io/badge/runtime-ZCode-blue" alt="ZCode runtime">
  <img src="https://img.shields.io/badge/runtime-Claude_Code-orange" alt="Claude Code runtime">
  <img src="https://img.shields.io/badge/skills-29-blue" alt="29 skills">
  <img src="https://img.shields.io/badge/hooks-7-blue" alt="7 hooks">
  <img src="https://img.shields.io/badge/tests-0_passing-lightgrey" alt="0 tests passing">
  <img src="https://img.shields.io/badge/upstream-codexclaw-red" alt="upstream codexclaw">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="MIT"></a>
</p>

**lidgeclaw** 是 [codexclaw](https://github.com/lidge-jun/codexclaw) 纪律的伞仓：三个运行时 —— **cursorclaw**（Cursor）、**zclaw**（ZCode）、**claudeclaw**（Claude Code）。可共享的 skills / agent `.md` / commands 放在 `plugins/shared/`，各宿主用符号链接挂载；钩子与清单仍为宿主独有。详见 [PORTING.md](PORTING.md)。

## 安装

```bash
./scripts/global-install.sh                 # Cursor + ZCode + Claude
./scripts/global-install.sh --target cursor
./scripts/global-install.sh --target zcode
./scripts/global-install.sh --target claude
```

移植对照见 [PORTING.md](PORTING.md)。

## 许可证

MIT — 见 [LICENSE](LICENSE)。
