**한국어** | [English](README.md) | [中文](README.zh.md)

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

**lidgeclaw**는 [codexclaw](https://github.com/lidge-jun/codexclaw) 계열 규율을 **Cursor(`cursorclaw`) + ZCode(`zclaw`)** 두 런타임에 담는 우산 저장소입니다. 스킬은 `plugins/cursorclaw/skills/` 한곳에 두고 zclaw가 심볼릭 링크로 공유합니다.

## 설치

```bash
# Cursor + ZCode 둘 다
./scripts/global-install.sh

# 런타임별
./scripts/global-install.sh --target cursor
./scripts/global-install.sh --target zcode
```

- Cursor: 플러그인·스킬·훅·`crc` CLI → 세션 재시작
- ZCode: 로컬 마켓플레이스 등록 후 **zclaw** 설치 → 세션 재시작

## 레이아웃

| 경로 | 역할 |
| --- | --- |
| `plugins/cursorclaw/` | Cursor 플러그인 (스킬 원본) |
| `plugins/zclaw/` | ZCode 플러그인 (공유 스킬 + SessionStart 훅) |

자세한 표는 [PORTING.md](PORTING.md), 업스트림 핀은 [UPSTREAM.lock](UPSTREAM.lock).

## 라이선스

MIT — [LICENSE](LICENSE).
