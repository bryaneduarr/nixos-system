import { describe, expect, test } from "bun:test";
import { paneIdentity } from "../../herdr/pane/pane-identity.service.ts";
import { createLiveSession } from "./live-session.test-double.ts";
import { parseSessionRow } from "./parse-session-row.service.ts";

describe("parseSessionRow", () => {
  test("invalid registry records cannot become focus targets", () => {
    expect(parseSessionRow({ ...createLiveSession(), pane: "--current" }).valid).toBe(false);
    expect(parseSessionRow({ ...createLiveSession(), pid: -1 }).valid).toBe(false);
    expect(
      parseSessionRow({
        ...createLiveSession(),
        context: { usageState: "measured", tokens: 1, percent: "20", contextWindow: 10 },
      }).valid,
    ).toBe(false);
    expect(parseSessionRow({ ...createLiveSession(), cleanupSafe: undefined }).valid).toBe(false);
    expect(() => paneIdentity({ pane_id: "--current" })).toThrow();
  });
});
