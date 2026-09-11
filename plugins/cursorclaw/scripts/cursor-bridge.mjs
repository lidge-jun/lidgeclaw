#!/usr/bin/env node
/**
 * cursor-bridge.mjs — adapt Cursor hook JSON I/O ↔ pabcd-state Codex hook CLI.
 *
 * Usage (from plugin root, as hooks/hooks.json commands):
 *   node ./scripts/cursor-bridge.mjs <event>
 *
 * Events: session-start | user-prompt-submit | stop | subagent-stop | inject-pending
 *
 * Fail-open: adapter errors exit 0 with a safe Cursor envelope so the agent loop
 * is never blocked by bridge bugs.
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const PLUGIN_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PABCD_CLI = join(PLUGIN_ROOT, "components", "pabcd-state", "dist", "cli.js");
const MODERN_STATE = ".cursorclaw";
const LEGACY_STATE = ".codexclaw";
const MAX_STDIN = 2_000_000;

const event = process.argv[2] || "";

function readStdin() {
  try {
    const raw = readFileSync(0, "utf8");
    if (raw.length > MAX_STDIN) return { overflow: true, raw: "" };
    return { overflow: false, raw };
  } catch {
    return { overflow: false, raw: "" };
  }
}

function parseJson(raw) {
  const text = (raw || "").trim();
  if (!text) return null;
  try {
    const v = JSON.parse(text);
    return v && typeof v === "object" && !Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

function emit(obj) {
  process.stdout.write(`${JSON.stringify(obj)}\n`);
}

function safeExit(obj) {
  if (obj) emit(obj);
  process.exit(0);
}

/** Keep session keys filesystem-safe and stable for pabcd-state. */
function canonicalSessionId(raw) {
  const s = String(raw || "").trim();
  if (!s) return "cursor-unknown";
  if (/^[A-Za-z0-9._-]+$/.test(s) && s.length <= 128) return s;
  const hash = createHash("sha256").update(s).digest("hex").slice(0, 24);
  return `cursor-${hash}`;
}

function resolveCwd(cursor) {
  if (typeof cursor.cwd === "string" && cursor.cwd.trim()) return cursor.cwd.trim();
  const roots = cursor.workspace_roots;
  if (Array.isArray(roots) && typeof roots[0] === "string" && roots[0].trim()) {
    return roots[0].trim();
  }
  return process.cwd();
}

function ensureDualStateDir(cwd) {
  const modern = join(cwd, MODERN_STATE);
  const legacy = join(cwd, LEGACY_STATE);
  try {
    if (!existsSync(modern) && existsSync(legacy)) {
      renameSync(legacy, modern);
    } else {
      mkdirSync(modern, { recursive: true });
    }
  } catch {
    // fail-open
  }
}

function pendingPath(cwd, sessionId) {
  return join(cwd, MODERN_STATE, "pending-injections", `${sessionId}.txt`);
}

function stashInjection(cwd, sessionId, text) {
  const body = String(text || "").trim();
  if (!body) return;
  const path = pendingPath(cwd, sessionId);
  try {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, body, "utf8");
  } catch {
    // fail-open
  }
}

function takeInjection(cwd, sessionId) {
  const path = pendingPath(cwd, sessionId);
  try {
    if (!existsSync(path)) return "";
    const body = readFileSync(path, "utf8").trim();
    rmSync(path, { force: true });
    return body;
  } catch {
    return "";
  }
}

function runPabcd(codexEvent, payloadObj) {
  if (!existsSync(PABCD_CLI)) {
    return { ok: false, stdout: "", stderr: "missing pabcd cli" };
  }
  const input = `${JSON.stringify(payloadObj)}\n`;
  const res = spawnSync(process.execPath, [PABCD_CLI, "hook", codexEvent], {
    input,
    encoding: "utf8",
    cwd: PLUGIN_ROOT,
    env: process.env,
    maxBuffer: 4_000_000,
  });
  return {
    ok: res.status === 0,
    stdout: res.stdout || "",
    stderr: res.stderr || "",
  };
}

function extractCodexContext(stdout) {
  const text = (stdout || "").trim();
  if (!text) return { kind: "empty" };
  let obj;
  try {
    obj = JSON.parse(text);
  } catch {
    return { kind: "raw", text };
  }
  if (obj && typeof obj === "object") {
    if (obj.decision === "block" && typeof obj.reason === "string") {
      return { kind: "block", reason: obj.reason };
    }
    const ctx = obj?.hookSpecificOutput?.additionalContext;
    if (typeof ctx === "string" && ctx.trim()) {
      return { kind: "context", text: ctx };
    }
  }
  return { kind: "empty" };
}

function bannerContext(version) {
  return [
    `cursorclaw ${version} loaded for Cursor.`,
    "PABCD / skill discipline is available via plugin skills.",
    `State directory: ${MODERN_STATE}/ (legacy ${LEGACY_STATE}/ is migrated on first use).`,
    "CLI: node bin/cursorclaw.mjs (alias: crc).",
    "Hook bridge: Cursor events are adapted onto pabcd-state; prompt-time directives may be deferred to the next tool call when Cursor cannot inject context on beforeSubmitPrompt.",
  ].join("\n");
}

function readPluginVersion() {
  try {
    const p = join(PLUGIN_ROOT, ".cursor-plugin", "plugin.json");
    return JSON.parse(readFileSync(p, "utf8")).version || "0.1.0";
  } catch {
    return "0.1.0";
  }
}

function main() {
  const { overflow, raw } = readStdin();
  if (overflow) {
    if (event === "beforeSubmitPrompt" || event === "user-prompt-submit") {
      return safeExit({ continue: false, user_message: "cursorclaw: hook input too large" });
    }
    return safeExit({});
  }

  const cursor = parseJson(raw) || {};
  const cwd = resolveCwd(cursor);
  const sessionId = canonicalSessionId(
    cursor.session_id || cursor.conversation_id || "",
  );
  ensureDualStateDir(cwd);

  if (event === "session-start") {
    runPabcd("session-start", {
      hook_event_name: "SessionStart",
      session_id: sessionId,
      cwd,
    });
    return safeExit({
      env: {
        CURSORCLAW_SESSION_ID: sessionId,
        CURSORCLAW_STATE_DIR: join(cwd, MODERN_STATE),
      },
      additional_context: bannerContext(readPluginVersion()),
    });
  }

  if (event === "user-prompt-submit" || event === "beforeSubmitPrompt") {
    const prompt = typeof cursor.prompt === "string" ? cursor.prompt : "";
    const result = runPabcd("user-prompt-submit", {
      hook_event_name: "UserPromptSubmit",
      session_id: sessionId,
      cwd,
      prompt,
      transcript_path: cursor.transcript_path ?? null,
      turn_id: cursor.generation_id || cursor.turn_id,
      model: cursor.model,
    });
    const extracted = extractCodexContext(result.stdout);
    // Cursor beforeSubmitPrompt cannot inject additional_context — stash for preToolUse.
    if (extracted.kind === "context") stashInjection(cwd, sessionId, extracted.text);
    if (extracted.kind === "block") stashInjection(cwd, sessionId, extracted.reason);
    return safeExit({ continue: true });
  }

  if (event === "stop") {
    const result = runPabcd("stop", {
      hook_event_name: "Stop",
      session_id: sessionId,
      cwd,
      transcript_path: cursor.transcript_path ?? null,
    });
    const extracted = extractCodexContext(result.stdout);
    if (extracted.kind === "block") {
      return safeExit({ followup_message: extracted.reason });
    }
    if (extracted.kind === "context") {
      return safeExit({ followup_message: extracted.text });
    }
    return safeExit({});
  }

  if (event === "subagent-stop") {
    const result = runPabcd("subagent-stop", {
      hook_event_name: "SubagentStop",
      session_id: sessionId,
      cwd,
      transcript_path:
        cursor.agent_transcript_path || cursor.transcript_path || null,
      agent_id: cursor.tool_call_id || cursor.subagent_type || "cursor-subagent",
      agent_type: cursor.subagent_type || "generalPurpose",
      status: cursor.status || "completed",
    });
    const extracted = extractCodexContext(result.stdout);
    if (cursor.status && cursor.status !== "completed") return safeExit({});
    if (extracted.kind === "block") {
      return safeExit({ followup_message: extracted.reason });
    }
    if (extracted.kind === "context") {
      return safeExit({ followup_message: extracted.text });
    }
    return safeExit({});
  }

  if (event === "inject-pending") {
    const pending = takeInjection(cwd, sessionId);
    if (!pending) return safeExit({ permission: "allow" });
    return safeExit({
      permission: "allow",
      additional_context: pending,
    });
  }

  // Unknown event: fail-open
  safeExit({});
}

try {
  main();
} catch {
  safeExit(
    event === "beforeSubmitPrompt" || event === "user-prompt-submit"
      ? { continue: true }
      : event === "inject-pending"
        ? { permission: "allow" }
        : {},
  );
}
