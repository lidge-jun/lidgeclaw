# Subagent hook guard — plan (260709)

## Problem

Incident (260709 morning, jawcode workspace): GPT-5.5 subagents spawned via
`spawn_agent` were intercepted by codexclaw turn hooks. Root cause chain:

- codex-rs runs `UserPromptSubmit` (and tool hooks) for thread-spawned subagent
  turns, stamping optional `agent_id`/`agent_type` into hook stdin
  (codex-rs `hooks/src/schema.rs:270,537`, commit `16d85e270`).
- Child hook payloads reuse the PARENT session id (commit `fbfbfe5fc`), so child
  turns in the same cwd read/write the parent's
  `.cursorclaw/sessions/<parent>.json` — parent in phase `I` means every child
  prompt turn gets the INTERVIEW directive re-injected
  (`components/pabcd-state/src/hook.ts:366,410`).
- The directive instructs `request_user_input`, which codex-rs rejects for any
  non-root agent (`core/src/tools/handlers/request_user_input.rs:59`, commit
  `7a19b1422`) → children stall in a retry loop (evidence:
  `jawcode/.cursorclaw/evidence/20260709_*attempt/retry*.md`).
- codexclaw has NO runtime subagent discriminator today; "subagents never ask"
  exists only as directive prose (`hook.ts:225`).

Decision (user, this session): **Full guard** — turn-level codexclaw hooks
no-op for subagent turns; root-only enforcement for request_user_input
directives falls out of the same guard.

## Changes

1. `plugins/cursorclaw/components/pabcd-state/src/parse.ts`
   - Add `isSubagentHookPayload(raw: string): boolean` — true when the stdin
     JSON object carries a non-empty string `agent_id` or `agent_type`.
     Unparseable/absent → false (fail-open, existing behavior preserved).
2. `plugins/cursorclaw/components/pabcd-state/src/cli.ts`
   - In the `hook` path, immediately after `readStdin()` and BEFORE the
     fail-closed `pre-tool-use` branch:
     `if (event !== "subagent-stop" && isSubagentHookPayload(raw)) process.exit(0);`
   - Covers every REGISTERED pabcd-state turn hook: user-prompt-submit, stop,
     pre-tool-use (goal budget + interview-in-goal fail-closed gate),
     pre-tool-use-lint, post-tool-use, post-tool-use-render-observation,
     post-compact. (Friction/edit-shape/session-start-rules events remain
     cli-reachable but are unregistered in plugin.json; they inherit the guard
     anyway. Active SessionStart hooks route to provider-bridge/cxc-ops, not
     this cli, and child startup is remapped to SubagentStart by the runtime.)

## Deliberate exemptions

- `subagent-stop` (evidence gate) — the intentional child-scoped surface.
- `subagent-config/spawn-attach-hook` — only enriches spawn messages with
  skill mentions; desirable at any spawn depth; injects no PABCD state.
- SessionStart hooks — runtime remaps child startup to `SubagentStart`
  (codex-rs `core/src/hook_runtime.rs:103`); these never see child sessions.

## Safety argument

- Root turns unaffected: root payloads never carry `agent_id`/`agent_type`.
- Skipping the fail-closed goal gate for children is safe: codex-rs natively
  denies non-root `request_user_input` (root-only handler).
- Child post-compact no longer resets the PARENT's reinject cursor
  (shared-session-id pollution fixed by the same guard).

## Verification

- Unit: `isSubagentHookPayload` cases in pabcd-state tests.
- E2E (`plugins/cursorclaw/test/hook-e2e.test.mjs`): UserPromptSubmit payload
  with `agent_type` + interview-trigger prompt → exit 0, empty stdout, no
  session state write; SubagentStop with `agent_type: worker` still gated.
- E2E fail-closed pair (audit P1/P2, discriminating): with a seeded ACTIVE
  `goals_1.sqlite` (thread_goals fixture, CURSOR_HOME/CODEX_SQLITE_HOME env),
  PreToolUse `request_user_input`:
  - root payload (no agent fields) → DENY envelope (R-9 regression holds);
  - same payload + `agent_type: "worker"` → exit 0, EMPTY stdout (guard skips
    before `handlePreToolUseFailClosed`).
- Gate: `npm run build` then `npm test` (node --test, concurrency 1).
