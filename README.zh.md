**中文** | [English](README.md) | [한국어](README.ko.md)

# lidgeclaw

<p align="center">
  <img src="https://img.shields.io/badge/runtime-Cursor-black" alt="Cursor runtime">
  <img src="https://img.shields.io/badge/runtime-ZCode-blue" alt="ZCode runtime">
  <img src="https://img.shields.io/badge/skills-29-blue" alt="29 skills">
  <img src="https://img.shields.io/badge/hooks-7-blue" alt="7 hooks">
  <img src="https://img.shields.io/badge/tests-0_passing-lightgrey" alt="0 tests passing">
  <img src="https://img.shields.io/badge/upstream-codexclaw-red" alt="upstream codexclaw">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="MIT"></a>
</p>

**lidgeclaw** 是 [codexclaw](https://github.com/lidge-jun/codexclaw) 纪律的伞仓：同一套 skills，两个运行时 —— **cursorclaw**（Cursor）与 **zclaw**（ZCode）。skills 以 `plugins/cursorclaw/skills/` 为源，zclaw 通过符号链接共享。

## 安装

```bash
./scripts/global-install.sh                 # Cursor + ZCode
./scripts/global-install.sh --target cursor
./scripts/global-install.sh --target zcode
```

移植对照见 [PORTING.md](PORTING.md)。

## 许可证

MIT — 见 [LICENSE](LICENSE)。
