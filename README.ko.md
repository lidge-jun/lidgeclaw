**한국어** | [English](README.md) | [中文](README.zh.md)

# cursorclaw

<p align="center">
  <img src="https://img.shields.io/badge/runtime-Cursor-black" alt="Cursor runtime">
  <img src="https://img.shields.io/badge/skills-29-blue" alt="29 skills">
  <img src="https://img.shields.io/badge/hooks-7-blue" alt="7 hooks">
  <img src="https://img.shields.io/badge/tests-0_passing-lightgrey" alt="0 tests passing">
  <img src="https://img.shields.io/badge/upstream-codexclaw-red" alt="upstream codexclaw">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="MIT"></a>
</p>

[cursorclaw](https://github.com/lidge-jun/codexclaw)의 **Cursor 런타임 포크**입니다. Codex 플러그인 대신 Cursor 플러그인(skills / rules / agents / commands / hooks)으로 같은 개발 규율(dev 스킬 패밀리, PABCD, 서브에이전트 역할)을 담습니다.

**0.2.0** 패리티 패키징: 전체 스킬, Codex급 훅 팬아웃, 에이전트/커맨드, dogfood `.cursor/` 배선, `crc` CLI. 자세한 표는 [PORTING.md](PORTING.md), 업스트림 핀은 [UPSTREAM.lock](UPSTREAM.lock).

## 설치

1. 이 저장소를 clone합니다.
2. Cursor **Customize → Plugins**에서 이 저장소(또는 `plugins/cursorclaw`)를 로컬 플러그인으로 추가합니다.
3. 에이전트 세션을 다시 시작합니다.
4. `sessionStart` 배너와 스킬 목록을 확인합니다.

CLI (선택):

```bash
alias crc='node /path/to/cursorclaw/bin/cursorclaw.mjs'
crc status
```

## 라이선스

MIT — [LICENSE](LICENSE).
