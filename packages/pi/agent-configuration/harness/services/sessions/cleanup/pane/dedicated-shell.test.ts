import { describe, expect, test } from "bun:test";
import { dedicatedShell } from "./dedicated-shell.service.ts";
import { createShellPane, shellTarget } from "./dedicated-shell.test-double.ts";

describe("dedicatedShell", () => {
  test("a pane is dedicated only when it hosts exactly one unmodified shell", () => {
    const { tab, pane, processInfo } = createShellPane();
    expect(dedicatedShell(shellTarget, { tab, pane, processInfo })).toBe(true);
    expect(dedicatedShell(shellTarget, { tab: { ...tab, pane_count: 2 }, pane, processInfo })).toBe(true);
    expect(dedicatedShell(shellTarget, { tab, pane: { ...pane, agent: "replacement" }, processInfo })).toBe(false);
    const foreignForeground = { ...processInfo, foreground_processes: [{ pid: 4322, name: "bash" }] };
    expect(dedicatedShell(shellTarget, { tab, pane, processInfo: foreignForeground })).toBe(false);
  });
});
