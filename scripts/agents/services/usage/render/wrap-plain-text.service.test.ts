import { describe, expect, test } from "bun:test";
import { measureVisibleLength } from "./measure-visible-length.service.ts";
import { wrapPlainText } from "./wrap-plain-text.service.ts";

const longUrl = "https://example.com/a/very/long/path";

describe("wrapPlainText", () => {
  test("wraps words greedily within the width", () => {
    expect(wrapPlainText("one two three", 7)).toEqual(["one two", "three"]);
  });

  test("hard-splits a single word longer than the width into lines no wider than the width", () => {
    const lines = wrapPlainText(longUrl, 10);
    expect(lines.join("")).toBe(longUrl);
    expect(Math.max(...lines.map(measureVisibleLength))).toBeLessThanOrEqual(10);
  });

  test("uses one column per line when the width is 0 or less", () => {
    expect(wrapPlainText("abc", 0)).toEqual(["a", "b", "c"]);
    expect(wrapPlainText("ab cd", -2)).toEqual(["a", "b", "c", "d"]);
  });

  test("never splits a surrogate pair when hard-splitting", () => {
    expect(wrapPlainText("🙂🙂🙂", 2)).toEqual(["🙂🙂", "🙂"]);
  });

  test("returns no lines for empty text", () => {
    expect(wrapPlainText("", 10)).toEqual([]);
  });
});
