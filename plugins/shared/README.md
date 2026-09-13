# plugins/shared

Mechanical source of truth for **shareable** lidgeclaw content.

| Path | Shared by |
| --- | --- |
| `skills/` | cursorclaw, zclaw, claudeclaw |
| `agents/*.md` | cursorclaw, zclaw, claudeclaw |
| `commands/` | cursorclaw, zclaw, claudeclaw |

Host plugins must **symlink** these trees. Install copies flatten with `rsync -aL`.

Not here:

- Codex `*.toml` agents (`plugins/cursorclaw/agents/`)
- Compiled `components/` (`plugins/cursorclaw/components/`)
- Host manifests and hook bridges
- Claude-only `plugins/claudeclaw/skills/status/`

Drift vs sibling `../codexclaw` is reported by `scripts/sync-from-upstream.sh` (read-only).
