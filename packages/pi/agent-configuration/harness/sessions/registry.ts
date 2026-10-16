import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { access, chmod, mkdir, readdir, readFile, realpath, rename, rm, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";
import { Value } from "typebox/value";
import {
  PROJECT_NAME_MAX_LENGTH,
  RESERVATION_STALE_MS,
  SESSION_IDENTITY_PATTERN,
  SESSION_STALE_MS,
} from "../constants/sessions/registry.constant.ts";
import { NameReservationSchema } from "../schemas/sessions/registry/name-reservation.schema.ts";
import { SessionRowSchema } from "../schemas/sessions/registry/session-row.schema.ts";
import type { LiveSession, SessionStatus } from "../types/sessions/registry/live-session.interface.ts";
import type { NameReservation } from "../types/sessions/registry/name-reservation.interface.ts";
import type { SessionRowParse } from "../types/sessions/registry/session-row-parse.interface.ts";

function projectName(cwd: string): string {
  let project = basename(cwd)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-");
  if (!/^[a-z]/.test(project)) project = `project-${project}`;
  return project.slice(0, PROJECT_NAME_MAX_LENGTH);
}

export function canReportSession(mode: string, herdrEnvironment: string | undefined): boolean {
  return mode === "tui" && herdrEnvironment === "1";
}

export function sessionStatus(working: boolean, editor: string): SessionStatus {
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

export function parseSession(value: unknown): SessionRowParse {
  if (!Value.Check(SessionRowSchema, value)) return { valid: false };
  const isPaneInWorkspace = value.pane.startsWith(`${value.workspace}:`);
  const isTabInWorkspace = value.tab.startsWith(`${value.workspace}:`);
  if (!isPaneInWorkspace || !isTabInWorkspace) return { valid: false };
  return { valid: true, row: value };
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
    await writeFile(`${target}.tmp`, JSON.stringify(row), { mode: 0o600 });
    await rename(`${target}.tmp`, target);
    if (row.historyEver) await this.markUsed(row.identity);
    const key = createHash("sha256").update(row.cwd).digest("hex");
    await writeFile(join(this.directory, `${key}.project`), row.cwd, { mode: 0o600 });
  }

  async instanceName(cwd: string, identity: string): Promise<string> {
    if (!SESSION_IDENTITY_PATTERN.test(identity)) throw new Error("Invalid session identity");
    await this.prepare();
    const lock = join(this.directory, "names.lock");
    const deadline = Date.now() + 5000;
    while (true) {
      try {
        await mkdir(lock, { mode: 0o700 });
        break;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
        const age = await stat(lock)
          .then((info) => Date.now() - info.mtimeMs)
          .catch(() => 0);
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
        const parsed: unknown = JSON.parse(await readFile(path, "utf8"));
        if (!Value.Check(NameReservationSchema, parsed) || `${parsed.identity}.reservation` !== file) {
          await rm(path, { force: true });
          continue;
        }
        if (
          !liveIdentities.has(parsed.identity) &&
          (now - parsed.updatedAt > RESERVATION_STALE_MS ||
            parsed.processStart !== (await processStartIdentity(parsed.pid).catch(() => "")))
        ) {
          await rm(path, { force: true });
          continue;
        }
        reservations.push(parsed);
      } catch {}
    }
    let order = Math.max(now, ...reservations.map((row) => row.order));
    for (const row of live) {
      if (reservations.some((item) => item.identity === row.identity)) continue;
      const reservation: NameReservation = {
        identity: row.identity,
        project: projectName(row.cwd),
        order: ++order,
        updatedAt: now,
        pid: row.pid,
        processStart: row.processStart,
      };
      reservations.push(reservation);
      await writeFile(join(this.directory, `${row.identity}.reservation`), JSON.stringify(reservation), {
        mode: 0o600,
      });
    }
    let current = reservations.find((row) => row.identity === identity);
    if (!current) {
      current = {
        identity,
        project: projectName(cwd),
        order: ++order,
        updatedAt: now,
        pid: process.pid,
        processStart: await processStartIdentity(process.pid),
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
    if (!SESSION_IDENTITY_PATTERN.test(identity)) throw new Error("Invalid session identity");
    await this.prepare();
    await writeFile(join(this.directory, `${identity}.history`), "used", { mode: 0o600 });
  }

  async hasHistory(identity: string): Promise<boolean> {
    if (!SESSION_IDENTITY_PATTERN.test(identity)) return true;
    try {
      await stat(join(this.directory, `${identity}.history`));
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
      return true;
    }
  }

  async remove(identity: string, preserveName = false): Promise<void> {
    if (!SESSION_IDENTITY_PATTERN.test(identity)) return;
    await rm(join(this.directory, `${identity}.json`), { force: true });
    if (!preserveName) await rm(join(this.directory, `${identity}.reservation`), { force: true });
  }

  async list(now = Date.now()): Promise<LiveSession[]> {
    await this.prepare();
    const result: LiveSession[] = [];
    for (const file of await readdir(this.directory)) {
      if (!/^[a-f0-9-]{36}\.json$/.test(file)) continue;
      try {
        const parsed = parseSession(JSON.parse(await readFile(join(this.directory, file), "utf8")));
        if (!parsed.valid || `${parsed.row.identity}.json` !== file) continue;
        const row = parsed.row;
        if (now - row.updatedAt > SESSION_STALE_MS) {
          await this.remove(row.identity);
          continue;
        }
        try {
          process.kill(row.pid, 0);
          if (!row.processStart || row.processStart !== (await processStartIdentity(row.pid))) {
            await this.remove(row.identity);
            continue;
          }
        } catch {
          await this.remove(row.identity);
          continue;
        }
        result.push(row);
      } catch {}
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
      } catch {}
    }
    return [...paths].sort();
  }
}
