import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BRIDGE = join(ROOT, "hooks", "claude-bridge.mjs");

function run(event, payload) {
  return spawnSync(process.execPath, [BRIDGE, event], {
    input: JSON.stringify(payload),
    encoding: "utf8",
    timeout: 15_000,
  });
}

test("SessionStart emits hookSpecificOutput additionalContext", () => {
  const res = run("SessionStart", { cwd: ROOT, session_id: "test-session-1" });
  assert.equal(res.status, 0, res.stderr);
  const obj = JSON.parse(res.stdout.trim().split("\n").at(-1));
  assert.equal(obj.hookSpecificOutput.hookEventName, "SessionStart");
  assert.match(obj.hookSpecificOutput.additionalContext, /claudeclaw/);
});

test("unknown event fail-opens to empty object or newline JSON", () => {
  const res = run("NotAnEvent", { cwd: ROOT, session_id: "test-session-2" });
  assert.equal(res.status, 0, res.stderr);
});

test("PreToolUse allow on empty tool", () => {
  const res = run("PreToolUse", {
    cwd: ROOT,
    session_id: "test-session-3",
    tool_name: "Read",
    tool_input: { file_path: "/tmp/x" },
  });
  assert.equal(res.status, 0, res.stderr);
  const obj = JSON.parse(res.stdout.trim().split("\n").at(-1));
  assert.equal(obj.hookSpecificOutput.permissionDecision, "allow");
});
