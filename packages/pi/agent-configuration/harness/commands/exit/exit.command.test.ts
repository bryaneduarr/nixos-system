import { describe, expect, test } from "bun:test";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { installExitEvents } from "../../services/sessions/events/install-exit-events.service.ts";
import type { ExitDependencies } from "../../types/sessions/exit/exit-dependencies.interface.ts";
import type { HerdrCommand } from "../../types/sessions/herdr/herdr-command.interface.ts";
import { installExitCommand } from "./exit.command.ts";

type EventHandler = (event: unknown, ctx: ExtensionContext) => unknown;
type CommandHandler = (args: string, ctx: ExtensionContext) => Promise<void>;
type ShortcutHandler = (ctx: ExtensionContext) => Promise<void>;

function handlerNamed<T>(handlers: Map<string, T>, name: string): T {
  const handler = handlers.get(name);
  if (handler === undefined) throw new Error(`Missing handler ${name}`);
  return handler;
}

function installExit(api: ExtensionAPI, dependencies: ExitDependencies): void {
  installExitEvents(api);
  installExitCommand(api, dependencies);
}

function harness() {
  const commands = new Map<string, CommandHandler>();
  const shortcuts = new Map<string, ShortcutHandler>();
  const events = new Map<string, EventHandler>();
  const notifications: string[] = [];
  const effects: string[] = [];
  let approve = false;
  let draft = "";
  let idle = true;
  let pending = false;
  let confirm = async (_title: string, text: string): Promise<boolean> => {
    effects.push(text);
    return approve;
  };
  const ctx = {
    mode: "tui",
    isIdle: () => idle,
    hasPendingMessages: () => pending,
    shutdown: () => effects.push("shutdown"),
    abort: () => effects.push("abort"),
    ui: {
      getEditorText: () => draft,
      confirm: (title: string, text: string) => confirm(title, text),
      notify: (message: string) => notifications.push(message),
    },
  } as unknown as ExtensionContext; // Test double implements only the members the exit command reads.
  const api = {
    on: (name: string, handler: EventHandler) => events.set(name, handler),
    registerCommand: (name: string, spec: { handler: CommandHandler }) => commands.set(name, spec.handler),
    registerShortcut: (name: string, spec: { handler: ShortcutHandler }) => shortcuts.set(name, spec.handler),
  } as unknown as ExtensionAPI; // Test double implements only the registration methods the exit command uses.
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
    setConfirm: (replacement: typeof confirm) => {
      confirm = replacement;
    },
    activity: (text: string, busy: boolean, queued: boolean) => {
      draft = text;
      idle = !busy;
      pending = queued;
    },
    reset: () => handlerNamed(events, "session_shutdown")({ reason: "reload" }, ctx),
  };
}

describe("explicit exit command", () => {
  test("explicit exit confirms busy work, pending messages and drafts, cancellation has no effects", async () => {
    const previous = process.env.HERDR_ENV;
    delete process.env.HERDR_ENV;
    const h = harness();
    try {
      installExit(h.api, { command: () => async () => ({}), schedule: async () => () => {} });
      h.reset();
      h.activity("draft", true, true);
      await handlerNamed(h.commands, "exit")("", h.ctx);
      expect(h.effects).toHaveLength(1);
      expect(h.effects[0]).toContain("active work, pending messages, the editor draft");
      h.approve();
      await handlerNamed(h.shortcuts, "ctrl+alt+q")(h.ctx);
      expect(h.effects.slice(-2)).toEqual(["shutdown", "abort"]);
      const count = h.effects.length;
      await handlerNamed(h.commands, "exit")("", h.ctx);
      installExit(h.api, { command: () => async () => ({}), schedule: async () => () => {} });
      await handlerNamed(h.shortcuts, "ctrl+alt+q")(h.ctx);
      expect(h.effects).toHaveLength(count);
    } finally {
      h.reset();
      if (previous === undefined) delete process.env.HERDR_ENV;
      else process.env.HERDR_ENV = previous;
    }
  });

  test("reload while confirming prevents stale context shutdown", async () => {
    const h = harness();
    installExit(h.api, { command: () => async () => ({}), schedule: async () => () => {} });
    h.reset();
    h.activity("draft", false, false);
    let resolve: (value: boolean) => void = () => {};
    h.setConfirm(
      () =>
        new Promise<boolean>((done) => {
          resolve = done;
        }),
    );
    const attempt = handlerNamed(h.commands, "exit")("", h.ctx);
    await handlerNamed(h.shortcuts, "ctrl+alt+q")(h.ctx);
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
      await handlerNamed(h.commands, "exit")("", h.ctx);
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
    const targets: { mode: string; owned?: boolean }[] = [];
    let cancelled = 0;
    const pane = { pane_id: "w1:p2", tab_id: "w1:t1", workspace_id: "w1" };
    const command: HerdrCommand = async () => ({
      pane,
      process_info: { pane_id: pane.pane_id, shell_pid: process.ppid, foreground_processes: [{ pid: process.pid }] },
    });
    try {
      installExit(h.api, {
        command: () => command,
        schedule: async (target) => {
          targets.push(target);
          return () => {
            cancelled++;
          };
        },
      });
      h.reset();
      h.activity("draft", true, true);
      await handlerNamed(h.commands, "exit")("", h.ctx);
      expect(targets).toEqual([]);
      h.approve();
      await handlerNamed(h.commands, "exit")("", h.ctx);
      await handlerNamed(h.shortcuts, "ctrl+alt+q")(h.ctx);
      expect(targets).toHaveLength(1);
      expect(targets[0]?.mode).toBe("explicit-exit");
      expect(targets[0]?.owned).toBeUndefined();
      expect(h.effects.slice(-2)).toEqual(["shutdown", "abort"]);
      handlerNamed(h.events, "session_shutdown")({ reason: "quit" }, h.ctx);
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
});
