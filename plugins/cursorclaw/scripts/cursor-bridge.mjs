#!/usr/bin/env node
/**
 * cursor-bridge.mjs — full Cursor ↔ cursorclaw (ex-codexclaw) hook fan-out.
 *
 * Runs the same component hook pipelines Codex registered, adapted to Cursor
 * JSON I/O. Fail-open unless a handler returns an explicit deny/block.
 *
 * Usage: node ./scripts/cursor-bridge.mjs <cursor-event>
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
const MODERN_STATE = ".cursorclaw";
const LEGACY_STATE = ".codexclaw";
const MAX_STDIN = 2_000_000;

const event = process.argv[2] || "";

/** @typedef {{ component: string, dist: string, hook: string, label?: string }} Step */

/** Codex-parity pipelines keyed by Cursor event (+ internal stages). */
const PIPELINES = {
  "session-start": [
    { component: "pabcd-state", dist: "cli.js", hook: "session-start", label: "pabcd-bootstrap" },
    { component: "pabcd-state", dist: "cli.js", hook: "worktree-guard", label: "worktree-identity" },
    { component: "provider-bridge", dist: "cli.js", hook: "session-start", label: "provider-bridge" },
    { component: "config-guard", dist: "cli.js", hook: "session-start", label: "config-guard" },
    { component: "recall", dist: "cli.js", hook: "session-start", label: "recall" },
    { component: "cxc-ops", dist: "cli.js", hook: "session-start", label: "map-affordance" },
    { component: "bg-wake", dist: "cli.js", hook: "session-start", label: "bg-wake" },
    { component: "subagent-config", dist: "fallback-dispatch-cli.js", hook: "session-start", label: "subagent-fallback" },
  ],
  "beforeSubmitPrompt": [
    { component: "pabcd-state", dist: "cli.js", hook: "user-prompt-submit", label: "pabcd-trigger" },
    { component: "pabcd-state", dist: "cli.js", hook: "worktree-guard", label: "worktree-rename" },
    { component: "bg-wake", dist: "cli.js", hook: "user-prompt-submit", label: "bg-deliver" },
    { component: "recall", dist: "cli.js", hook: "user-prompt-submit", label: "recall-intent" },
    { component: "cxc-ops", dist: "cli.js", hook: "user-prompt-submit", label: "compact-affordance" },
  ],
  "preToolUse": [
    { component: "pabcd-state", dist: "cli.js", hook: "pre-tool-use", label: "goal-gates" },
    { component: "pabcd-state", dist: "cli.js", hook: "pre-tool-use-memory-write", label: "memory-write" },
    { component: "pabcd-state", dist: "cli.js", hook: "worktree-guard-pretool", label: "worktree-delete" },
    { component: "pabcd-state", dist: "cli.js", hook: "pre-tool-use-edit", label: "edit-lint" },
    { component: "subagent-config", dist: "spawn-attach-hook.js", hook: "pre-tool-use", label: "spawn-attach" },
  ],
  "postToolUse": [
    { component: "pabcd-state", dist: "cli.js", hook: "post-tool-use", label: "interview-capture" },
    { component: "pabcd-state", dist: "cli.js", hook: "post-tool-use-render-observation", label: "render-obs" },
  ],
  "preCompact": [
    { component: "pabcd-state", dist: "cli.js", hook: "post-compact", label: "pabcd-compact" },
    { component: "recall", dist: "cli.js", hook: "post-compact", label: "recall-compact" },
    { component: "cxc-ops", dist: "cli.js", hook: "post-compact", label: "bg-compact" },
  ],
  "stop": [
    { component: "pabcd-state", dist: "cli.js", hook: "stop", label: "pabcd-continue" },
    { component: "bg-wake", dist: "cli.js", hook: "stop", label: "bg-wake-stop" },
  ],
  "subagentStop": [
    { component: "pabcd-state", dist: "cli.js", hook: "subagent-stop", label: "evidence" },
    { component: "pabcd-state", dist: "cli.js", hook: "subagent-stop-review", label: "review-observer" },
  ],
};

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
  if (obj && Object.keys(obj).length) emit(obj);
  else if (obj) emit(obj);
  process.exit(0);
}

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
    if (!existsSync(modern) && existsSync(legacy)) renameSync(legacy, modern);
    else mkdirSync(modern, { recursive: true });
  } catch {
    /* fail-open */
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
    let prev = "";
    if (existsSync(path)) prev = readFileSync(path, "utf8").trim();
    const merged = prev ? `${prev}\n\n${body}` : body;
    writeFileSync(path, merged, "utf8");
  } catch {
    /* fail-open */
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

/** Map Cursor tool names toward Codex-era names handlers still expect. */
function mapToolName(name) {
  const n = String(name || "");
  const table = {
    Shell: "Bash",
    Write: "Write",
    Edit: "Edit",
    StrReplace: "Edit",
    Delete: "Bash",
    Task: "spawn_agent",
    CreateGoal: "create_goal",
    UpdateGoal: "update_goal",
  };
  return table[n] || n;
}

function buildCodexPayload(cursorEvent, cursor, sessionId, cwd) {
  const base = {
    session_id: sessionId,
    cwd,
    transcript_path: cursor.transcript_path ?? null,
    model: cursor.model,
    turn_id: cursor.generation_id || cursor.turn_id,
  };

  if (cursorEvent === "session-start") {
    return { ...base, hook_event_name: "SessionStart" };
  }
  if (cursorEvent === "beforeSubmitPrompt") {
    return {
      ...base,
      hook_event_name: "UserPromptSubmit",
      prompt: typeof cursor.prompt === "string" ? cursor.prompt : "",
    };
  }
  if (cursorEvent === "preToolUse") {
    return {
      ...base,
      hook_event_name: "PreToolUse",
      tool_name: mapToolName(cursor.tool_name),
      tool_input: cursor.tool_input ?? {},
      tool_use_id: cursor.tool_use_id,
    };
  }
  if (cursorEvent === "postToolUse") {
    return {
      ...base,
      hook_event_name: "PostToolUse",
      tool_name: mapToolName(cursor.tool_name),
      tool_input: cursor.tool_input ?? {},
      tool_response: cursor.tool_output ?? cursor.tool_response ?? "",
      tool_use_id: cursor.tool_use_id,
    };
  }
  if (cursorEvent === "preCompact") {
    return { ...base, hook_event_name: "PostCompact" };
  }
  if (cursorEvent === "stop") {
    return { ...base, hook_event_name: "Stop" };
  }
  if (cursorEvent === "subagentStop") {
    return {
      ...base,
      hook_event_name: "SubagentStop",
      agent_id: cursor.tool_call_id || cursor.subagent_type || "cursor-subagent",
      agent_type: cursor.subagent_type || "generalPurpose",
      status: cursor.status || "completed",
      transcript_path: cursor.agent_transcript_path || cursor.transcript_path || null,
    };
  }
  return { ...base, hook_event_name: cursorEvent };
}

function runStep(step, payloadObj) {
  const cli = join(PLUGIN_ROOT, "components", step.component, "dist", step.dist);
  if (!existsSync(cli)) {
    return { ok: false, stdout: "", stderr: `missing ${step.component}/${step.dist}` };
  }
  const input = `${JSON.stringify(payloadObj)}\n`;
  const args = [cli, "hook", step.hook];
  // spawn-attach and some CLIs already include "hook" in their argv protocol
  if (step.dist === "spawn-attach-hook.js") {
    args.length = 0;
    args.push(cli, "hook", step.hook);
  }
  if (step.dist === "fallback-dispatch-cli.js") {
    args.length = 0;
    args.push(cli, "hook", step.hook);
  }
  const res = spawnSync(process.execPath, args, {
    input,
    encoding: "utf8",
    cwd: PLUGIN_ROOT,
    env: process.env,
    maxBuffer: 4_000_000,
    timeout: 20_000,
  });
  return {
    ok: res.status === 0 || res.status === null,
    stdout: res.stdout || "",
    stderr: res.stderr || "",
    status: res.status,
  };
}

function extract(stdout) {
  const text = (stdout || "").trim();
  if (!text) return { kind: "empty" };
  // Some handlers print multiple JSON lines; take the last non-empty.
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  let obj = null;
  for (const line of lines) {
    try {
      obj = JSON.parse(line);
    } catch {
      /* keep scanning */
    }
  }
  if (!obj || typeof obj !== "object") return { kind: "raw", text };
  if (obj.decision === "block" && typeof obj.reason === "string") {
    return { kind: "block", reason: obj.reason };
  }
  const hso = obj.hookSpecificOutput || {};
  if (hso.permissionDecision === "deny") {
    return {
      kind: "deny",
      reason: hso.permissionDecisionReason || hso.additionalContext || "denied by cursorclaw",
    };
  }
  const ctx = hso.additionalContext;
  if (typeof ctx === "string" && ctx.trim()) {
    return { kind: "context", text: ctx };
  }
  if (typeof obj.additionalContext === "string" && obj.additionalContext.trim()) {
    return { kind: "context", text: obj.additionalContext };
  }
  return { kind: "empty" };
}

function readPluginVersion() {
  try {
    const p = join(PLUGIN_ROOT, ".cursor-plugin", "plugin.json");
    return JSON.parse(readFileSync(p, "utf8")).version || "0.1.0";
  } catch {
    return "0.1.0";
  }
}

function banner(version) {
  return [
    `cursorclaw ${version} loaded for Cursor (full Codex-parity hook fan-out).`,
    "Skills: plugin skills/ (names match folders). CLI: crc / cursorclaw.",
    `State: ${MODERN_STATE}/ (legacy ${LEGACY_STATE}/ migrated on use).`,
    "Hooks: sessionStart, beforeSubmitPrompt, pre/postToolUse, preCompact, stop, subagentStop.",
  ].join("\n");
}

function runPipeline(cursorEvent, cursor, sessionId, cwd) {
  const steps = PIPELINES[cursorEvent] || [];
  const payload = buildCodexPayload(cursorEvent, cursor, sessionId, cwd);
  const contexts = [];
  let deny = null;
  let block = null;

  for (const step of steps) {
    // worktree-guard on SessionStart needs UserPromptSubmit-shaped? It accepts SessionStart via worktree-guard event with SessionStart or UserPromptSubmit payloads.
    let stepPayload = payload;
    if (step.hook === "worktree-guard" && cursorEvent === "session-start") {
      stepPayload = { ...payload, hook_event_name: "SessionStart" };
    }
    if (step.hook === "worktree-guard" && cursorEvent === "beforeSubmitPrompt") {
      stepPayload = {
        ...payload,
        hook_event_name: "UserPromptSubmit",
        prompt: payload.prompt || "",
      };
    }
    try {
      const result = runStep(step, stepPayload);
      const ex = extract(result.stdout);
      if (ex.kind === "deny") deny = deny || ex;
      else if (ex.kind === "block") block = block || ex;
      else if (ex.kind === "context") contexts.push(ex.text);
    } catch {
      /* fail-open per step */
    }
  }
  return { contexts, deny, block };
}

function main() {
  const { overflow, raw } = readStdin();
  if (overflow) {
    if (event === "beforeSubmitPrompt") {
      return safeExit({ continue: false, user_message: "cursorclaw: hook input too large" });
    }
    if (event === "preToolUse") {
      return safeExit({ permission: "deny", user_message: "cursorclaw: hook input too large" });
    }
    return safeExit({});
  }

  const cursor = parseJson(raw) || {};
  const cwd = resolveCwd(cursor);
  const sessionId = canonicalSessionId(cursor.session_id || cursor.conversation_id || "");
  ensureDualStateDir(cwd);

  // Always flush pending injections on first tool use, then run gates.
  if (event === "preToolUse") {
    const pending = takeInjection(cwd, sessionId);
    const { contexts, deny } = runPipeline("preToolUse", cursor, sessionId, cwd);
    if (deny) {
      return safeExit({
        permission: "deny",
        user_message: deny.reason,
        agent_message: deny.reason,
      });
    }
    const extra = [pending, ...contexts].filter(Boolean).join("\n\n");
    const out = { permission: "allow" };
    if (extra) out.additional_context = extra;
    return safeExit(out);
  }

  if (event === "session-start") {
    const { contexts } = runPipeline("session-start", cursor, sessionId, cwd);
    const additional = [banner(readPluginVersion()), ...contexts].filter(Boolean).join("\n\n");
    return safeExit({
      env: {
        CURSORCLAW_SESSION_ID: sessionId,
        CURSORCLAW_STATE_DIR: join(cwd, MODERN_STATE),
        CURSORCLAW_PLUGIN_ROOT: PLUGIN_ROOT,
      },
      additional_context: additional,
    });
  }

  if (event === "beforeSubmitPrompt") {
    const { contexts, deny, block } = runPipeline("beforeSubmitPrompt", cursor, sessionId, cwd);
    // Cursor cannot inject additional_context here — stash for preToolUse.
    for (const c of contexts) stashInjection(cwd, sessionId, c);
    if (block) stashInjection(cwd, sessionId, block.reason);
    if (deny) {
      return safeExit({ continue: false, user_message: deny.reason });
    }
    return safeExit({ continue: true });
  }

  if (event === "postToolUse") {
    const { contexts } = runPipeline("postToolUse", cursor, sessionId, cwd);
    const extra = contexts.filter(Boolean).join("\n\n");
    return safeExit(extra ? { additional_context: extra } : {});
  }

  if (event === "preCompact") {
    const { contexts } = runPipeline("preCompact", cursor, sessionId, cwd);
    for (const c of contexts) stashInjection(cwd, sessionId, c);
    return safeExit({});
  }

  if (event === "stop") {
    const { contexts, block } = runPipeline("stop", cursor, sessionId, cwd);
    if (block) return safeExit({ followup_message: block.reason });
    if (contexts.length) return safeExit({ followup_message: contexts.join("\n\n") });
    return safeExit({});
  }

  if (event === "subagentStop") {
    const { contexts, block } = runPipeline("subagentStop", cursor, sessionId, cwd);
    if (cursor.status && cursor.status !== "completed") return safeExit({});
    if (block) return safeExit({ followup_message: block.reason });
    if (contexts.length) return safeExit({ followup_message: contexts.join("\n\n") });
    return safeExit({});
  }

  safeExit({});
}

try {
  main();
} catch {
  if (event === "beforeSubmitPrompt") safeExit({ continue: true });
  else if (event === "preToolUse") safeExit({ permission: "allow" });
  else safeExit({});
}
