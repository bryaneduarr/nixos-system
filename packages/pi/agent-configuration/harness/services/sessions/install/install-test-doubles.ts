import { expect } from "bun:test";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { HerdrCommand } from "../../../types/sessions/herdr/herdr-command.interface.ts";
import type { LiveSession } from "../../../types/sessions/registry/live-session.interface.ts";
import type { SessionRegistry } from "../../../types/sessions/registry/session-registry.interface.ts";
import type { SessionDependencies } from "../../../types/sessions/session-dependencies.interface.ts";
import { createHerdrSessions } from "../herdr/create-herdr-sessions.service.ts";
import { processStartIdentity } from "../registry/process-start-identity.service.ts";
import { createDefaultSessionDependencies } from "./create-default-session-dependencies.service.ts";

type EventHandler = (event: unknown, ctx: ExtensionContext) => unknown;
type ShortcutHandler = (ctx: ExtensionContext) => Promise<void>;
type CommandHandler = (args: string, ctx: ExtensionContext) => Promise<void>;

export type InstallFlags = { notificationFails: boolean; pendingRenames: number; createFails: boolean };

export type InstallState = {
  idle: boolean;
  editor: string;
  shutdowns: number;
  cleanups: number;
  entries: unknown[];
  terminalInput: (data: string) => void;
  selection: "self" | "new" | "cancel";
  menuSelections: number;
  projectSelections: number;
};

export const ENVIRONMENT_KEYS = [
  "HERDR_ENV",
  "HERDR_SOCKET_PATH",
  "PI_MANAGED_SESSION",
  "PI_SESSION_REGISTRY",
] as const;

const SAMPLE_ACTIVE_SESSIONS = 3;

export function handlerNamed<T>(handlers: Map<string, T>, name: string): T {
  const handler = handlers.get(name);
  if (handler === undefined) throw new Error(`Missing handler ${name}`);
  return handler;
}

export function registerFakeApi() {
  const events = new Map<string, EventHandler>();
  const shortcuts = new Map<string, ShortcutHandler>();
  const commands = new Map<string, CommandHandler>();
  // Test double implements only the registration methods the installer calls.
  const api = {
    on: (name: string, handler: EventHandler) => events.set(name, handler),
    registerShortcut: (name: string, spec: { handler: ShortcutHandler }) => shortcuts.set(name, spec.handler),
    registerCommand: (name: string, spec: { handler: CommandHandler }) => commands.set(name, spec.handler),
  } as unknown as ExtensionAPI;
  return { api, events, shortcuts, commands };
}

export function createRenumberCommand(
  registry: SessionRegistry,
  root: string,
  otherSessions: LiveSession[],
): HerdrCommand {
  return async (args) => {
    if (args[1] === "current") {
      if (otherSessions.length === 0) {
        for (let index = 0; index < SAMPLE_ACTIVE_SESSIONS; index++) {
          const row = await createOtherSession(registry, root, index);
          otherSessions.push(row);
          await registry.publish(row);
        }
      }
      return { pane: { pane_id: "w1:p1", tab_id: "w1:t1", workspace_id: "w1" } };
    }
    return {};
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
      return {
        pane: {
          pane_id: "w1:p1",
          tab_id: "w1:t1",
          workspace_id: "w1",
          agent: "pi",
          agent_session: { source: `pi-${token}` },
        },
      };
    }
    return { process_info: { foreground_processes: [{ pid: process.pid }] } };
  };
}

export function commandNamed(sentCommands: string[][], command: string, subcommand: string): string[][] {
  return sentCommands.filter((args) => args[0] === command && args[1] === subcommand);
}

export function stateFlagOf(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index === -1 ? undefined : args[index + 1];
}

export function lastReport(sentCommands: string[][]): string[] {
  return sentCommands.findLast((args) => args[1] === "report-agent") ?? [];
}

export function lastReportState(sentCommands: string[][]): string | undefined {
  return stateFlagOf(lastReport(sentCommands), "--state");
}

export function createInstallContext(root: string, state: InstallState, notifications: string[]): ExtensionContext {
  // Test double implements only the context members the installer reads.
  return {
    mode: "tui",
    cwd: root,
    signal: undefined,
    isIdle: () => state.idle,
    hasPendingMessages: () => false,
    getContextUsage: () => undefined,
    shutdown: () => {
      state.shutdowns++;
    },
    ui: {
      getEditorText: () => state.editor,
      notify: (message: string) => notifications.push(message),
      onTerminalInput: (handler: (data: string) => void) => {
        state.terminalInput = handler;
        return () => {};
      },
    },
    sessionManager: {
      getEntries: () => state.entries,
      getSessionId: () => "session",
      getSessionName: () => "test",
      getSessionFile: () => join(root, "session.jsonl"),
    },
  } as unknown as ExtensionContext;
}

export function environmentFor(root: string, token: string): Record<string, string> {
  return {
    HERDR_ENV: "1",
    HERDR_SOCKET_PATH: join(root, "herdr.sock"),
    PI_MANAGED_SESSION: token,
    PI_SESSION_REGISTRY: root,
  };
}

export function applyEnvironment(values: Record<string, string>): void {
  for (const key of Object.keys(values)) {
    const value = values[key];
    if (value !== undefined) process.env[key] = value;
  }
}

export function restoreEnvironment(keys: readonly string[], previous: NodeJS.ProcessEnv): void {
  for (const key of keys) {
    if (previous[key] === undefined) delete process.env[key];
    else process.env[key] = previous[key];
  }
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
    herdr: (registry) => {
      const herdr = createHerdrSessions(registry, createInstallCommand(token, sentCommands, flags));
      return {
        ...herdr,
        create: async (cwd, source) => {
          if (flags.createFails) throw new Error("startup failed");
          created.push({ cwd, pane: source.pane });
        },
      };
    },
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
