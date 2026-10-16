import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { promisify } from "node:util";
import { Value } from "typebox/value";
import {
  AGENT_LAUNCH_PENDING_CODE,
  HERDR_COMMAND_TIMEOUT_MS,
  HERDR_MAX_BUFFER_BYTES,
  PI_AGENT_NAME,
  PI_HARNESS_SOURCE,
  SILENT_HERDR_COMMANDS,
} from "../constants/sessions/herdr.constant.ts";
import { HerdrPaneSchema } from "../schemas/sessions/herdr-pane.schema.ts";
import type { HerdrCommand } from "../types/sessions/herdr/herdr-command.interface.ts";
import type { PaneIdentity } from "../types/sessions/herdr/pane-identity.interface.ts";
import type { LiveSession } from "../types/sessions/registry/live-session.interface.ts";
import type { SessionRegistry } from "./registry.ts";

const execute = promisify(execFile);

async function executeHerdr(args: string[], env: NodeJS.ProcessEnv): Promise<Record<string, unknown>> {
  const binary = env.HERDR_BIN_PATH || "herdr";
  let stdout: string;
  try {
    ({ stdout } = await execute(binary, args, {
      timeout: HERDR_COMMAND_TIMEOUT_MS,
      maxBuffer: HERDR_MAX_BUFFER_BYTES,
      env,
    }));
  } catch (error) {
    const output = error as { stdout?: string; stderr?: string };
    for (const text of [output.stdout, output.stderr]) {
      if (!text) continue;
      let response: Record<string, unknown>;
      try {
        response = objectValue(JSON.parse(text));
      } catch {
        continue;
      }
      if (response.error) throw herdrError(response.error);
    }
    throw error;
  }
  if (!stdout.trim() && args[0] === "pane" && SILENT_HERDR_COMMANDS.has(args[1]!)) return {};
  const response = objectValue(JSON.parse(stdout));
  if (response.error) {
    throw herdrError(response.error);
  }
  return objectValue(response.result);
}

function herdrError(value: unknown): Error {
  const error = objectValue(value);
  return Object.assign(new Error(typeof error.message === "string" ? error.message : "Herdr command failed"), {
    code: error.code,
  });
}

export function scopedHerdr(socket: string): HerdrCommand {
  const env = { ...process.env, HERDR_SOCKET_PATH: socket, HERDR_API_SOCKET: socket };
  return (args) => executeHerdr(args, env);
}

function objectValue(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid Herdr response");
  return value as Record<string, unknown>;
}

const runHerdr: HerdrCommand = (args) => executeHerdr(args, process.env);

export function paneIdentity(value: unknown): PaneIdentity {
  const row = objectValue(value);
  if (!Value.Check(HerdrPaneSchema, row)) throw new Error("Herdr returned an invalid pane identity");
  if (!row.pane_id.startsWith(`${row.workspace_id}:`) || !row.tab_id.startsWith(`${row.workspace_id}:`))
    throw new Error("Herdr pane belongs to another workspace");
  return { pane: row.pane_id, tab: row.tab_id, workspace: row.workspace_id };
}

export class HerdrSessions {
  private reportSequence = Date.now() * 1000;

  constructor(
    private readonly registry: SessionRegistry,
    private readonly command: HerdrCommand = runHerdr,
  ) {}

  async current(): Promise<PaneIdentity> {
    const result = await this.command(["pane", "current", "--current"]);
    return paneIdentity(result.pane);
  }

  async report(row: LiveSession, path?: string): Promise<void> {
    const ref = path ? ["--agent-session-path", path] : ["--agent-session-id", row.sessionId];
    const common = [row.pane, "--source", PI_HARNESS_SOURCE, "--agent", PI_AGENT_NAME, ...ref];
    await this.command(["pane", "report-agent-session", ...common, "--seq", String(++this.reportSequence)]);
    const state = row.status === "working" ? "working" : "idle";
    await this.command(["pane", "report-agent", ...common, "--seq", String(++this.reportSequence), "--state", state]);
  }

  async notifyCompletion(name: string): Promise<void> {
    await this.command(["notification", "show", "Pi finished", "--body", name, "--sound", "done"]);
  }

  async release(row: LiveSession): Promise<void> {
    await this.command([
      "pane",
      "release-agent",
      row.pane,
      "--source",
      PI_HARNESS_SOURCE,
      "--agent",
      PI_AGENT_NAME,
      "--seq",
      String(++this.reportSequence),
    ]);
  }

  async focus(row: LiveSession): Promise<void> {
    const live = (await this.registry.list()).find((item) => item.identity === row.identity);
    if (!live || live.pane !== row.pane || live.sessionId !== row.sessionId)
      throw new Error("Session is no longer live");
    const result = await this.command(["pane", "get", live.pane]);
    const pane = objectValue(result.pane);
    const location = paneIdentity(pane);
    const processResult = await this.command(["pane", "process-info", "--pane", live.pane]);
    const processInfo = objectValue(processResult.process_info);
    const processes = processInfo.foreground_processes;
    const matchesProcess = Array.isArray(processes) && processes.some((item) => objectValue(item).pid === live.pid);
    if (pane.agent !== PI_AGENT_NAME || location.tab !== live.tab || !matchesProcess) {
      throw new Error("The destination pane no longer hosts this Pi session");
    }
    await this.command(["agent", "focus", live.pane]);
  }

  async name(location: PaneIdentity, name: string): Promise<boolean> {
    await this.command(["pane", "rename", location.pane, name]);
    try {
      await this.command(["agent", "rename", location.pane, name]);
      return true;
    } catch (error) {
      if ((error as { code?: string }).code === AGENT_LAUNCH_PENDING_CODE) return false;
      throw error;
    }
  }

  async create(cwd: string, source: PaneIdentity): Promise<void> {
    const token = randomUUID();
    const name = await this.registry.instanceName(cwd, token);
    try {
      await this.createReserved(cwd, source, token, name);
    } catch (error) {
      const registered = (await this.registry.list()).some((row) => row.identity === token);
      if (!registered) await this.registry.remove(token);
      throw error;
    }
  }

  private async createReserved(cwd: string, source: PaneIdentity, token: string, name: string): Promise<void> {
    const env = ["--env", `PI_MANAGED_SESSION=${token}`, "--env", `PI_SESSION_REGISTRY=${this.registry.directory}`];
    const layout = objectValue((await this.command(["pane", "layout", "--pane", source.pane])).layout);
    const sourcePane = Array.isArray(layout.panes)
      ? layout.panes.find((item) => objectValue(item).pane_id === source.pane)
      : undefined;
    const rect = objectValue(objectValue(sourcePane).rect);
    if (typeof rect.width !== "number" || typeof rect.height !== "number" || rect.width <= 0 || rect.height <= 0) {
      throw new Error("Herdr returned invalid pane dimensions");
    }
    const direction = rect.width >= rect.height * 2 ? "right" : "down";
    const result = await this.command([
      "pane",
      "split",
      "--pane",
      source.pane,
      "--direction",
      direction,
      "--cwd",
      cwd,
      ...env,
      "--no-focus",
    ]);
    const target = paneIdentity(result.pane);
    if (target.tab !== source.tab || target.workspace !== source.workspace || target.pane === source.pane) {
      throw new Error("Herdr did not create a sibling pane");
    }
    await this.command(["pane", "rename", target.pane, name]);
    await this.command(["agent", "start", name, "--kind", PI_AGENT_NAME, "--pane", target.pane, "--timeout", "30000"]);
    const deadline = Date.now() + 10_000;
    while (Date.now() < deadline) {
      const ready = (await this.registry.list()).find(
        (row) => row.identity === token && row.pane === target.pane && row.cwd === cwd,
      );
      if (ready) {
        await this.focus(ready);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    throw new Error("Pi started but did not register. The new pane was left open for inspection.");
  }
}
