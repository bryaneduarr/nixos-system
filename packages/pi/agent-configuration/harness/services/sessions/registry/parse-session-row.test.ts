import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { paneIdentity } from "../herdr/pane-identity.service.ts";
import { parseSessionRow } from "./parse-session-row.service.ts";

function session() {
  return {
    identity: randomUUID(),
    pid: process.pid,
    processStart: "boot:start",
    updatedAt: Date.now(),
    cwd: "/tmp/sample-project",
    pane: "w2:p3",
    tab: "w2:t2",
    workspace: "w2",
    sessionId: "session-a",
    name: "test",
    branch: "main",
    context: { usageState: "unavailable" },
    status: "idle",
    owned: false,
    historyEver: false,
    cleanupSafe: false,
  };
}

describe("parseSessionRow", () => {
  test("invalid registry records cannot become focus targets", () => {
    expect(parseSessionRow({ ...session(), pane: "--current" }).valid).toBe(false);
    expect(parseSessionRow({ ...session(), pid: -1 }).valid).toBe(false);
    expect(
      parseSessionRow({
        ...session(),
        context: { usageState: "measured", tokens: 1, percent: "20", contextWindow: 10 },
      }).valid,
    ).toBe(false);
    expect(parseSessionRow({ ...session(), cleanupSafe: undefined }).valid).toBe(false);
    expect(() => paneIdentity({ pane_id: "--current" })).toThrow();
  });
});
