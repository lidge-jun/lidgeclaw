**한국어** | [English](README.md) | [中文](README.zh.md)

# cursorclaw

[codexclaw](https://github.com/lidge-jun/codexclaw)의 **Cursor 런타임 포크**입니다. Codex 플러그인 대신 Cursor 플러그인(skills / rules / agents / commands / hooks)으로 같은 개발 규율(dev 스킬 패밀리, PABCD, 서브에이전트 역할)을 담습니다.

현재 **0.1.0 스캐폴드** 단계입니다. 자세한 이식 표는 [PORTING.md](PORTING.md), 업스트림 핀은 [UPSTREAM.lock](UPSTREAM.lock)을 보세요.

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
