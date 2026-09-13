#!/usr/bin/env bash
# Report drift between plugins/shared and the pinned sibling codexclaw checkout.
# Read-only: never writes ../codexclaw.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UPSTREAM="${CODEXCLAW_CHECKOUT:-$ROOT/../codexclaw}"
PIN="$(awk -F= '/^upstream-codexclaw=/{print $2}' "$ROOT/UPSTREAM.lock" | tr -d '[:space:]')"
SRC="$UPSTREAM/plugins/codexclaw"
DST="$ROOT/plugins/shared"

echo "lidgeclaw: $ROOT"
echo "upstream checkout: $UPSTREAM"
echo "UPSTREAM.lock pin: ${PIN:-unset}"
if [ -d "$UPSTREAM/.git" ]; then
  echo "upstream HEAD: $(git -C "$UPSTREAM" rev-parse --short HEAD 2>/dev/null || echo unknown)"
fi
[ -d "$SRC/skills" ] || { echo "error: missing $SRC/skills" >&2; exit 1; }
[ -d "$DST/skills" ] || { echo "error: missing $DST/skills" >&2; exit 1; }

echo
echo "=== skills ==="
diff -rq "$DST/skills" "$SRC/skills" --exclude '.DS_Store' --exclude '__pycache__' --exclude 'nonexistent-home' || true
echo
echo "=== note ==="
echo "Agents/commands are Markdown here vs Codex .toml/hook JSON upstream; expect format diffs."
echo "This script does not copy or merge. Update overlays in lidgeclaw only."
