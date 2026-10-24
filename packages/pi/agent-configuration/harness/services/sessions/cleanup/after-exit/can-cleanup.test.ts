import { describe, expect, test } from "bun:test";
import type { CleanupContext } from "../../../../types/sessions/cleanup/after-exit/cleanup-context.interface.ts";
import type { LiveSession } from "../../../../types/sessions/registry/row/live-session.interface.ts";
import { canCleanup } from "./can-cleanup.service.ts";

function session(overrides: Partial<LiveSession> = {}): LiveSession {
  return {
    identity: "00000000-0000-4000-8000-000000000001",
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
    ...overrides,
  };
}

function idleContext(overrides: Partial<CleanupContext> = {}): CleanupContext {
  return {
    signal: undefined,
    isIdle: () => true,
    hasPendingMessages: () => false,
    ui: { getEditorText: () => "" },
    ...overrides,
  };
}

describe("canCleanup", () => {
  test("cleanup requires owned untouched empty idle sessions and all activity guards", () => {
    const row = session({ owned: true });
    const ctx = idleContext();
    expect(canCleanup(row, ctx, false, false)).toBe(true);
    for (const override of [{ owned: false }, { historyEver: true }])
      expect(canCleanup({ ...row, ...override }, ctx, false, false)).toBe(false);
    expect(canCleanup(row, ctx, true, false)).toBe(false);
    expect(canCleanup(row, ctx, false, true)).toBe(false);
    expect(canCleanup(row, idleContext({ signal: new AbortController().signal }), false, false)).toBe(false);
    expect(canCleanup(row, idleContext({ isIdle: () => false }), false, false)).toBe(false);
    expect(canCleanup(row, idleContext({ hasPendingMessages: () => true }), false, false)).toBe(false);
    expect(canCleanup(row, idleContext({ ui: { getEditorText: () => "/tmp/attached-image.png" } }), false, false)).toBe(
      false,
    );
  });
});
