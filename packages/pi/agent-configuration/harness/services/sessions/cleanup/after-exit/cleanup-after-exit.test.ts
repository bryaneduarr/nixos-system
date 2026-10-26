import { describe, expect, test } from "bun:test";
import { MISSING_FILE_CODE } from "../../../../constants/sessions/registry/registry-files.constant.ts";
import type { HerdrCommand } from "../../../../types/sessions/herdr/command/herdr-command.interface.ts";
import { createShellPane, cleanupRow as row } from "../pane/dedicated-shell.test-double.ts";
import { cleanupAfterExit } from "./cleanup-after-exit.service.ts";

describe("cleanupAfterExit", () => {
  test("detached cleanup closes only the exact shell pane after the original process exits", async () => {
    const { tab, pane, processInfo } = createShellPane();
    const commands: string[][] = [];
    const command: HerdrCommand = async (args) => {
      commands.push([...args]);
      return { tab, pane, process_info: processInfo };
    };
    const exited = async (): Promise<string> => {
      throw Object.assign(new Error("gone"), { code: MISSING_FILE_CODE });
    };
    const noWait = async (): Promise<void> => {};
    expect(await cleanupAfterExit(row, { command, identity: exited, wait: noWait })).toBe(true);
    expect(commands.at(-1)).toEqual(["pane", "close", row.pane]);
    expect(commands.some((args) => args[0] === "tab" && args[1] === "close")).toBe(false);
    commands.length = 0;
    expect(await cleanupAfterExit(row, { command, identity: async () => "boot:replacement", wait: noWait })).toBe(
      false,
    );
    expect(commands).toEqual([]);
    expect(await cleanupAfterExit({ ...row, historyEver: true }, { command, identity: exited, wait: noWait })).toBe(
      false,
    );
    let inspections = 0;
    const replaced: HerdrCommand = async (args) => {
      commands.push([...args]);
      if (args[0] === "pane" && args[1] === "get") inspections++;
      return { tab, pane: inspections > 1 ? { ...pane, agent: "pi" } : pane, process_info: processInfo };
    };
    commands.length = 0;
    expect(await cleanupAfterExit(row, { command: replaced, identity: exited, wait: noWait })).toBe(false);
    expect(commands.some((args) => args[1] === "close")).toBe(false);
  });
});
