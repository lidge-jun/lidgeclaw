#!/usr/bin/env bash
# global-install.sh — install this cursorclaw checkout into the user's Cursor home.
#
# Installs (idempotent):
#   1. Real plugin copy → ~/.cursor/plugins/local/cursorclaw
#   2. Skill symlinks   → ~/.cursor/skills/<name>
#   3. User hooks       → ~/.cursor/hooks.json (cursorclaw bridge, absolute paths)
#   4. Core rule        → ~/.cursor/rules/cursorclaw-core.mdc
#   5. PATH CLI         → ~/.local/bin/crc + ~/.local/bin/cursorclaw
#
# Usage:
#   scripts/global-install.sh
#   scripts/global-install.sh --no-build
#   scripts/global-install.sh --status
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLUGIN_SRC="$REPO_ROOT/plugins/cursorclaw"
CURSOR_HOME="${CURSOR_HOME:-$HOME/.cursor}"
PLUGIN_DST="$CURSOR_HOME/plugins/local/cursorclaw"
SKILLS_DST="$CURSOR_HOME/skills"
RULES_DST="$CURSOR_HOME/rules"
HOOKS_FILE="$CURSOR_HOME/hooks.json"
BIN_DIR="${CURSORCLAW_BIN_DIR:-$HOME/.local/bin}"

die() { echo "error: $*" >&2; exit 1; }
[ -d "$PLUGIN_SRC" ] || die "plugin source missing: $PLUGIN_SRC"
[ -f "$PLUGIN_SRC/.cursor-plugin/plugin.json" ] || die "Cursor plugin manifest missing"

BUILD=1
for arg in "$@"; do
  case "$arg" in
    --no-build) BUILD=0 ;;
    --status)
      echo "source:  $PLUGIN_SRC"
      echo "plugin:  $PLUGIN_DST $([ -d "$PLUGIN_DST" ] && echo OK || echo MISSING)"
      echo "hooks:   $HOOKS_FILE $([ -f "$HOOKS_FILE" ] && echo OK || echo MISSING)"
      echo "skills:  $(find "$SKILLS_DST" -maxdepth 1 -type l 2>/dev/null | wc -l | tr -d ' ') symlinks"
      echo "rule:    $RULES_DST/cursorclaw-core.mdc $([ -f "$RULES_DST/cursorclaw-core.mdc" ] && echo OK || echo MISSING)"
      echo "crc:     $BIN_DIR/crc $([ -x "$BIN_DIR/crc" ] && echo OK || echo MISSING)"
      exit 0
      ;;
    *) die "unknown argument: $arg" ;;
  esac
done

if [ "$BUILD" = 1 ]; then
  echo "[cursorclaw] building components…"
  node "$PLUGIN_SRC/scripts/build.mjs"
fi

echo "[cursorclaw] installing plugin copy → $PLUGIN_DST"
mkdir -p "$(dirname "$PLUGIN_DST")"
rm -rf "$PLUGIN_DST"
mkdir -p "$PLUGIN_DST"
# Real copy (Cursor resolves plugin assets more reliably than symlinks for some surfaces)
rsync -a \
  --exclude 'node_modules' \
  --exclude 'gui/node_modules' \
  --exclude 'gui/dist' \
  --exclude '.DS_Store' \
  --exclude 'codex-legacy' \
  "$PLUGIN_SRC/" "$PLUGIN_DST/"
# Keep Codex legacy hooks for provenance inside the install too
if [ -d "$PLUGIN_SRC/hooks/codex-legacy" ]; then
  mkdir -p "$PLUGIN_DST/hooks"
  rsync -a "$PLUGIN_SRC/hooks/codex-legacy/" "$PLUGIN_DST/hooks/codex-legacy/"
fi

echo "[cursorclaw] linking skills → $SKILLS_DST"
mkdir -p "$SKILLS_DST"
# Remove previous cursorclaw-managed skill links only (names that exist in plugin)
for d in "$PLUGIN_DST/skills"/*; do
  [ -d "$d" ] || continue
  [ -f "$d/SKILL.md" ] || continue
  name="$(basename "$d")"
  ln -sfn "$d" "$SKILLS_DST/$name"
done

echo "[cursorclaw] installing core rule → $RULES_DST"
mkdir -p "$RULES_DST"
cp "$PLUGIN_DST/rules/cursorclaw-core.mdc" "$RULES_DST/cursorclaw-core.mdc"

BRIDGE="$PLUGIN_DST/scripts/cursor-bridge.mjs"
chmod +x "$BRIDGE" "$PLUGIN_DST/scripts/"*.sh 2>/dev/null || true

echo "[cursorclaw] writing user hooks → $HOOKS_FILE"
# Backup existing hooks once
if [ -f "$HOOKS_FILE" ] && ! grep -q 'cursor-bridge.mjs' "$HOOKS_FILE" 2>/dev/null; then
  cp "$HOOKS_FILE" "$HOOKS_FILE.pre-cursorclaw.bak"
  echo "[cursorclaw] backed up previous hooks to $HOOKS_FILE.pre-cursorclaw.bak"
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
# If prior hooks exist and are not ours, merge by appending our commands per event.
if hooks_path.exists():
  try:
    prior = json.loads(hooks_path.read_text())
  except Exception:
    prior = {"version": 1, "hooks": {}}
  hooks = prior.get("hooks") if isinstance(prior.get("hooks"), dict) else {}
  for ev, arr in entry["hooks"].items():
    existing = hooks.get(ev) if isinstance(hooks.get(ev), list) else []
    # drop previous cursorclaw bridge entries
    existing = [h for h in existing if "cursor-bridge.mjs" not in str(h.get("command", ""))]
    hooks[ev] = existing + arr
  prior["version"] = 1
  prior["hooks"] = hooks
  hooks_path.write_text(json.dumps(prior, indent=2) + "\n")
else:
  hooks_path.write_text(json.dumps(entry, indent=2) + "\n")
print("hooks written")
PY

echo "[cursorclaw] installing CLI → $BIN_DIR"
mkdir -p "$BIN_DIR"
ROOT_CLI="$REPO_ROOT/bin/cursorclaw.mjs"
cat > "$BIN_DIR/cursorclaw" <<EOF
#!/usr/bin/env bash
exec node "$ROOT_CLI" "\$@"
EOF
cat > "$BIN_DIR/crc" <<EOF
#!/usr/bin/env bash
exec node "$ROOT_CLI" "\$@"
EOF
chmod +x "$BIN_DIR/cursorclaw" "$BIN_DIR/crc"

# Record install stamp
mkdir -p "$HOME/.cursorclaw"
python3 - <<PY
import json, time
from pathlib import Path
stamp = {
  "installedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
  "repoRoot": "$REPO_ROOT",
  "pluginDst": "$PLUGIN_DST",
  "bridge": "$BRIDGE",
  "version": json.loads(Path("$PLUGIN_DST/.cursor-plugin/plugin.json").read_text())["version"],
}
Path("$HOME/.cursorclaw/install.json").write_text(json.dumps(stamp, indent=2) + "\n")
print(json.dumps(stamp, indent=2))
PY

echo
echo "[cursorclaw] global install complete."
echo "  plugin: $PLUGIN_DST"
echo "  skills: $SKILLS_DST (symlinked from plugin)"
echo "  hooks:  $HOOKS_FILE"
echo "  rule:   $RULES_DST/cursorclaw-core.mdc"
echo "  cli:    $BIN_DIR/crc"
echo "Restart the Cursor agent session so skills/hooks reload."
