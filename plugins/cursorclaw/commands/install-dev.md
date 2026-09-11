---
name: install-dev
description: Dogfood-install this cursorclaw checkout into Cursor for local development
---

# Install cursorclaw (dev)

1. Confirm workspace root is the cursorclaw repo.
2. In Cursor: **Customize → Plugins** and add this repository (or load `plugins/cursorclaw` as a local Cursor plugin).
3. Restart the agent session so skills/hooks reload.
4. Verify `sessionStart` prints the cursorclaw banner.
5. Run `node bin/cursorclaw.mjs status` (or `doctor`) and report what is implemented vs stubbed.
