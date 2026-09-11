#!/usr/bin/env node
/**
 * zcode-bridge.mjs — thin ZCode hook adapter for zclaw (lidgeclaw).
 *
 * ZCode events are Claude/Codex-shaped. v0.1 injects SessionStart context;
 * fuller component fan-out can reuse plugins/cursorclaw/components later.
 *
 * stdin: one JSON line from ZCode
 * stdout: protocol JSON only
 */
import { readFileSync } from "node:fs";

const MAX_STDIN = 2_000_000;

function readStdin() {
  try {
    const raw = readFileSync(0, "utf8");
    if (raw.length > MAX_STDIN) return null;
    const text = raw.trim();
    if (!text) return {};
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function emit(obj) {
  process.stdout.write(`${JSON.stringify(obj)}\n`);
}

const input = readStdin() || {};
const event =
  input.hook_event_name ||
  input.hookEventName ||
  process.argv[2] ||
  "";

const banner =
  "zclaw (lidgeclaw) is armed for ZCode. Shared skills with cursorclaw — use `dev` for C0–C5 classification; full PABCD for C4. State prefers `.cursorclaw/` (legacy `.codexclaw/` still migrates).";

if (event === "SessionStart" || event === "session-start") {
  emit({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: banner,
    },
  });
  process.exit(0);
}

// Other events: no-op success (fail-open). Wire component pipelines later.
emit({});
process.exit(0);
