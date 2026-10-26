import { describe, expect, test } from "bun:test";
import { handlerNamed } from "../../services/sessions/install/handler-named.test-double.ts";
import type { ExitTarget } from "../../types/sessions/exit/exit-target.interface.ts";
import type { HerdrCommand } from "../../types/sessions/herdr/command/herdr-command.interface.ts";
import { exitHarness, installExit } from "./exit.command.test-double.ts";

describe("explicit exit schedules Herdr cleanup", () => {
  test("Herdr explicit exit schedules once, survives quit, and cancels on reload", async () => {
    const previous = { env: process.env.HERDR_ENV, socket: process.env.HERDR_SOCKET_PATH };
    process.env.HERDR_ENV = "1";
    process.env.HERDR_SOCKET_PATH = "/dev/null";
    const h = exitHarness();
    const targets: ExitTarget[] = [];
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
      expect(targets.map((target) => target.mode)).toEqual(["explicit-exit"]);
      expect(targets.map((target) => "owned" in target)).toEqual([false]);
      expect(h.effects.slice(-2)).toEqual(["shutdown", "abort"]);
      handlerNamed(h.events, "session_shutdown")({ reason: "quit" });
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
