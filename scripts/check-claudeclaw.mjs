#!/usr/bin/env node
/**
 * Validate claudeclaw without treating official symlink-skip warnings as fatal.
 * `claude plugin validate --strict` fails because the checker does not follow
 * symlinks; a live session does. Marketplace --strict is required.
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readdirSync, readFileSync } from "node:fs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(args) {
  return spawnSync("claude", args, { encoding: "utf8", cwd: ROOT });
}

const plugin = run(["plugin", "validate", "plugins/claudeclaw", "--json"]);
if (plugin.status !== 0 && !plugin.stdout.trim()) {
  console.error(plugin.stderr || "plugin validate failed");
  process.exit(1);
}
const pluginReport = JSON.parse(plugin.stdout);
if (!pluginReport.success) {
  console.error("plugin validate reported errors");
  console.error(plugin.stdout);
  process.exit(1);
}

const market = run(["plugin", "validate", ".", "--strict"]);
if (market.status !== 0) {
  console.error(market.stdout || market.stderr);
  process.exit(1);
}

const skillsDir = join(ROOT, "plugins/shared/skills");
for (const name of readdirSync(skillsDir)) {
  const skill = join(skillsDir, name, "SKILL.md");
  let text;
  try {
    text = readFileSync(skill, "utf8");
  } catch {
    continue;
  }
  const fm = text.split("---")[1] || "";
  const match = fm.match(/^name:\s*(.+)$/m);
  const declared = match ? match[1].trim().replace(/^["']|["']$/g, "") : "";
  if (declared && declared !== name) {
    console.error(`skill name mismatch: folder=${name} frontmatter=${declared}`);
    process.exit(1);
  }
}

console.log("claudeclaw check OK (plugin validate success; marketplace --strict; skill names match)");
