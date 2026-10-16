import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { getKeybindings, KeybindingsManager, setKeybindings } from "@earendil-works/pi-tui";
import type { HerdrCommand } from "../../../types/sessions/herdr/herdr-command.interface.ts";
import type { LiveSession } from "../../../types/sessions/registry/live-session.interface.ts";
import type { SessionRegistry } from "../../../types/sessions/registry/session-registry.interface.ts";
import type { SessionDependencies } from "../../../types/sessions/session-dependencies.interface.ts";
import { createHerdrSessions } from "../herdr/create-herdr-sessions.service.ts";
import { readGitBranch } from "../monitor/read-git-branch.service.ts";
import { processStartIdentity } from "../registry/process-start-identity.service.ts";
import { createDefaultSessionDependencies } from "./create-default-session-dependencies.service.ts";
import { installSessions } from "./install-sessions.service.ts";

type EventHandler = (event: unknown, ctx: ExtensionContext) => unknown;
type ShortcutHandler = (ctx: ExtensionContext) => Promise<void>;
type CommandHandler = (args: string, ctx: ExtensionContext) => Promise<void>;

const SAMPLE_ACTIVE_SESSIONS = 3;

function handlerNamed<T>(handlers: Map<string, T>, name: string): T {
  const handler = handlers.get(name);
  if (handler === undefined) throw new Error(`Missing handler ${name}`);
  return handler;
}

function registerFakeApi() {
  const events = new Map<string, EventHandler>();
  const shortcuts = new Map<string, ShortcutHandler>();
  const commands = new Map<string, CommandHandler>();
  const api = {
    on: (name: string, handler: EventHandler) => events.set(name, handler),
    registerShortcut: (name: string, spec: { handler: ShortcutHandler }) => shortcuts.set(name, spec.handler),
    registerCommand: (name: string, spec: { handler: CommandHandler }) => commands.set(name, spec.handler),
  } as unknown as ExtensionAPI;
  return { api, events, shortcuts, commands };
}

function createRenumberCommand(registry: SessionRegistry, root: string, otherSessions: LiveSession[]): HerdrCommand {
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

type InstallFlags = { notificationFails: boolean; pendingRenames: number; createFails: boolean };

function commandNamed(sentCommands: string[][], command: string, subcommand: string): string[][] {
  return sentCommands.filter((args) => args[0] === command && args[1] === subcommand);
}

function stateFlagOf(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index === -1 ? undefined : args[index + 1];
}

function lastReport(sentCommands: string[][]): string[] {
  return sentCommands.findLast((args) => args[1] === "report-agent") ?? [];
}

function lastReportState(sentCommands: string[][]): string | undefined {
  return stateFlagOf(lastReport(sentCommands), "--state");
}

function createInstallContext(root: string, state: InstallState, notifications: string[]): ExtensionContext {
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

type InstallState = {
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

function environmentFor(root: string, token: string): Record<string, string> {
  return {
    HERDR_ENV: "1",
    HERDR_SOCKET_PATH: join(root, "herdr.sock"),
    PI_MANAGED_SESSION: token,
    PI_SESSION_REGISTRY: root,
  };
}

function applyEnvironment(values: Record<string, string>): void {
  for (const key of Object.keys(values)) {
    const value = values[key];
    if (value !== undefined) process.env[key] = value;
  }
}

function restoreEnvironment(keys: readonly string[], previous: NodeJS.ProcessEnv): void {
  for (const key of keys) {
    if (previous[key] === undefined) delete process.env[key];
    else process.env[key] = previous[key];
  }
}

const ENVIRONMENT_KEYS = ["HERDR_ENV", "HERDR_SOCKET_PATH", "PI_MANAGED_SESSION", "PI_SESSION_REGISTRY"] as const;

describe("installSessions", () => {
  test("non-Git projects do not show a conversation-tree branch", async () => {
    expect(await readGitBranch(tmpdir())).toBe("no git");
  });

  test("publication renumbers the pane, agent, and live record after other sessions close", async () => {
    const root = await mkdtemp(join(tmpdir(), "pi-renumber-test-"));
    const previous = { ...process.env };
    const { api, events } = registerFakeApi();
    const names: string[] = [];
    const otherSessions: LiveSession[] = [];
    let store: SessionRegistry | undefined;
    const token = randomUUID();
    applyEnvironment(environmentFor(root, token));
    const ctx = {
      mode: "tui",
      cwd: root,
      isIdle: () => true,
      hasPendingMessages: () => false,
      getContextUsage: () => undefined,
      ui: { getEditorText: () => "", onTerminalInput: () => () => {}, notify: () => {} },
      sessionManager: { getEntries: () => [], getSessionId: () => "current", getSessionFile: () => undefined },
    } as unknown as ExtensionContext;
    try {
      installSessions(api, {
        ...createDefaultSessionDependencies(),
        herdr: (registry) => {
          store = registry;
          const command = createRenumberCommand(registry, root, otherSessions);
          return createHerdrSessions(registry, async (args) => {
            if (args[1] === "rename") names.push(`${args[0]}:${args[3]}`);
            return command(args);
          });
        },
      });
      await handlerNamed(events, "session_start")({}, ctx);
      expect(names.map((name) => name.slice(-4))).toEqual(["pi-4", "pi-4"]);
      await handlerNamed(events, "session_shutdown")({ reason: "reload" }, ctx);
      await handlerNamed(events, "session_start")({}, ctx);
      expect(names.at(-1)).toMatch(/pi-4$/);
      const registry = store;
      if (registry === undefined) throw new Error("Registry was not created");
      for (const row of otherSessions) await registry.remove(row.identity, false);
      await handlerNamed(events, "agent_settled")({}, ctx);
      expect(names.slice(-2).map((name) => name.slice(-4))).toEqual(["pi-1", "pi-1"]);
      expect((await registry.list()).find((row) => row.identity === token)?.name).toMatch(/pi-1$/);
    } finally {
      await handlerNamed(events, "session_shutdown")({ reason: "quit" }, ctx);
      restoreEnvironment(ENVIRONMENT_KEYS, previous);
      await rm(root, { recursive: true, force: true });
    }
  });

  test("agent state and completion notifications follow the active run", async () => {
    const root = await mkdtemp(join(tmpdir(), "pi-install-state-test-"));
    const previous = { ...process.env };
    const { api, events } = registerFakeApi();
    const sentCommands: string[][] = [];
    const notifications: string[] = [];
    const token = randomUUID();
    const flags: InstallFlags = { notificationFails: false, pendingRenames: 1, createFails: false };
    const state: InstallState = {
      idle: true,
      editor: "",
      shutdowns: 0,
      cleanups: 0,
      entries: [{ type: "message", message: { role: "custom", content: "startup" } }],
      terminalInput: () => {},
      selection: "cancel",
      menuSelections: 0,
      projectSelections: 0,
    };
    applyEnvironment(environmentFor(root, token));
    const ctx = createInstallContext(root, state, notifications);
    try {
      installSessions(api, createInstallDependencies(root, token, sentCommands, flags, state));
      await handlerNamed(events, "session_start")({}, ctx);
      expect(sentCommands.some((args) => args[1] === "report-agent" && args.includes("idle"))).toBe(true);
      expect(commandNamed(sentCommands, "notification", "show")).toHaveLength(0);

      state.idle = false;
      await handlerNamed(events, "agent_start")({}, ctx);
      expect(lastReportState(sentCommands)).toBe("working");
      expect(stateFlagOf(lastReport(sentCommands), "--source")).toBe("pi:harness");
      state.idle = true;
      await handlerNamed(events, "agent_settled")({}, ctx);
      expect(lastReportState(sentCommands)).toBe("idle");
      const completionName = sentCommands.findLast((args) => args[0] === "pane" && args[1] === "rename")?.[3] ?? "";
      expect(commandNamed(sentCommands, "notification", "show")).toEqual([
        ["notification", "show", "Pi finished", "--body", completionName, "--sound", "done"],
      ]);
      await handlerNamed(events, "agent_settled")({}, ctx);
      expect(sentCommands.filter((args) => args[0] === "notification")).toHaveLength(1);

      for (const mode of ["rpc", "print", "json"]) {
        await handlerNamed(events, "agent_start")({}, { ...ctx, mode } as ExtensionContext);
        await handlerNamed(events, "agent_settled")({}, { ...ctx, mode } as ExtensionContext);
      }
      expect(sentCommands.filter((args) => args[0] === "notification")).toHaveLength(1);

      await handlerNamed(events, "agent_start")({}, ctx);
      await handlerNamed(events, "agent_settled")({ aborted: true }, ctx);
      expect(sentCommands.filter((args) => args[0] === "notification")).toHaveLength(1);

      await handlerNamed(events, "agent_start")({}, ctx);
      await handlerNamed(events, "agent_settled")({}, ctx);
      expect(sentCommands.filter((args) => args[0] === "notification")).toHaveLength(2);

      flags.notificationFails = true;
      await handlerNamed(events, "agent_start")({}, ctx);
      await handlerNamed(events, "agent_settled")({}, ctx);
      expect(notifications.at(-1)).toContain("Completion notification failed");
      await handlerNamed(events, "agent_settled")({}, ctx);
      expect(sentCommands.filter((args) => args[0] === "notification")).toHaveLength(3);
      flags.notificationFails = false;
    } finally {
      await handlerNamed(events, "session_shutdown")({}, ctx);
      restoreEnvironment(ENVIRONMENT_KEYS, previous);
      await rm(root, { recursive: true, force: true });
    }
  });

  test("install reports lifecycle and session identity, protects user history across new sessions", async () => {
    const root = await mkdtemp(join(tmpdir(), "pi-install-test-"));
    const previous = { ...process.env };
    const previousKeybindings = getKeybindings();
    setKeybindings(
      new KeybindingsManager(
        { "app.clipboard.pasteImage": { description: "Paste", defaultKeys: "ctrl+v" } },
        { "app.clipboard.pasteImage": "ctrl+y" },
      ),
    );
    const { api, events, shortcuts, commands: registeredCommands } = registerFakeApi();
    const sentCommands: string[][] = [];
    const created: { cwd: string; pane: string }[] = [];
    const notifications: string[] = [];
    const token = randomUUID();
    const flags: InstallFlags = { notificationFails: false, pendingRenames: 1, createFails: false };
    const state: InstallState = {
      idle: true,
      editor: "",
      shutdowns: 0,
      cleanups: 0,
      entries: [{ type: "message", message: { role: "custom", content: "startup" } }],
      terminalInput: () => {},
      selection: "cancel",
      menuSelections: 0,
      projectSelections: 0,
    };
    applyEnvironment(environmentFor(root, token));
    const ctx = createInstallContext(root, state, notifications);
    const show = (target: ExtensionContext) => handlerNamed(shortcuts, "ctrl+alt+s")(target);
    const createHere = (target: ExtensionContext) => handlerNamed(shortcuts, "ctrl+alt+n")(target);
    const dependencies = createInstallDependencies(root, token, sentCommands, flags, state, created);
    try {
      installSessions(api, dependencies);
      expect([...shortcuts.keys()]).toEqual(["ctrl+alt+q", "ctrl+alt+s", "ctrl+alt+n"]);
      await createHere({ ...ctx, mode: "rpc" } as ExtensionContext);
      expect(created).toEqual([]);
      expect(notifications.at(-1)).toContain("interactive Pi");
      await handlerNamed(events, "session_start")({}, ctx);
      expect(
        sentCommands.some((args) => args[1] === "report-agent-session" && args.includes(join(root, "session.jsonl"))),
      ).toBe(true);
      expect(
        sentCommands.some((args) => args[0] === "pane" && args[1] === "rename" && /-pi-1$/.test(args[3] ?? "")),
      ).toBe(true);
      expect(
        sentCommands.some((args) => args[0] === "agent" && args[1] === "rename" && /-pi-1$/.test(args[3] ?? "")),
      ).toBe(true);
      expect(notifications.some((message) => message.includes("Session manager unavailable"))).toBe(false);

      state.selection = "self";
      await handlerNamed(registeredCommands, "sessions")("", ctx);
      expect(commandNamed(sentCommands, "agent", "rename")).toHaveLength(2);
      expect(commandNamed(sentCommands, "agent", "focus")).toHaveLength(1);

      state.selection = "new";
      flags.createFails = true;
      await show(ctx);
      expect(state.cleanups).toBe(0);
      flags.createFails = false;
      await show(ctx);
      expect(state.cleanups).toBe(1);
      expect(state.shutdowns).toBe(1);

      state.editor = "existing draft";
      const menusBefore = state.menuSelections;
      const projectsBefore = state.projectSelections;
      await createHere(ctx);
      expect(created.at(-1)).toEqual({ cwd: root, pane: "w1:p1" });
      expect(state.menuSelections).toBe(menusBefore);
      expect(state.projectSelections).toBe(projectsBefore);
      expect(state.editor).toBe("existing draft");
      expect(state.cleanups).toBe(1);
      flags.createFails = true;
      await createHere(ctx);
      expect(notifications.at(-1)).toContain("startup failed");
      expect(state.cleanups).toBe(1);
      flags.createFails = false;
      state.terminalInput("\x19");
      await show(ctx);
      expect(state.cleanups).toBe(1);
      state.editor = "";
      await show(ctx);
      expect(state.cleanups).toBe(1);
      expect(state.shutdowns).toBe(1);

      await handlerNamed(events, "before_agent_start")({}, ctx);
      await handlerNamed(events, "session_shutdown")({ reason: "new" }, ctx);
      state.entries = [];
      await handlerNamed(events, "session_start")({}, ctx);
      state.selection = "new";
      await show(ctx);
      expect(state.shutdowns).toBe(1);
      expect(state.cleanups).toBe(1);
      await expectHistoryRecord(root, token);

      await handlerNamed(events, "session_shutdown")({}, ctx);
      process.env.PI_MANAGED_SESSION = randomUUID();
      state.entries = [];
      let canceled = 0;
      installSessions(api, {
        ...dependencies,
        scheduleCleanup: async () => {
          await handlerNamed(events, "before_agent_start")({}, ctx);
          return () => {
            canceled++;
          };
        },
      });
      await handlerNamed(events, "session_start")({}, ctx);
      state.selection = "new";
      await show(ctx);
      expect(canceled).toBe(1);
      expect(state.shutdowns).toBe(1);

      await handlerNamed(events, "session_shutdown")({}, ctx);
      delete process.env.PI_MANAGED_SESSION;
      installSessions(api, dependencies);
      await handlerNamed(events, "session_start")({}, ctx);
      const firstName = sentCommands.findLast((args) => args[0] === "agent" && args[1] === "rename")?.[3];
      await handlerNamed(events, "session_shutdown")({}, ctx);
      installSessions(api, dependencies);
      await handlerNamed(events, "session_start")({}, ctx);
      const reloadedName = sentCommands.findLast((args) => args[0] === "agent" && args[1] === "rename")?.[3];
      expect(reloadedName).toBe(firstName);
      await createHere(ctx);
      expect(state.cleanups).toBe(1);
      expect(state.shutdowns).toBe(1);
    } finally {
      await handlerNamed(events, "session_shutdown")({}, ctx);
      setKeybindings(previousKeybindings);
      restoreEnvironment(ENVIRONMENT_KEYS, previous);
      await rm(root, { recursive: true, force: true });
    }
  });
});

function createInstallDependencies(
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

async function expectHistoryRecord(root: string, token: string): Promise<void> {
  const files = await import("node:fs/promises");
  const directories = await files.readdir(root);
  const scope = directories.find((item) => /^[a-f0-9]{24}$/.test(item));
  if (scope === undefined) throw new Error("Registry scope directory was not created");
  const record: unknown = JSON.parse(await files.readFile(join(root, scope, `${token}.json`), "utf8"));
  if (typeof record !== "object" || record === null) throw new Error("Live record is not an object");
  expect(Reflect.get(record, "historyEver")).toBe(true);
  expect(Reflect.get(record, "cleanupSafe")).toBe(false);
  expect(Reflect.get(record, "branch")).toBe("no git");
}
