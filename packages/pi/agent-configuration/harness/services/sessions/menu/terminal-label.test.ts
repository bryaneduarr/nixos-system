import { describe, expect, test } from "bun:test";
import { terminalLabel } from "./terminal-label.service.ts";

describe("terminalLabel", () => {
  test("terminal labels cannot inject terminal control sequences", () => {
    const label = terminalLabel("project\x1b[2J\nname");
    expect(label).not.toContain("\x1b");
    expect(label).not.toContain("\n");
  });
});
