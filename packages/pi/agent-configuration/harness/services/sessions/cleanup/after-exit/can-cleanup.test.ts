import { describe, expect, test } from "bun:test";
import type { CleanupContext } from "../../../../types/sessions/cleanup/after-exit/cleanup-context.interface.ts";
import { createLiveSession } from "../../registry/row/live-session.test-double.ts";
import { canCleanup } from "./can-cleanup.service.ts";

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
    const row = createLiveSession({ owned: true });
    const ctx = idleContext();
    const check = { row, ctx, compacting: false, userBash: false };
    expect(canCleanup(check)).toBe(true);
    for (const override of [{ owned: false }, { historyEver: true }])
      expect(canCleanup({ ...check, row: { ...row, ...override } })).toBe(false);
    expect(canCleanup({ ...check, compacting: true })).toBe(false);
    expect(canCleanup({ ...check, userBash: true })).toBe(false);
    expect(canCleanup({ ...check, ctx: idleContext({ signal: new AbortController().signal }) })).toBe(false);
    expect(canCleanup({ ...check, ctx: idleContext({ isIdle: () => false }) })).toBe(false);
    expect(canCleanup({ ...check, ctx: idleContext({ hasPendingMessages: () => true }) })).toBe(false);
    const draftContext = idleContext({ ui: { getEditorText: () => "/tmp/attached-image.png" } });
    expect(canCleanup({ ...check, ctx: draftContext })).toBe(false);
  });
});
