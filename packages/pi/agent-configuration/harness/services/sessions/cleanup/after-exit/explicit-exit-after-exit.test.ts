import { describe, expect, test } from "bun:test";
import { MISSING_FILE_CODE } from "../../../../constants/sessions/registry/registry-files.constant.ts";
import type { HerdrCommand } from "../../../../types/sessions/herdr/command/herdr-command.interface.ts";
import { explicitExitAfterExit } from "./explicit-exit-after-exit.service.ts";

describe("explicitExitAfterExit", () => {
  test("explicit worker closes history-bearing unowned sessions only after exact Pi exit and original shell checks", async () => {
    const row = {
      mode: "explicit-exit" as const,
      socket: "/tmp/sample.sock",
      pid: 123,
      processStart: "boot:pi",
      pane: "w1:p2",
      tab: "w1:t1",
      workspace: "w1",
      shellPid: 456,
      shellStart: "boot:shell",
    };
    const tab = { tab_id: row.tab, workspace_id: row.workspace };
    const pane = { pane_id: row.pane, tab_id: row.tab, workspace_id: row.workspace };
    const processInfo = {
      pane_id: row.pane,
      shell_pid: row.shellPid,
      foreground_processes: [{ pid: row.shellPid, name: "bash" }],
    };
    const commands: string[][] = [];
    const command: HerdrCommand = async (args) => {
      commands.push([...args]);
      return { tab, pane, process_info: processInfo };
    };
    const identity = async (pid: number): Promise<string> => {
      if (pid === row.pid) throw Object.assign(new Error("exited"), { code: MISSING_FILE_CODE });
      return row.shellStart;
    };
    const wait = async (): Promise<void> => {};
    expect(await explicitExitAfterExit(row, { command, identity, wait })).toBe(true);
    expect(commands.at(-1)).toEqual(["pane", "close", row.pane]);
    expect(commands.some((args) => args[0] === "tab" && args[1] === "close")).toBe(false);
    for (const check of [async () => "boot:replacement", async () => row.processStart]) {
      commands.length = 0;
      expect(await explicitExitAfterExit(row, { command, identity: check, wait })).toBe(false);
      expect(commands).toEqual([]);
    }
    commands.length = 0;
    const replacedShell = async (pid: number): Promise<string> =>
      pid === row.shellPid ? "boot:new-shell" : identity(pid);
    expect(await explicitExitAfterExit(row, { command, identity: replacedShell, wait })).toBe(false);
    expect(commands.some((args) => args[1] === "close")).toBe(false);
    const foreignProcess: HerdrCommand = async () => ({
      tab,
      pane,
      process_info: {
        ...processInfo,
        foreground_processes: [...processInfo.foreground_processes, { pid: 789, name: "vim" }],
      },
    });
    expect(await explicitExitAfterExit(row, { command: foreignProcess, identity, wait })).toBe(false);
    let inspections = 0;
    const replacedPane: HerdrCommand = async (args) => {
      if (args[0] === "pane" && args[1] === "get") inspections++;
      return { tab, pane: inspections > 1 ? { ...pane, agent: "replacement" } : pane, process_info: processInfo };
    };
    expect(await explicitExitAfterExit(row, { command: replacedPane, identity, wait })).toBe(false);
  });
});
