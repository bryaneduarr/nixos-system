import { describe, expect, test } from "bun:test";
import type { PaneCloseTarget } from "../../../types/sessions/cleanup/pane-close-target.interface.ts";
import type { HerdrCommand } from "../../../types/sessions/herdr/herdr-command.interface.ts";
import { cleanupAfterExit } from "./cleanup-after-exit.service.ts";
import { dedicatedShell } from "./dedicated-shell.service.ts";

const row = {
  owned: true,
  historyEver: false,
  cleanupSafe: true,
  processStart: "boot:123",
  pid: 123,
  socket: "/tmp/test-herdr.sock",
  pane: "w2:p3",
  tab: "w2:t2",
  workspace: "w2",
};

const shellTarget: PaneCloseTarget = {
  pid: row.pid,
  processStart: row.processStart,
  pane: row.pane,
  tab: row.tab,
  workspace: row.workspace,
  shell: { required: false },
};

describe("dedicatedShell", () => {
  test("a pane is dedicated only when it hosts exactly one unmodified shell", () => {
    const tab = { tab_id: row.tab, workspace_id: row.workspace, pane_count: 2 };
    const pane = { pane_id: row.pane, tab_id: row.tab, workspace_id: row.workspace, agent: null, agent_status: "idle" };
    const processInfo = { pane_id: row.pane, shell_pid: 4321, foreground_processes: [{ pid: 4321, name: "bash" }] };
    expect(dedicatedShell(shellTarget, tab, pane, processInfo)).toBe(true);
    expect(dedicatedShell(shellTarget, { ...tab, pane_count: 2 }, pane, processInfo)).toBe(true);
    expect(dedicatedShell(shellTarget, tab, { ...pane, agent: "replacement" }, processInfo)).toBe(false);
    expect(
      dedicatedShell(shellTarget, tab, pane, { ...processInfo, foreground_processes: [{ pid: 4322, name: "bash" }] }),
    ).toBe(false);
  });
});

describe("cleanupAfterExit", () => {
  test("detached cleanup closes only the exact shell pane after the original process exits", async () => {
    const tab = { tab_id: row.tab, workspace_id: row.workspace, pane_count: 2 };
    const pane = { pane_id: row.pane, tab_id: row.tab, workspace_id: row.workspace, agent: null, agent_status: "idle" };
    const processInfo = { pane_id: row.pane, shell_pid: 4321, foreground_processes: [{ pid: 4321, name: "bash" }] };
    const commands: string[][] = [];
    const command: HerdrCommand = async (args) => {
      commands.push(args);
      return { tab, pane, process_info: processInfo };
    };
    const exited = async (): Promise<string> => {
      throw Object.assign(new Error("gone"), { code: "ENOENT" });
    };
    const noWait = async (): Promise<void> => {};
    expect(await cleanupAfterExit(row, command, exited, noWait)).toBe(true);
    expect(commands.at(-1)).toEqual(["pane", "close", row.pane]);
    expect(commands.some((args) => args[0] === "tab" && args[1] === "close")).toBe(false);
    commands.length = 0;
    expect(await cleanupAfterExit(row, command, async () => "boot:replacement", noWait)).toBe(false);
    expect(commands).toEqual([]);
    expect(await cleanupAfterExit({ ...row, historyEver: true }, command, exited, noWait)).toBe(false);
    let inspections = 0;
    const replaced: HerdrCommand = async (args) => {
      commands.push(args);
      if (args[0] === "pane" && args[1] === "get") inspections++;
      return { tab, pane: inspections > 1 ? { ...pane, agent: "pi" } : pane, process_info: processInfo };
    };
    commands.length = 0;
    expect(await cleanupAfterExit(row, replaced, exited, noWait)).toBe(false);
    expect(commands.some((args) => args[1] === "close")).toBe(false);
  });
});
