import { describe, expect, test } from "bun:test";
import { truncateText } from "./truncate-text.service.ts";

describe("truncateText", () => {
  test("returns text that fits unchanged", () => {
    expect(truncateText("Session", 7)).toBe("Session");
  });

  test("ends a truncated text with an ellipsis within the width", () => {
    expect(truncateText("Opus weekly", 8)).toBe("Opus we…");
    expect(truncateText("abc", 1)).toBe("…");
  });

  test("returns an empty string for width 0 or less", () => {
    expect(truncateText("Session", 0)).toBe("");
    expect(truncateText("Session", -3)).toBe("");
    expect(truncateText("", 0)).toBe("");
  });

  test("never splits a surrogate pair", () => {
    expect(truncateText("🙂🙂🙂", 2)).toBe("🙂…");
  });
});
