import { describe, expect, test } from "bun:test";
import { canReportSession } from "./can-report-session.service.ts";

describe("canReportSession", () => {
  test("print, RPC and JSON subagents never report as interactive sessions", () => {
    expect(canReportSession("tui", true)).toBe(true);
    for (const mode of ["print", "rpc", "json"]) expect(canReportSession(mode, true)).toBe(false);
    expect(canReportSession("tui", false)).toBe(false);
  });
});
