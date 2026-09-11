#!/usr/bin/env bash
# global-install.sh — install lidgeclaw into Cursor and/or ZCode homes.
#
# Installs (idempotent):
#   Cursor (--target cursor|all):
#     1. Plugin copy → ~/.cursor/plugins/local/cursorclaw
#     2. Skill symlinks → ~/.cursor/skills/<name>
#     3. User hooks → ~/.cursor/hooks.json
#     4. Core rule → ~/.cursor/rules/cursorclaw-core.mdc
#     5. PATH CLI → ~/.local/bin/{crc,cursorclaw,lidgeclaw,lc}
#   ZCode (--target zcode|all):
#     1. Marketplace tree → ~/.zcode/cli/plugins/marketplaces/lidgeclaw
#     2. Register in known_marketplaces.json (directory source)
#     3. Skill symlinks → ~/.zcode/skills/<name> (optional convenience)
#
# Usage:
#   scripts/global-install.sh
#   scripts/global-install.sh --target cursor|zcode|all
#   scripts/global-install.sh --no-build
#   scripts/global-install.sh --status
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLUGIN_SRC="$REPO_ROOT/plugins/cursorclaw"
ZCLAW_SRC="$REPO_ROOT/plugins/zclaw"
CURSOR_HOME="${CURSOR_HOME:-$HOME/.cursor}"
PLUGIN_DST="$CURSOR_HOME/plugins/local/cursorclaw"
SKILLS_DST="$CURSOR_HOME/skills"
RULES_DST="$CURSOR_HOME/rules"
HOOKS_FILE="$CURSOR_HOME/hooks.json"
BIN_DIR="${LIDGECLAW_BIN_DIR:-${CURSORCLAW_BIN_DIR:-$HOME/.local/bin}}"
ZCODE_HOME="${ZCODE_HOME:-$HOME/.zcode}"
ZCODE_PLUGINS="$ZCODE_HOME/cli/plugins"
ZCODE_MARKET_DST="$ZCODE_PLUGINS/marketplaces/lidgeclaw"
ZCODE_SKILLS_DST="$ZCODE_HOME/skills"
ZCODE_KNOWN="$ZCODE_PLUGINS/known_marketplaces.json"

die() { echo "error: $*" >&2; exit 1; }
[ -d "$PLUGIN_SRC" ] || die "cursorclaw plugin missing: $PLUGIN_SRC"
[ -f "$PLUGIN_SRC/.cursor-plugin/plugin.json" ] || die "Cursor plugin manifest missing"
[ -d "$ZCLAW_SRC" ] || die "zclaw plugin missing: $ZCLAW_SRC"
[ -f "$ZCLAW_SRC/.zcode-plugin/plugin.json" ] || die "ZCode plugin manifest missing"

BUILD=1
TARGET=all
ARGS=("$@")
i=0
while [ "$i" -lt "${#ARGS[@]}" ]; do
  arg="${ARGS[$i]}"
  case "$arg" in
    --no-build) BUILD=0 ;;
    --target)
      i=$((i + 1))
      [ "$i" -lt "${#ARGS[@]}" ] || die "--target requires cursor|zcode|all"
      TARGET="${ARGS[$i]}"
      case "$TARGET" in cursor|zcode|all) ;; *) die "bad --target: $TARGET" ;; esac
      ;;
    --target=*)
      TARGET="${arg#--target=}"
      case "$TARGET" in cursor|zcode|all) ;; *) die "bad --target: $TARGET" ;; esac
      ;;
    --status)
      echo "repo:    $REPO_ROOT"
      echo "=== cursorclaw (Cursor) ==="
      echo "plugin:  $PLUGIN_DST $([ -d "$PLUGIN_DST" ] && echo OK || echo MISSING)"
      echo "hooks:   $HOOKS_FILE $([ -f "$HOOKS_FILE" ] && echo OK || echo MISSING)"
      echo "skills:  $(find "$SKILLS_DST" -maxdepth 1 -type l 2>/dev/null | wc -l | tr -d ' ') symlinks"
      echo "rule:    $RULES_DST/cursorclaw-core.mdc $([ -f "$RULES_DST/cursorclaw-core.mdc" ] && echo OK || echo MISSING)"
      echo "crc:     $BIN_DIR/crc $([ -x "$BIN_DIR/crc" ] && echo OK || echo MISSING)"
      echo "lidge:   $BIN_DIR/lidgeclaw $([ -x "$BIN_DIR/lidgeclaw" ] && echo OK || echo MISSING)"
      echo "=== zclaw (ZCode) ==="
      echo "market:  $ZCODE_MARKET_DST $([ -d "$ZCODE_MARKET_DST" ] && echo OK || echo MISSING)"
      echo "zskills: $(find "$ZCODE_SKILLS_DST" -maxdepth 1 -type l 2>/dev/null | wc -l | tr -d ' ') symlinks"
      if [ -f "$ZCODE_KNOWN" ]; then
        python3 - "$ZCODE_KNOWN" <<'PY'
import json, sys
from pathlib import Path
d = json.loads(Path(sys.argv[1]).read_text())
ids = [m.get("id") for m in d.get("marketplaces", [])]
print("known:  ", "lidgeclaw" if "lidgeclaw" in ids else "lidgeclaw NOT registered", "→", ", ".join(ids))
PY
      else
        echo "known:   MISSING ($ZCODE_KNOWN)"
      fi
      exit 0
      ;;
    *) die "unknown argument: $arg" ;;
  esac
  i=$((i + 1))
done

install_cursor() {
  if [ "$BUILD" = 1 ]; then
    echo "[lidgeclaw/cursorclaw] building components…"
    node "$PLUGIN_SRC/scripts/build.mjs"
  fi

  echo "[lidgeclaw/cursorclaw] installing plugin copy → $PLUGIN_DST"
  mkdir -p "$(dirname "$PLUGIN_DST")"
  rm -rf "$PLUGIN_DST"
  mkdir -p "$PLUGIN_DST"
  rsync -a \
    --exclude 'node_modules' \
    --exclude 'gui/node_modules' \
    --exclude 'gui/dist' \
    --exclude '.DS_Store' \
    --exclude 'codex-legacy' \
    "$PLUGIN_SRC/" "$PLUGIN_DST/"
  if [ -d "$PLUGIN_SRC/hooks/codex-legacy" ]; then
    mkdir -p "$PLUGIN_DST/hooks"
    rsync -a "$PLUGIN_SRC/hooks/codex-legacy/" "$PLUGIN_DST/hooks/codex-legacy/"
  fi

  echo "[lidgeclaw/cursorclaw] linking skills → $SKILLS_DST"
  mkdir -p "$SKILLS_DST"
  for d in "$PLUGIN_DST/skills"/*; do
    [ -d "$d" ] || continue
    [ -f "$d/SKILL.md" ] || continue
    name="$(basename "$d")"
    ln -sfn "$d" "$SKILLS_DST/$name"
  done

  echo "[lidgeclaw/cursorclaw] installing core rule → $RULES_DST"
  mkdir -p "$RULES_DST"
  cp "$PLUGIN_DST/rules/cursorclaw-core.mdc" "$RULES_DST/cursorclaw-core.mdc"

  BRIDGE="$PLUGIN_DST/scripts/cursor-bridge.mjs"
  chmod +x "$BRIDGE" "$PLUGIN_DST/scripts/"*.sh 2>/dev/null || true

  echo "[lidgeclaw/cursorclaw] writing user hooks → $HOOKS_FILE"
  if [ -f "$HOOKS_FILE" ] && ! grep -q 'cursor-bridge.mjs' "$HOOKS_FILE" 2>/dev/null; then
    cp "$HOOKS_FILE" "$HOOKS_FILE.pre-cursorclaw.bak"
    echo "[lidgeclaw/cursorclaw] backed up previous hooks to $HOOKS_FILE.pre-cursorclaw.bak"
  fi

  python3 - "$HOOKS_FILE" "$BRIDGE" <<'PY'
import json, sys
from pathlib import Path
hooks_path = Path(sys.argv[1])
bridge = sys.argv[2]
entry = {
  "version": 1,
  "hooks": {
    "sessionStart": [{"command": f"node {bridge} session-start", "timeout": 30}],
    "beforeSubmitPrompt": [{"command": f"node {bridge} beforeSubmitPrompt", "timeout": 20}],
    "preToolUse": [{"command": f"node {bridge} preToolUse", "timeout": 20}],
    "postToolUse": [{"command": f"node {bridge} postToolUse", "timeout": 20}],
    "preCompact": [{"command": f"node {bridge} preCompact", "timeout": 20}],
    "stop": [{"command": f"node {bridge} stop", "timeout": 20, "loop_limit": 8}],
    "subagentStop": [{"command": f"node {bridge} subagentStop", "timeout": 20, "loop_limit": 8}],
  },
}
if hooks_path.exists():
  try:
    prior = json.loads(hooks_path.read_text())
  except Exception:
    prior = {"version": 1, "hooks": {}}
  hooks = prior.get("hooks") if isinstance(prior.get("hooks"), dict) else {}
  for ev, arr in entry["hooks"].items():
    existing = hooks.get(ev) if isinstance(hooks.get(ev), list) else []
    existing = [h for h in existing if "cursor-bridge.mjs" not in str(h.get("command", ""))]
    hooks[ev] = existing + arr
  prior["version"] = 1
  prior["hooks"] = hooks
  hooks_path.write_text(json.dumps(prior, indent=2) + "\n")
else:
  hooks_path.write_text(json.dumps(entry, indent=2) + "\n")
print("hooks written")
PY

  echo "[lidgeclaw] installing CLI → $BIN_DIR"
  mkdir -p "$BIN_DIR"
  ROOT_CLI="$REPO_ROOT/bin/cursorclaw.mjs"
  for name in cursorclaw crc lidgeclaw lc; do
    cat > "$BIN_DIR/$name" <<EOF
#!/usr/bin/env bash
exec node "$ROOT_CLI" "\$@"
EOF
    chmod +x "$BIN_DIR/$name"
  done

  mkdir -p "$HOME/.cursorclaw" "$HOME/.lidgeclaw"
  python3 - <<PY
import json, time
from pathlib import Path
stamp = {
  "umbrella": "lidgeclaw",
  "surface": "cursorclaw",
  "installedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
  "repoRoot": "$REPO_ROOT",
  "pluginDst": "$PLUGIN_DST",
  "bridge": "$BRIDGE",
  "version": json.loads(Path("$PLUGIN_DST/.cursor-plugin/plugin.json").read_text())["version"],
}
Path("$HOME/.cursorclaw/install.json").write_text(json.dumps(stamp, indent=2) + "\n")
Path("$HOME/.lidgeclaw/install-cursor.json").write_text(json.dumps(stamp, indent=2) + "\n")
print(json.dumps(stamp, indent=2))
PY

  echo "[lidgeclaw/cursorclaw] Cursor install complete."
}

install_zcode() {
  echo "[lidgeclaw/zclaw] staging marketplace → $ZCODE_MARKET_DST"
  mkdir -p "$ZCODE_PLUGINS/marketplaces"
  rm -rf "$ZCODE_MARKET_DST"
  mkdir -p "$ZCODE_MARKET_DST/.zcode-plugin" "$ZCODE_MARKET_DST/plugins"

  # Marketplace manifest (paths relative to marketplace root)
  cp "$REPO_ROOT/.zcode-plugin/marketplace.json" "$ZCODE_MARKET_DST/.zcode-plugin/marketplace.json"

  # Real copy of zclaw; resolve skill/agent/command symlinks into cursorclaw content
  # so the staged tree is self-contained under marketplaces/lidgeclaw.
  rsync -aL \
    --exclude 'node_modules' \
    --exclude '.DS_Store' \
    "$ZCLAW_SRC/" "$ZCODE_MARKET_DST/plugins/zclaw/"

  # Also stage cursorclaw skills source for reference / future shared install
  # (zclaw already has resolved skill trees via -L)

  echo "[lidgeclaw/zclaw] registering known marketplace"
  mkdir -p "$(dirname "$ZCODE_KNOWN")"
  python3 - "$ZCODE_KNOWN" "$ZCODE_MARKET_DST" <<'PY'
import json, sys
from pathlib import Path
from datetime import datetime, timezone
known_path = Path(sys.argv[1])
market_path = Path(sys.argv[2]).resolve()
entry = {
  "id": "lidgeclaw",
  "source": {
    "source": "directory",
    "path": str(market_path),
  },
  "name": "lidgeclaw",
  "description": "lidgeclaw — zclaw (ZCode) + cursorclaw (Cursor) umbrella marketplace",
  "addedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
  "pluginCount": 1,
}
if known_path.exists():
  try:
    data = json.loads(known_path.read_text())
  except Exception:
    data = {"version": 1, "marketplaces": []}
else:
  data = {"version": 1, "marketplaces": []}
markets = data.get("marketplaces") if isinstance(data.get("marketplaces"), list) else []
markets = [m for m in markets if m.get("id") != "lidgeclaw"]
markets.append(entry)
data["version"] = data.get("version", 1)
data["marketplaces"] = markets
known_path.write_text(json.dumps(data, indent=2) + "\n")
print("registered", entry["id"], "→", market_path)
PY

  echo "[lidgeclaw/zclaw] linking skills → $ZCODE_SKILLS_DST"
  mkdir -p "$ZCODE_SKILLS_DST"
  for d in "$ZCODE_MARKET_DST/plugins/zclaw/skills"/*; do
    [ -d "$d" ] || continue
    [ -f "$d/SKILL.md" ] || continue
    name="$(basename "$d")"
    ln -sfn "$d" "$ZCODE_SKILLS_DST/$name"
  done

  mkdir -p "$HOME/.lidgeclaw"
  python3 - <<PY
import json, time
from pathlib import Path
stamp = {
  "umbrella": "lidgeclaw",
  "surface": "zclaw",
  "installedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
  "repoRoot": "$REPO_ROOT",
  "marketplaceDst": "$ZCODE_MARKET_DST",
  "version": json.loads(Path("$ZCLAW_SRC/.zcode-plugin/plugin.json").read_text())["version"],
}
Path("$HOME/.lidgeclaw/install-zcode.json").write_text(json.dumps(stamp, indent=2) + "\n")
print(json.dumps(stamp, indent=2))
PY

  echo "[lidgeclaw/zclaw] ZCode marketplace staged."
  echo "  Open ZCode → Settings → Plugins → enable/install zclaw from marketplace 'lidgeclaw' if needed."
  echo "  Restart the ZCode agent session so skills/hooks reload."
}

case "$TARGET" in
  cursor) install_cursor ;;
  zcode) install_zcode ;;
  all)
    install_cursor
    install_zcode
    ;;
esac

echo
echo "[lidgeclaw] done (target=$TARGET)."
echo "  status: ./scripts/global-install.sh --status"
