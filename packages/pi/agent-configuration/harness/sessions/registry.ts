import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { access, chmod, mkdir, readFile, readdir, realpath, rename, rm, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";

export const SESSION_STALE_MS = 15_000;
const RESERVATION_STALE_MS = 60_000;

interface NameReservation {
  identity: string;
  project: string;
  order: number;
  updatedAt: number;
  pid: number;
  processStart: string;
}

function projectName(cwd: string): string {
  let project = basename(cwd).toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
  if (!/^[a-z]/.test(project)) project = `project-${project}`;
  return project.slice(0, 20);
}

export interface LiveSession {
  identity: string;
  pid: number;
  processStart?: string;
  updatedAt: number;
  cwd: string;
  pane: string;
  tab: string;
  workspace: string;
  sessionId: string;
  name: string;
  branch: string;
  percent: number | null;
  contextTokens?: number | null;
  contextWindow?: number;
  status: "working" | "draft" | "idle";
  owned: boolean;
  historyEver: boolean;
  cleanupSafe: boolean;
}

export function canReportSession(mode: string, herdrEnvironment: string | undefined): boolean {
  return mode === "tui" && herdrEnvironment === "1";
}

export function sessionStatus(working: boolean, editor: string): LiveSession["status"] {
  if (working) return "working";
  if (editor.length > 0) return "draft";
  return "idle";
}

export function registryDirectory(scope: string): string {
  const key = createHash("sha256").update(scope).digest("hex").slice(0, 24);
  return join(process.env.XDG_STATE_HOME || join(homedir(), ".local", "state"), "pi", "sessions", key);
}

export async function canonicalDirectory(path: string, cwd: string): Promise<string> {
  const expanded = path === "~" ? homedir() : path.startsWith("~/") ? join(homedir(), path.slice(2)) : path;
  const canonical = await realpath(resolve(cwd, expanded));
  if (!(await stat(canonical)).isDirectory()) throw new Error("Select a directory, not a file");
  await access(canonical, constants.R_OK | constants.X_OK);
  return canonical;
}

export function parseSession(value: unknown): LiveSession | undefined {
  if (!value || typeof value !== "object") return;
  const row = value as LiveSession;
  const strings = [row.identity, row.cwd, row.pane, row.tab, row.workspace, row.sessionId, row.name, row.branch];
  if (!strings.every((item) => typeof item === "string")) return;
  if (!/^[a-f0-9-]{36}$/.test(row.identity) || !row.cwd.startsWith("/")) return;
  if (!/^w\d+:p\d+$/.test(row.pane) || !/^w\d+:t\d+$/.test(row.tab) || !/^w\d+$/.test(row.workspace)) return;
  if (!row.pane.startsWith(`${row.workspace}:`) || !row.tab.startsWith(`${row.workspace}:`)) return;
  if (row.processStart !== undefined && typeof row.processStart !== "string") return;
  if (row.contextTokens != null && (!Number.isFinite(row.contextTokens) || row.contextTokens < 0)) return;
  if (row.contextWindow !== undefined && (!Number.isFinite(row.contextWindow) || row.contextWindow <= 0)) return;
  if (!Number.isSafeInteger(row.pid) || row.pid < 1 || !Number.isFinite(row.updatedAt)) return;
  if (row.percent !== null && (!Number.isFinite(row.percent) || row.percent < 0)) return;
  if (!["working", "draft", "idle"].includes(row.status)) return;
  if (![row.owned, row.historyEver, row.cleanupSafe].every((item) => typeof item === "boolean")) return;
  return row;
}

export async function processStartIdentity(pid: number): Promise<string> {
  const text = await readFile(`/proc/${pid}/stat`, "utf8");
  const start = text.slice(text.lastIndexOf(")") + 2).split(" ")[19];
  const boot = (await readFile("/proc/sys/kernel/random/boot_id", "utf8")).trim();
  if (!start || !boot) throw new Error("Cannot identify process");
  return `${boot}:${start}`;
}

export async function processSessionIdentity(scope: string, pid: number): Promise<string> {
  const start = await processStartIdentity(pid);
  const hash = createHash("sha256").update(`${scope}:${pid}:${start}`).digest("hex");
  return [hash.slice(0, 8), hash.slice(8, 12), hash.slice(12, 16), hash.slice(16, 20), hash.slice(20, 32)].join("-");
}

export class SessionRegistry {
  constructor(readonly directory: string) {}

  private async prepare(): Promise<void> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    await chmod(this.directory, 0o700);
  }

  async publish(row: LiveSession): Promise<void> {
    await this.prepare();
    const target = join(this.directory, `${row.identity}.json`);
    await writeFile(`${target}.tmp`, JSON.stringify({ ...row, processStart: row.processStart ?? await processStartIdentity(row.pid) }), { mode: 0o600 });
    await rename(`${target}.tmp`, target);
    if (row.historyEver) await this.markUsed(row.identity);
    const key = createHash("sha256").update(row.cwd).digest("hex");
    await writeFile(join(this.directory, `${key}.project`), row.cwd, { mode: 0o600 });
  }

  async instanceName(cwd: string, identity: string): Promise<string> {
    if (!/^[a-f0-9-]{36}$/.test(identity)) throw new Error("Invalid session identity");
    await this.prepare();
    const lock = join(this.directory, "names.lock");
    const deadline = Date.now() + 5000;
    while (true) {
      try {
        await mkdir(lock, { mode: 0o700 });
        break;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
        const age = await stat(lock).then((info) => Date.now() - info.mtimeMs).catch(() => 0);
        if (age > RESERVATION_STALE_MS) await rm(lock, { recursive: true, force: true });
        if (Date.now() >= deadline) throw new Error("Session name allocation timed out");
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }
    try {
      return await this.allocateName(cwd, identity);
    } finally {
      await rm(lock, { recursive: true, force: true });
    }
  }

  private async allocateName(cwd: string, identity: string): Promise<string> {
    const now = Date.now();
    const live = await this.list(now);
    const liveIdentities = new Set(live.map((row) => row.identity));
    const reservations: NameReservation[] = [];
    for (const file of await readdir(this.directory)) {
      if (!/^[a-f0-9-]{36}\.reservation$/.test(file)) continue;
      const path = join(this.directory, file);
      try {
        const row: NameReservation = JSON.parse(await readFile(path, "utf8"));
        if (`${row.identity}.reservation` !== file || typeof row.project !== "string" || !/^[a-z][a-z0-9_-]{0,19}$/.test(row.project) ||
            !Number.isSafeInteger(row.order) || !Number.isFinite(row.updatedAt) ||
            !Number.isSafeInteger(row.pid) || row.pid < 1 || typeof row.processStart !== "string") {
          await rm(path, { force: true });
          continue;
        }
        if (!liveIdentities.has(row.identity) &&
            (now - row.updatedAt > RESERVATION_STALE_MS ||
             row.processStart !== await processStartIdentity(row.pid).catch(() => ""))) {
          await rm(path, { force: true });
          continue;
        }
        reservations.push(row);
      } catch { continue; }
    }
    let order = Math.max(now, ...reservations.map((row) => row.order));
    for (const row of live) {
      if (reservations.some((item) => item.identity === row.identity)) continue;
      const reservation: NameReservation = {
        identity: row.identity, project: projectName(row.cwd), order: ++order,
        updatedAt: now, pid: row.pid, processStart: row.processStart!,
      };
      reservations.push(reservation);
      await writeFile(join(this.directory, `${row.identity}.reservation`), JSON.stringify(reservation), { mode: 0o600 });
    }
    let current = reservations.find((row) => row.identity === identity);
    if (!current) {
      current = {
        identity, project: projectName(cwd), order: ++order, updatedAt: now,
        pid: process.pid, processStart: await processStartIdentity(process.pid),
      };
      reservations.push(current);
    }
    current.updatedAt = now;
    current.pid = process.pid;
    current.processStart = await processStartIdentity(process.pid);
    await writeFile(join(this.directory, `${identity}.reservation`), JSON.stringify(current), { mode: 0o600 });
    const project = current.project;
    const group = reservations.filter((row) => row.project === project).sort((a, b) => a.order - b.order);
    const number = group.findIndex((row) => row.identity === identity) + 1;
    return `${project}-pi-${number}`;
  }

  async markUsed(identity: string): Promise<void> {
    if (!/^[a-f0-9-]{36}$/.test(identity)) throw new Error("Invalid session identity");
    await this.prepare();
    await writeFile(join(this.directory, `${identity}.history`), "used", { mode: 0o600 });
  }

  async hasHistory(identity: string): Promise<boolean> {
    if (!/^[a-f0-9-]{36}$/.test(identity)) return true;
    try {
      await stat(join(this.directory, `${identity}.history`));
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
      return true;
    }
  }

  async remove(identity: string, preserveName = false): Promise<void> {
    if (!/^[a-f0-9-]{36}$/.test(identity)) return;
    await rm(join(this.directory, `${identity}.json`), { force: true });
    if (!preserveName) await rm(join(this.directory, `${identity}.reservation`), { force: true });
  }

  async list(now = Date.now()): Promise<LiveSession[]> {
    await this.prepare();
    const result: LiveSession[] = [];
    for (const file of await readdir(this.directory)) {
      if (!/^[a-f0-9-]{36}\.json$/.test(file)) continue;
      try {
        const row = parseSession(JSON.parse(await readFile(join(this.directory, file), "utf8")));
        if (!row || `${row.identity}.json` !== file) continue;
        if (now - row.updatedAt > SESSION_STALE_MS) {
          await this.remove(row.identity);
          continue;
        }
        try {
          process.kill(row.pid, 0);
          if (!row.processStart || row.processStart !== await processStartIdentity(row.pid)) { await this.remove(row.identity); continue; }
        } catch { await this.remove(row.identity); continue; }
        result.push(row);
      } catch { continue; }
    }
    return result.sort((a, b) => a.cwd.localeCompare(b.cwd) || a.name.localeCompare(b.name));
  }

  async projects(): Promise<string[]> {
    await this.prepare();
    const paths = new Set<string>();
    for (const file of await readdir(this.directory)) {
      if (!/^[a-f0-9]{64}\.project$/.test(file)) continue;
      try {
        paths.add(await canonicalDirectory(await readFile(join(this.directory, file), "utf8"), "/"));
      } catch { continue; }
    }
    return [...paths].sort();
  }
}
