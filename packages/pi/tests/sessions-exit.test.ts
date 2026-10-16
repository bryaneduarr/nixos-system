import { expect, test } from "bun:test";
import { cleanupAfterExit, explicitExitAfterExit } from "../agent-configuration/harness/sessions/cleanup-worker.mjs";
import { exitTarget, installExit } from "../agent-configuration/harness/sessions/exit.ts";
import type { HerdrCommand } from "../agent-configuration/harness/sessions/herdr.ts";

function harness() {
  const commands = new Map<string, any>();
  const shortcuts = new Map<string, any>();
  const events = new Map<string, any>();
  const notifications: string[] = [];
  const effects: string[] = [];
  let approve = false;
  let draft = "";
  let idle = true;
  let pending = false;
  const ctx: any = {
    mode: "tui",
    isIdle: () => idle,
    hasPendingMessages: () => pending,
    shutdown: () => effects.push("shutdown"),
    abort: () => effects.push("abort"),
    ui: {
      getEditorText: () => draft,
      confirm: async (_title: string, text: string) => {
        effects.push(text);
        return approve;
      },
      notify: (message: string) => notifications.push(message),
    },
  };
  const api: any = {
    on: (name: string, handler: any) => events.set(name, handler),
    registerCommand: (name: string, spec: any) => commands.set(name, spec.handler),
    registerShortcut: (name: string, spec: any) => shortcuts.set(name, spec.handler),
  };
  return {
    api,
    ctx,
    commands,
    shortcuts,
    events,
    notifications,
    effects,
    approve: () => {
      approve = true;
    },
    activity: (text: string, busy: boolean, queued: boolean) => {
      draft = text;
      idle = !busy;
      pending = queued;
    },
    reset: () => events.get("session_shutdown")({ reason: "reload" }),
  };
}

test("explicit exit confirms busy work, pending messages and drafts, cancellation has no effects", async () => {
  const previous = process.env.HERDR_ENV;
  delete process.env.HERDR_ENV;
  const h = harness();
  try {
    installExit(h.api);
    h.reset();
    h.activity("draft", true, true);
    await h.commands.get("exit")("", h.ctx);
    expect(h.effects).toHaveLength(1);
    expect(h.effects[0]).toContain("active work, pending messages, the editor draft");
    h.approve();
    await h.shortcuts.get("ctrl+alt+q")(h.ctx);
    expect(h.effects.slice(-2)).toEqual(["shutdown", "abort"]);
    const count = h.effects.length;
    await h.commands.get("exit")("", h.ctx);
    installExit(h.api);
    await h.shortcuts.get("ctrl+alt+q")(h.ctx);
    expect(h.effects).toHaveLength(count);
  } finally {
    h.reset();
    if (previous === undefined) delete process.env.HERDR_ENV;
    else process.env.HERDR_ENV = previous;
  }
});

test("reload while confirming prevents stale context shutdown", async () => {
  const h = harness();
  installExit(h.api);
  h.reset();
  h.activity("draft", false, false);
  let resolve: (value: boolean) => void = () => {};
  h.ctx.ui.confirm = () =>
    new Promise<boolean>((done) => {
      resolve = done;
    });
  const attempt = h.commands.get("exit")("", h.ctx);
  await h.shortcuts.get("ctrl+alt+q")(h.ctx);
  h.reset();
  resolve(true);
  await attempt;
  expect(h.effects).toEqual([]);
});

test("Herdr preflight failure leaves Pi running and reports an actionable error", async () => {
  const previous = process.env.HERDR_ENV;
  process.env.HERDR_ENV = "1";
  const h = harness();
  let workers = 0;
  try {
    installExit(h.api, {
      command: () => async () => {
        throw new Error("unsafe process identity");
      },
      schedule: async () => {
        workers++;
        return () => {};
      },
    });
    h.reset();
    await h.commands.get("exit")("", h.ctx);
    expect(h.effects).toEqual([]);
    expect(workers).toBe(0);
    expect(h.notifications.at(-1)).toContain("retry /exit");
  } finally {
    h.reset();
    if (previous === undefined) delete process.env.HERDR_ENV;
    else process.env.HERDR_ENV = previous;
  }
});

test("Herdr explicit exit schedules once, survives quit, and cancels on reload", async () => {
  const previous = { env: process.env.HERDR_ENV, socket: process.env.HERDR_SOCKET_PATH };
  process.env.HERDR_ENV = "1";
  process.env.HERDR_SOCKET_PATH = "/dev/null";
  const h = harness();
  const targets: any[] = [];
  let cancelled = 0;
  const pane = { pane_id: "w1:p2", tab_id: "w1:t1", workspace_id: "w1" };
  try {
    installExit(h.api, {
      command: () => async () => ({
        pane,
        process_info: { pane_id: pane.pane_id, shell_pid: process.ppid, foreground_processes: [{ pid: process.pid }] },
      }),
      schedule: async (target) => {
        targets.push(target);
        return () => {
          cancelled++;
        };
      },
    });
    h.reset();
    h.activity("draft", true, true);
    await h.commands.get("exit")("", h.ctx);
    expect(targets).toEqual([]);
    h.approve();
    await h.commands.get("exit")("", h.ctx);
    await h.shortcuts.get("ctrl+alt+q")(h.ctx);
    expect(targets).toHaveLength(1);
    expect(targets[0].mode).toBe("explicit-exit");
    expect(targets[0].owned).toBeUndefined();
    expect(h.effects.slice(-2)).toEqual(["shutdown", "abort"]);
    h.events.get("session_shutdown")({ reason: "quit" });
    expect(cancelled).toBe(0);
    h.reset();
    expect(cancelled).toBe(1);
  } finally {
    h.reset();
    if (previous.env === undefined) delete process.env.HERDR_ENV;
    else process.env.HERDR_ENV = previous.env;
    if (previous.socket === undefined) delete process.env.HERDR_SOCKET_PATH;
    else process.env.HERDR_SOCKET_PATH = previous.socket;
  }
});

test("preflight proves current pane and process without manager ownership or history", async () => {
  const pane = { pane_id: "w1:p2", tab_id: "w1:t1", workspace_id: "w1" };
  const command: HerdrCommand = async () => ({
    pane,
    process_info: { pane_id: pane.pane_id, shell_pid: process.ppid, foreground_processes: [{ pid: process.pid }] },
  });
  const row = await exitTarget("/tmp/sample.sock", command);
  expect(row).toMatchObject({ pane: pane.pane_id, mode: "explicit-exit", pid: process.pid, shellPid: process.ppid });
  expect(row.processStart).toBeTruthy();
  expect(row.shellStart).toBeTruthy();
  await expect(exitTarget("/tmp/sample.sock", async () => ({ pane, process_info: {} }))).rejects.toThrow(
    "cannot prove",
  );
  let currents = 0;
  await expect(
    exitTarget("/tmp/sample.sock", async (args) => {
      const result = await command(args);
      if (args[1] === "current" && ++currents > 1) result.pane = { ...pane, pane_id: "w1:p3" };
      return result;
    }),
  ).rejects.toThrow("Current pane changed");
});

test("explicit worker closes history-bearing unowned sessions only after exact Pi exit and original shell checks", async () => {
  const row = {
    mode: "explicit-exit",
    socket: "/tmp/sample.sock",
    pid: 123,
    processStart: "boot:pi",
    pane: "w1:p2",
    tab: "w1:t1",
    workspace: "w1",
    shellPid: 456,
    shellStart: "boot:shell",
    owned: false,
    historyEver: true,
    cleanupSafe: false,
  };
  const tab = { tab_id: row.tab, workspace_id: row.workspace };
  const pane = { pane_id: row.pane, tab_id: row.tab, workspace_id: row.workspace };
  const process_info = {
    pane_id: row.pane,
    shell_pid: row.shellPid,
    foreground_processes: [{ pid: row.shellPid, name: "bash" }],
  };
  const commands: string[][] = [];
  const command = async (args: string[]) => {
    commands.push(args);
    return { tab, pane, process_info };
  };
  const identity = async (pid: number) => {
    if (pid === row.pid) throw Object.assign(new Error("exited"), { code: "ENOENT" });
    return row.shellStart;
  };
  const wait = async () => {};
  expect(await cleanupAfterExit(row, command, identity, wait)).toBe(false);
  expect(commands).toEqual([]);
  expect(await explicitExitAfterExit(row, command, identity, wait)).toBe(true);
  expect(commands.at(-1)).toEqual(["pane", "close", row.pane]);
  expect(commands.some((args) => args[0] === "tab" && args[1] === "close")).toBe(false);
  for (const check of [async () => "boot:replacement", async () => row.processStart]) {
    commands.length = 0;
    expect(await explicitExitAfterExit(row, command, check, wait)).toBe(false);
    expect(commands).toEqual([]);
  }
  commands.length = 0;
  expect(
    await explicitExitAfterExit(
      row,
      command,
      async (pid: number) => (pid === row.shellPid ? "boot:new-shell" : identity(pid)),
      wait,
    ),
  ).toBe(false);
  expect(commands.some((args) => args[1] === "close")).toBe(false);
  expect(
    await explicitExitAfterExit(
      row,
      async () => ({
        tab,
        pane,
        process_info: {
          ...process_info,
          foreground_processes: [...process_info.foreground_processes, { pid: 789, name: "vim" }],
        },
      }),
      identity,
      wait,
    ),
  ).toBe(false);
  let inspections = 0;
  expect(
    await explicitExitAfterExit(
      row,
      async (args: string[]) => {
        if (args[0] === "pane" && args[1] === "get") inspections++;
        return { tab, pane: inspections > 1 ? { ...pane, agent: "replacement" } : pane, process_info };
      },
      identity,
      wait,
    ),
  ).toBe(false);
});
