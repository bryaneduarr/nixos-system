import { describe, expect, test } from "bun:test";
import { sessionStatus } from "./session-status.service.ts";

describe("sessionStatus", () => {
  test("working takes priority over an editor draft", () => {
    expect(sessionStatus(true, "draft")).toBe("working");
    expect(sessionStatus(false, " ")).toBe("draft");
    expect(sessionStatus(false, "")).toBe("idle");
  });
});
