# 040 — Global Claude install on this machine

## Depends on

030 validate green.

## `scripts/global-install.sh`

- `--target claude|all`
- `--status` shows marketplace + `claude plugin list`
- `install_claude`:
  1. `claude plugin marketplace add "$REPO_ROOT"` (idempotent: remove+add if needed)
  2. `claude plugin install claudeclaw@lidgeclaw -s user -y`
  3. Stamp `~/.lidgeclaw/install-claude.json`
  4. Do **not** symlink plugin skills into `~/.claude/skills/`

## Accept

- `claude plugin list` includes claudeclaw
- `~/.claude/plugins/installed_plugins.json` mentions claudeclaw
- aside-jun still only under `~/.claude/skills/aside-jun` (unchanged)
