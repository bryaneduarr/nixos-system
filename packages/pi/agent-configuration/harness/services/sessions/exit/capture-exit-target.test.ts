import { describe, expect, test } from "bun:test";
import type { HerdrCommand } from "../../../types/sessions/herdr/command/herdr-command.interface.ts";
import { captureExitTarget } from "./capture-exit-target.service.ts";

describe("captureExitTarget", () => {
  test("preflight proves current pane and process without manager ownership or history", async () => {
    const pane = { pane_id: "w1:p2", tab_id: "w1:t1", workspace_id: "w1" };
    const command: HerdrCommand = async () => ({
      pane,
      process_info: { pane_id: pane.pane_id, shell_pid: process.ppid, foreground_processes: [{ pid: process.pid }] },
    });
    const target = await captureExitTarget("/tmp/sample.sock", command);
    expect(target).toMatchObject({
      pane: pane.pane_id,
      mode: "explicit-exit",
      pid: process.pid,
      shellPid: process.ppid,
    });
    expect(target.processStart).toBeTruthy();
    expect(target.shellStart).toBeTruthy();
    await expect(captureExitTarget("/tmp/sample.sock", async () => ({ pane, process_info: {} }))).rejects.toThrow(
      "cannot prove",
    );
    let currents = 0;
    await expect(
      captureExitTarget("/tmp/sample.sock", async (args) => {
        const result = await command(args);
        if (args[1] === "current" && ++currents > 1) return { ...result, pane: { ...pane, pane_id: "w1:p3" } };
        return result;
      }),
    ).rejects.toThrow("Current pane changed");
  });
});
