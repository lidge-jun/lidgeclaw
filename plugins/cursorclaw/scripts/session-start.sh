#!/usr/bin/env bash
set -euo pipefail
PLUGIN_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION_FILE="$PLUGIN_ROOT/.cursor-plugin/plugin.json"
VERSION=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1])).get("version","0.0.0"))' "$VERSION_FILE" 2>/dev/null || echo 0.0.0)
CONTEXT=$(cat <<CTX
cursorclaw ${VERSION} loaded for Cursor.
PABCD / skill discipline is available via plugin skills (crc-*/cxc-* folders).
State directory: .codexclaw/ (Codex-era .codexclaw still recognized during port).
CLI: node bin/cursorclaw.mjs (alias: crc) — orchestrate/doctor/map still porting from cxc.
CTX
)
python3 -c 'import json,sys; print(json.dumps({"additional_context": sys.argv[1]}))' "$CONTEXT"
