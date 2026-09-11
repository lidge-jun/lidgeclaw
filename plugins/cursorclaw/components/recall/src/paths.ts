/**
 * paths.ts — session-root path resolution for the recall component.
 *
 * Cursorclaw dual-reads Cursor and Codex homes so migrated users keep history.
 * Derived recall index lives under ~/.cursorclaw (see index-db.ts), never inside
 * the corpus home.
 */
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

/**
 * Corpus home for chat/memory search.
 * Order: CURSOR_HOME / CODEX_HOME / ~/.cursor (if projects exist) / ~/.codex / ~/.cursor.
 */
export function codexHome(env: Record<string, string | undefined> = process.env): string {
  const fromEnv = (env.CURSOR_HOME || env.CODEX_HOME || "").trim();
  if (fromEnv) return resolve(fromEnv);
  const cursor = join(homedir(), ".cursor");
  const codex = join(homedir(), ".codex");
  if (existsSync(join(cursor, "projects"))) return cursor;
  if (existsSync(codex)) return codex;
  return cursor;
}

export function sessionsDir(home: string): string {
  const codexSessions = join(home, "sessions");
  if (existsSync(codexSessions)) return codexSessions;
  return join(home, "projects");
}

export function memoriesDir(home: string): string {
  return join(home, "memories");
}

/** Highest-numbered `<prefix>_<N>.sqlite` in `home`, or null when absent. */
function latestVersionedDb(home: string, prefix: string): string | null {
  if (!existsSync(home)) return null;
  const re = new RegExp(`^${prefix}_(\\d+)\\.sqlite$`);
  let best: { n: number; name: string } | null = null;
  for (const name of readdirSync(home)) {
    const m = re.exec(name);
    if (!m) continue;
    const n = Number(m[1]);
    if (!best || n > best.n) best = { n, name };
  }
  return best ? join(home, best.name) : null;
}

export function stateDbPath(home: string): string | null {
  return latestVersionedDb(home, "state");
}

export function memoriesDbPath(home: string): string | null {
  return latestVersionedDb(home, "memories");
}
