import { expect } from "bun:test";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import type { HerdrCommand } from "../../../types/sessions/herdr/command/herdr-command.interface.ts";
import type { SessionDependencies } from "../../../types/sessions/install/session-dependencies.interface.ts";
import type { LiveSession } from "../../../types/sessions/registry/row/live-session.interface.ts";
import type { SessionRegistry } from "../../../types/sessions/registry/row/session-registry.interface.ts";
import { createHerdrSessions } from "../herdr/create-herdr-sessions.service.ts";
import { processStartIdentity } from "../registry/identity/process-start-identity.service.ts";
import { createDefaultSessionDependencies } from "./create-default-session-dependencies.service.ts";
import type { InstallFlags, InstallState } from "./install-sessions.test-double.ts";

const SAMPLE_ACTIVE_SESSIONS = 3;

export function createRenumberCommand(registry: SessionRegistry, root: string, sessions: LiveSession[]): HerdrCommand {
  return async (args) => {
    if (args[1] !== "current") return {};
    if (sessions.length === 0) {
      for (let index = 0; index < SAMPLE_ACTIVE_SESSIONS; index++) {
        const row = await createOtherSession(registry, root, index);
        sessions.push(row);
        await registry.publish(row);
      }
    }
    return { pane: { pane_id: "w1:p1", tab_id: "w1:t1", workspace_id: "w1" } };
  };
}

async function createOtherSession(registry: SessionRegistry, root: string, index: number): Promise<LiveSession> {
  const identity = randomUUID();
  return {
    identity,
    name: await registry.instanceName(root, identity),
    cwd: root,
    pid: process.pid,
    updatedAt: Date.now(),
    pane: `w1:p${index + 2}`,
    tab: "w1:t1",
    workspace: "w1",
    sessionId: `other-${index}`,
    branch: "no git",
    processStart: await processStartIdentity(process.pid),
    context: { usageState: "unavailable" },
    status: "idle",
    owned: true,
    historyEver: false,
    cleanupSafe: false,
  };
}

function createInstallCommand(token: string, sentCommands: string[][], flags: InstallFlags): HerdrCommand {
  return async (args) => {
    sentCommands.push(args);
    if (args[0] === "notification" && flags.notificationFails) throw new Error("Herdr notification unavailable");
    if (args[0] === "agent" && args[1] === "rename" && flags.pendingRenames > 0) {
      flags.pendingRenames--;
      throw Object.assign(new Error("startup pending"), { code: "agent_launch_pending" });
    }
    if (args[1] === "current" || args[1] === "get") {
      const agentSession = { source: `pi-${token}` };
      return {
        pane: { pane_id: "w1:p1", tab_id: "w1:t1", workspace_id: "w1", agent: "pi", agent_session: agentSession },
      };
    }
    return { process_info: { foreground_processes: [{ pid: process.pid }] } };
  };
}

export function commandNamed(sentCommands: string[][], command: string, subcommand: string): string[][] {
  return sentCommands.filter((args) => args[0] === command && args[1] === subcommand);
}

export function lastCommandArgument(
  sentCommands: string[][],
  command: string,
  subcommand: string,
  position: number,
): string {
  const args = sentCommands.findLast((entry) => entry[0] === command && entry[1] === subcommand);
  if (args === undefined) throw new Error(`Missing command ${command} ${subcommand}`);
  const argument = args[position];
  if (argument === undefined) throw new Error(`Missing argument ${position} of ${command} ${subcommand}`);
  return argument;
}

export function stateFlagOf(args: string[], flag: string): string {
  const index = args.indexOf(flag);
  const value = index === -1 ? undefined : args[index + 1];
  if (value === undefined) throw new Error(`Missing flag ${flag}`);
  return value;
}

export function lastReport(sentCommands: string[][]): string[] {
  return sentCommands.findLast((args) => args[1] === "report-agent") ?? [];
}

export function lastReportState(sentCommands: string[][]): string {
  return stateFlagOf(lastReport(sentCommands), "--state");
}

export function createInstallDependencies(
  root: string,
  token: string,
  sentCommands: string[][],
  flags: InstallFlags,
  state: InstallState,
  created: { cwd: string; pane: string }[] = [],
): SessionDependencies {
  return {
    ...createDefaultSessionDependencies(),
    herdr: (registry) => ({
      ...createHerdrSessions(registry, createInstallCommand(token, sentCommands, flags)),
      create: async (cwd, source) => {
        if (flags.createFails) throw new Error("startup failed");
        created.push({ cwd, pane: source.pane });
      },
    }),
    selectSession: async (_ctx, registry) => {
      state.menuSelections++;
      if (state.selection === "self") {
        const first = (await registry.list())[0];
        if (first === undefined) throw new Error("No live session to select");
        return first;
      }
      return state.selection === "new" ? "new" : "cancel";
    },
    selectProject: async () => {
      state.projectSelections++;
      return { selected: true, path: root };
    },
    scheduleCleanup: async () => {
      state.cleanups++;
      return () => {};
    },
  };
}

export async function expectHistoryRecord(root: string, token: string): Promise<void> {
  const files = await import("node:fs/promises");
  const directories = await files.readdir(root);
  const scope = directories.find((entry) => /^[a-f0-9]{24}$/.test(entry));
  if (scope === undefined) throw new Error("Registry scope directory was not created");
  const record: unknown = JSON.parse(await files.readFile(join(root, scope, `${token}.json`), "utf8"));
  if (typeof record !== "object" || record === null) throw new Error("Live record is not an object");
  expect(Reflect.get(record, "historyEver")).toBe(true);
  expect(Reflect.get(record, "cleanupSafe")).toBe(false);
  expect(Reflect.get(record, "branch")).toBe("no git");
}
