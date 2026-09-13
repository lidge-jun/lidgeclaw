#!/usr/bin/env node
/**
 * claude-bridge.mjs — Claude Code ↔ lidgeclaw hook fan-out.
 *
 * Claude events are Codex-shaped (PascalCase). This adapter runs the same
 * component pipelines as cursor-bridge, and emits Claude hookSpecificOutput.
 *
 * Usage: node ./hooks/claude-bridge.mjs <SessionStart|UserPromptSubmit|...>
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const PLUGIN_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const COMPONENTS_ROOT = existsSync(join(PLUGIN_ROOT, "components"))
  ? join(PLUGIN_ROOT, "components")
  : join(PLUGIN_ROOT, "..", "cursorclaw", "components");
const STATE_DIR = ".codexclaw";
const MAX_STDIN = 2_000_000;

const event = process.argv[2] || "";

const EVENT_TO_PIPELINE = {
  SessionStart: "session-start",
  UserPromptSubmit: "beforeSubmitPrompt",
  PreToolUse: "preToolUse",
  PostToolUse: "postToolUse",
  PreCompact: "preCompact",
  Stop: "stop",
  SubagentStop: "subagentStop",
};

/** @typedef {{ component: string, dist: string, hook: string, label?: string }} Step */

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
  process.exit(0);
}

function canonicalSessionId(raw) {
  const s = String(raw || "").trim();
  if (!s) return "claude-unknown";
  if (/^[A-Za-z0-9._-]+$/.test(s) && s.length <= 128) return s;
  const hash = createHash("sha256").update(s).digest("hex").slice(0, 24);
  return `claude-${hash}`;
}

function resolveCwd(payload) {
  if (typeof payload.cwd === "string" && payload.cwd.trim()) return payload.cwd.trim();
  if (typeof payload.workspace_dir === "string" && payload.workspace_dir.trim()) {
    return payload.workspace_dir.trim();
  }
  return process.cwd();
}

function ensureStateDir(cwd) {
  try {
    mkdirSync(join(cwd, STATE_DIR), { recursive: true });
  } catch {
    /* fail-open */
  }
}

function pendingPath(cwd, sessionId) {
  return join(cwd, STATE_DIR, "pending-injections", `${sessionId}.txt`);
}

function stashInjection(cwd, sessionId, text) {
  const body = String(text || "").trim();
  if (!body) return;
  const path = pendingPath(cwd, sessionId);
  try {
    mkdirSync(dirname(path), { recursive: true });
    let prev = "";
    if (existsSync(path)) prev = readFileSync(path, "utf8").trim();
    writeFileSync(path, prev ? `${prev}\n\n${body}` : body, "utf8");
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

function mapToolName(name) {
  const n = String(name || "");
  const table = {
    Task: "spawn_agent",
    Agent: "spawn_agent",
    Shell: "Bash",
  };
  return table[n] || n;
}

function buildCodexPayload(pipeline, claude, sessionId, cwd) {
  const base = {
    session_id: sessionId,
    cwd,
    transcript_path: claude.transcript_path ?? claude.transcriptPath ?? null,
    model: claude.model,
    turn_id: claude.turn_id || claude.generation_id,
  };
  if (pipeline === "session-start") {
    return { ...base, hook_event_name: "SessionStart" };
  }
  if (pipeline === "beforeSubmitPrompt") {
    return {
      ...base,
      hook_event_name: "UserPromptSubmit",
      prompt: typeof claude.prompt === "string" ? claude.prompt : "",
    };
  }
  if (pipeline === "preToolUse") {
    return {
      ...base,
      hook_event_name: "PreToolUse",
      tool_name: mapToolName(claude.tool_name || claude.toolName),
      tool_input: claude.tool_input || claude.toolInput || {},
      tool_use_id: claude.tool_use_id || claude.toolUseId,
    };
  }
  if (pipeline === "postToolUse") {
    return {
      ...base,
      hook_event_name: "PostToolUse",
      tool_name: mapToolName(claude.tool_name || claude.toolName),
      tool_input: claude.tool_input || claude.toolInput || {},
      tool_response: claude.tool_response || claude.toolResponse || claude.tool_output || "",
      tool_use_id: claude.tool_use_id || claude.toolUseId,
    };
  }
  if (pipeline === "preCompact") {
    return { ...base, hook_event_name: "PostCompact" };
  }
  if (pipeline === "stop") {
    return { ...base, hook_event_name: "Stop" };
  }
  if (pipeline === "subagentStop") {
    return {
      ...base,
      hook_event_name: "SubagentStop",
      agent_id: claude.agent_id || claude.agentId || "claude-subagent",
      agent_type: claude.agent_type || claude.agentType || "generalPurpose",
      status: claude.status || "completed",
      transcript_path: claude.agent_transcript_path || claude.transcript_path || null,
    };
  }
  return { ...base, hook_event_name: event };
}

function runStep(step, payloadObj) {
  const cli = join(COMPONENTS_ROOT, step.component, "dist", step.dist);
  if (!existsSync(cli)) {
    return { ok: false, stdout: "", stderr: `missing ${step.component}/${step.dist}` };
  }
  const args = [cli, "hook", step.hook];
  const res = spawnSync(process.execPath, args, {
    input: `${JSON.stringify(payloadObj)}\n`,
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
  };
}

function extract(stdout) {
  const text = (stdout || "").trim();
  if (!text) return { kind: "empty" };
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
      reason: hso.permissionDecisionReason || hso.additionalContext || "denied by claudeclaw",
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
    const p = join(PLUGIN_ROOT, ".claude-plugin", "plugin.json");
    return JSON.parse(readFileSync(p, "utf8")).version || "0.1.0";
  } catch {
    return "0.1.0";
  }
}

function banner(version) {
  return [
    `claudeclaw ${version} loaded for Claude Code (lidgeclaw shared layer).`,
    "Skills: plugin skills/ (shared + unique status). CLI: crc / lidgeclaw.",
    `State: ${STATE_DIR}/ (shared with cursorclaw + zclaw).`,
    "Hooks: SessionStart, UserPromptSubmit, Pre/PostToolUse, PreCompact, Stop, SubagentStop.",
  ].join("\n");
}

function runPipeline(pipeline, claude, sessionId, cwd) {
  const steps = PIPELINES[pipeline] || [];
  const payload = buildCodexPayload(pipeline, claude, sessionId, cwd);
  const contexts = [];
  let deny = null;
  let block = null;
  for (const step of steps) {
    let stepPayload = payload;
    if (step.hook === "worktree-guard" && pipeline === "session-start") {
      stepPayload = { ...payload, hook_event_name: "SessionStart" };
    }
    if (step.hook === "worktree-guard" && pipeline === "beforeSubmitPrompt") {
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

function hso(hookEventName, extra) {
  return { hookSpecificOutput: { hookEventName, ...extra } };
}

function main() {
  const { overflow, raw } = readStdin();
  const pipeline = EVENT_TO_PIPELINE[event] || "";
  if (overflow) {
    if (event === "PreToolUse") {
      return safeExit(hso("PreToolUse", {
        permissionDecision: "deny",
        permissionDecisionReason: "claudeclaw: hook input too large",
      }));
    }
    return safeExit({});
  }

  const claude = parseJson(raw) || {};
  const cwd = resolveCwd(claude);
  const sessionId = canonicalSessionId(
    claude.session_id || claude.sessionId || process.env.CLAUDE_SESSION_ID || "",
  );
  ensureStateDir(cwd);

  if (event === "PreToolUse") {
    const pending = takeInjection(cwd, sessionId);
    const { contexts, deny } = runPipeline(pipeline, claude, sessionId, cwd);
    if (deny) {
      return safeExit(hso("PreToolUse", {
        permissionDecision: "deny",
        permissionDecisionReason: deny.reason,
      }));
    }
    const extra = [pending, ...contexts].filter(Boolean).join("\n\n");
    const out = hso("PreToolUse", { permissionDecision: "allow" });
    if (extra) out.hookSpecificOutput.additionalContext = extra;
    return safeExit(out);
  }

  if (event === "SessionStart") {
    const { contexts } = runPipeline(pipeline, claude, sessionId, cwd);
    const additional = [banner(readPluginVersion()), ...contexts].filter(Boolean).join("\n\n");
    return safeExit(hso("SessionStart", { additionalContext: additional }));
  }

  if (event === "UserPromptSubmit") {
    const { contexts, deny, block } = runPipeline(pipeline, claude, sessionId, cwd);
    if (deny) {
      return safeExit({
        ...hso("UserPromptSubmit", {}),
        decision: "block",
        reason: deny.reason,
      });
    }
    const extra = [...contexts, block?.reason].filter(Boolean).join("\n\n");
    if (!extra) return safeExit({});
    return safeExit(hso("UserPromptSubmit", { additionalContext: extra }));
  }

  if (event === "PostToolUse") {
    const { contexts } = runPipeline(pipeline, claude, sessionId, cwd);
    const extra = contexts.filter(Boolean).join("\n\n");
    return safeExit(extra ? hso("PostToolUse", { additionalContext: extra }) : {});
  }

  if (event === "PreCompact") {
    const { contexts } = runPipeline(pipeline, claude, sessionId, cwd);
    for (const c of contexts) stashInjection(cwd, sessionId, c);
    return safeExit({});
  }

  if (event === "Stop") {
    const { contexts, block } = runPipeline(pipeline, claude, sessionId, cwd);
    if (block) return safeExit({ decision: "block", reason: block.reason });
    if (contexts.length) return safeExit({ decision: "block", reason: contexts.join("\n\n") });
    return safeExit({});
  }

  if (event === "SubagentStop") {
    const { contexts, block } = runPipeline(pipeline, claude, sessionId, cwd);
    if (claude.status && claude.status !== "completed") return safeExit({});
    if (block) return safeExit({ decision: "block", reason: block.reason });
    if (contexts.length) {
      return safeExit(hso("SubagentStop", { additionalContext: contexts.join("\n\n") }));
    }
    return safeExit({});
  }

  safeExit({});
}

try {
  main();
} catch {
  if (event === "PreToolUse") {
    safeExit(hso("PreToolUse", { permissionDecision: "allow" }));
  } else {
    safeExit({});
  }
}
