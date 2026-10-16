import { expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getKeybindings, KeybindingsManager, setKeybindings } from "@earendil-works/pi-tui";
import { HerdrSessions } from "../agent-configuration/harness/sessions/herdr.ts";
import { defaultSessionDependencies, gitBranch, installSessions } from "../agent-configuration/harness/sessions/install.ts";
import { processStartIdentity, type SessionRegistry } from "../agent-configuration/harness/sessions/registry.ts";
import type { SessionDependencies } from "../agent-configuration/harness/types/sessions/session-dependencies.interface.ts";
import type { LiveSession } from "../agent-configuration/harness/types/sessions/registry/live-session.interface.ts";

test("non-Git projects do not show a conversation-tree branch", async () => {
  expect(await gitBranch(tmpdir())).toBe("no git");
});

test("publication renumbers the pane, agent, and live record after other sessions close", async () => {
  const root = await mkdtemp(join(tmpdir(), "pi-renumber-test-"));
  const previous = { ...process.env };
  const events = new Map<string, any>();
  const names: string[] = [];
  const otherSessions: LiveSession[] = [];
  let store: SessionRegistry | undefined;
  process.env.HERDR_ENV = "1";
  process.env.HERDR_SOCKET_PATH = join(root, "herdr.sock");
  process.env.PI_MANAGED_SESSION = randomUUID();
  process.env.PI_SESSION_REGISTRY = root;
  const token = process.env.PI_MANAGED_SESSION;
  const ctx: any = {
    mode: "tui",
    cwd: root,
    isIdle: () => true,
    hasPendingMessages: () => false,
    getContextUsage: () => undefined,
    ui: { getEditorText: () => "", onTerminalInput: () => () => {}, notify: () => {} },
    sessionManager: { getEntries: () => [], getSessionId: () => "current", getSessionFile: () => undefined },
  };
  const api: any = {
    on: (name: string, handler: any) => events.set(name, handler),
    registerShortcut: () => {},
    registerCommand: () => {},
  };
  try {
    installSessions(api, {
      ...defaultSessionDependencies,
      herdr: (registry) => {
        store = registry;
        return new HerdrSessions(registry, async (args) => {
          if (args[1] === "current") {
            if (otherSessions.length === 0) {
              for (let index = 0; index < 3; index++) {
                const identity = randomUUID();
                const name = await registry.instanceName(root, identity);
                const row: LiveSession = {
                  identity,
                  name,
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
                otherSessions.push(row);
                await registry.publish(row);
              }
            }
            return { pane: { pane_id: "w1:p1", tab_id: "w1:t1", workspace_id: "w1" } };
          }
          if (args[1] === "rename") names.push(`${args[0]}:${args[3]}`);
          return {};
        });
      },
    });
    await events.get("session_start")({}, ctx);
    expect(names.map((name) => name.slice(-4))).toEqual(["pi-4", "pi-4"]);
    await events.get("session_shutdown")({ reason: "reload" }, ctx);
    await events.get("session_start")({}, ctx);
    expect(names.at(-1)).toMatch(/pi-4$/);
    for (const row of otherSessions) await store!.remove(row.identity);
    await events.get("agent_settled")({}, ctx);
    expect(names.slice(-2).map((name) => name.slice(-4))).toEqual(["pi-1", "pi-1"]);
    expect((await store!.list()).find((row) => row.identity === token)?.name).toMatch(/pi-1$/);
  } finally {
    await events.get("session_shutdown")?.({ reason: "quit" }, ctx);
    for (const key of ["HERDR_ENV", "HERDR_SOCKET_PATH", "PI_MANAGED_SESSION", "PI_SESSION_REGISTRY"]) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
    await rm(root, { recursive: true, force: true });
  }
});

test("install reports lifecycle and session identity, protects user history across new sessions", async () => {
  const root = await mkdtemp(join(tmpdir(), "pi-install-test-"));
  const previous = { ...process.env };
  const previousKeybindings = getKeybindings();
  setKeybindings(
    new KeybindingsManager(
      {
        "app.clipboard.pasteImage": { description: "Paste", defaultKeys: "ctrl+v" },
      },
      { "app.clipboard.pasteImage": "ctrl+y" },
    ),
  );
  const events = new Map<string, any>();
  const commands: string[][] = [];
  const shortcuts = new Map<string, any>();
  const registeredCommands = new Map<string, any>();
  const created: { cwd: string; pane: string }[] = [];
  const notifications: string[] = [];
  let menuSelections = 0;
  let projectSelections = 0;
  const show = (ctx: any) => shortcuts.get("ctrl+alt+s")(ctx);
  const createHere = (ctx: any) => shortcuts.get("ctrl+alt+n")(ctx);
  let shutdowns = 0;
  let cleanups = 0;
  let entries: any[] = [{ type: "message", message: { role: "custom", content: "startup" } }];
  let selection: any;
  let createFails = false;
  let notificationFails = false;
  let terminalInput: (data: string) => void = () => {};
  let editor = "";
  let idle = true;
  let pendingRenames = 1;
  const token = randomUUID();
  process.env.HERDR_ENV = "1";
  process.env.HERDR_SOCKET_PATH = join(root, "herdr.sock");
  process.env.PI_MANAGED_SESSION = token;
  process.env.PI_SESSION_REGISTRY = root;
  const ctx: any = {
    mode: "tui",
    cwd: root,
    signal: undefined,
    isIdle: () => idle,
    hasPendingMessages: () => false,
    getContextUsage: () => undefined,
    shutdown: () => {
      shutdowns++;
    },
    ui: {
      getEditorText: () => editor,
      notify: (message: string) => notifications.push(message),
      onTerminalInput: (handler: any) => {
        terminalInput = handler;
        return () => {};
      },
    },
    sessionManager: {
      getEntries: () => entries,
      getSessionId: () => "session",
      getSessionName: () => "test",
      getSessionFile: () => join(root, "session.jsonl"),
    },
  };
  const api: any = {
    on: (name: string, handler: any) => events.set(name, handler),
    registerShortcut: (name: string, spec: any) => shortcuts.set(name, spec.handler),
    registerCommand: (name: string, spec: any) => registeredCommands.set(name, spec.handler),
  };
  try {
    const dependencies: SessionDependencies = {
      ...defaultSessionDependencies,
      herdr: (registry) => {
        const herdr = new HerdrSessions(registry, async (args) => {
          commands.push(args);
          if (args[0] === "notification" && notificationFails) throw new Error("Herdr notification unavailable");
          if (args[0] === "agent" && args[1] === "rename" && pendingRenames > 0) {
            pendingRenames--;
            throw Object.assign(new Error("startup pending"), { code: "agent_launch_pending" });
          }
          if (args[1] === "current" || args[1] === "get")
            return {
              pane: {
                pane_id: "w1:p1",
                tab_id: "w1:t1",
                workspace_id: "w1",
                agent: "pi",
                agent_session: { source: `pi-${token}` },
              },
            };
          return { process_info: { foreground_processes: [{ pid: process.pid }] } };
        });
        herdr.create = async (cwd, source) => {
          if (createFails) throw new Error("startup failed");
          created.push({ cwd, pane: source.pane });
        };
        return herdr;
      },
      selectSession: async (_ctx, registry) => {
        menuSelections++;
        return selection === "self" ? (await registry.list())[0] : selection;
      },
      selectProject: async () => {
        projectSelections++;
        return { selected: true, path: root };
      },
      scheduleCleanup: async () => {
        cleanups++;
        return () => {};
      },
    };
    installSessions(api, dependencies);
    expect([...shortcuts.keys()]).toEqual(["ctrl+alt+q", "ctrl+alt+s", "ctrl+alt+n"]);
    await createHere({ ...ctx, mode: "rpc" });
    expect(created).toEqual([]);
    expect(notifications.at(-1)).toContain("interactive Pi");
    await events.get("session_start")({}, ctx);
    expect(
      commands.some((args) => args[1] === "report-agent-session" && args.includes(join(root, "session.jsonl"))),
    ).toBe(true);
    expect(commands.some((args) => args[1] === "report-agent" && args.includes("idle"))).toBe(true);
    expect(commands.filter((args) => args[0] === "notification")).toHaveLength(0);
    expect(commands.some((args) => args[0] === "pane" && args[1] === "rename" && /-pi-1$/.test(args[3]!))).toBe(true);
    expect(commands.some((args) => args[0] === "agent" && args[1] === "rename" && /-pi-1$/.test(args[3]!))).toBe(true);

    expect(notifications.some((message) => message.includes("Session manager unavailable"))).toBe(false);
    selection = "self";
    await registeredCommands.get("sessions")("", ctx);
    expect(commands.filter((args) => args[0] === "agent" && args[1] === "rename")).toHaveLength(2);
    expect(commands.some((args) => args[0] === "agent" && args[1] === "focus")).toBe(true);

    idle = false;
    await events.get("agent_start")({}, ctx);
    const workingReport = commands.findLast((args) => args[1] === "report-agent")!;
    expect(workingReport[workingReport.indexOf("--state") + 1]).toBe("working");
    expect(workingReport[workingReport.indexOf("--source") + 1]).toBe("pi:harness");
    idle = true;
    await events.get("agent_settled")({}, ctx);
    const idleReport = commands.findLast((args) => args[1] === "report-agent")!;
    expect(idleReport[idleReport.indexOf("--state") + 1]).toBe("idle");
    const completionName = commands.findLast((args) => args[0] === "pane" && args[1] === "rename")![3]!;
    expect(commands.filter((args) => args[0] === "notification")).toEqual([
      ["notification", "show", "Pi finished", "--body", completionName, "--sound", "done"],
    ]);
    await events.get("agent_settled")({}, ctx);
    expect(commands.filter((args) => args[0] === "notification")).toHaveLength(1);

    for (const mode of ["rpc", "print", "json"]) {
      await events.get("agent_start")({}, { ...ctx, mode });
      await events.get("agent_settled")({}, { ...ctx, mode });
    }
    expect(commands.filter((args) => args[0] === "notification")).toHaveLength(1);

    await events.get("agent_start")({}, ctx);
    await events.get("agent_settled")({ aborted: true }, ctx);
    expect(commands.filter((args) => args[0] === "notification")).toHaveLength(1);

    await events.get("agent_start")({}, ctx);
    await events.get("agent_settled")({}, ctx);
    expect(commands.filter((args) => args[0] === "notification")).toHaveLength(2);

    notificationFails = true;
    await events.get("agent_start")({}, ctx);
    await events.get("agent_settled")({}, ctx);
    expect(notifications.at(-1)).toContain("Completion notification failed");
    await events.get("agent_settled")({}, ctx);
    expect(commands.filter((args) => args[0] === "notification")).toHaveLength(3);
    notificationFails = false;

    selection = "self";
    await registeredCommands.get("sessions")("", ctx);
    expect(shutdowns).toBe(0);
    expect(cleanups).toBe(0);
    selection = "new";
    createFails = true;
    await show(ctx);
    expect(cleanups).toBe(0);
    createFails = false;
    await show(ctx);
    expect(cleanups).toBe(1);
    expect(shutdowns).toBe(1);
    editor = "existing draft";
    const menusBefore = menuSelections;
    const projectsBefore = projectSelections;
    await createHere(ctx);
    expect(created.at(-1)).toEqual({ cwd: root, pane: "w1:p1" });
    expect(menuSelections).toBe(menusBefore);
    expect(projectSelections).toBe(projectsBefore);
    expect(editor).toBe("existing draft");
    expect(cleanups).toBe(1);
    createFails = true;
    await createHere(ctx);
    expect(notifications.at(-1)).toContain("startup failed");
    expect(cleanups).toBe(1);
    createFails = false;
    terminalInput("\x19");
    await show(ctx);
    expect(cleanups).toBe(1);
    editor = "";
    await show(ctx);
    expect(cleanups).toBe(1);
    expect(shutdowns).toBe(1);
    await events.get("before_agent_start")({}, ctx);
    await events.get("session_shutdown")({ reason: "new" }, ctx);
    entries = [];
    await events.get("session_start")({}, ctx);
    selection = "new";
    await show(ctx);
    expect(shutdowns).toBe(1);
    expect(cleanups).toBe(1);
    const files = await import("node:fs/promises");
    const directories = await files.readdir(root);
    const scope = directories.find((item) => /^[a-f0-9]{24}$/.test(item))!;
    const record = JSON.parse(await files.readFile(join(root, scope, `${token}.json`), "utf8"));
    expect(record.historyEver).toBe(true);
    expect(record.cleanupSafe).toBe(false);
    expect(record.branch).toBe("no git");

    await events.get("session_shutdown")({}, ctx);
    process.env.PI_MANAGED_SESSION = randomUUID();
    entries = [];
    let canceled = 0;
    installSessions(api, {
      ...dependencies,
      scheduleCleanup: async () => {
        await events.get("before_agent_start")({}, ctx);
        return () => {
          canceled++;
        };
      },
    });
    await events.get("session_start")({}, ctx);
    selection = "new";
    await show(ctx);
    expect(canceled).toBe(1);
    expect(shutdowns).toBe(1);

    await events.get("session_shutdown")({}, ctx);
    delete process.env.PI_MANAGED_SESSION;
    installSessions(api, dependencies);
    await events.get("session_start")({}, ctx);
    const firstName = commands.findLast((args) => args[0] === "agent" && args[1] === "rename")?.[3];
    await events.get("session_shutdown")({}, ctx);
    installSessions(api, dependencies);
    await events.get("session_start")({}, ctx);
    const reloadedName = commands.findLast((args) => args[0] === "agent" && args[1] === "rename")?.[3];
    expect(reloadedName).toBe(firstName);
    await createHere(ctx);
    expect(cleanups).toBe(1);
    expect(shutdowns).toBe(1);
  } finally {
    await events.get("session_shutdown")?.({}, ctx);
    setKeybindings(previousKeybindings);
    for (const key of ["HERDR_ENV", "HERDR_SOCKET_PATH", "PI_MANAGED_SESSION", "PI_SESSION_REGISTRY"]) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
    await rm(root, { recursive: true, force: true });
  }
});
