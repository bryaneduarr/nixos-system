import { describe, expect, test } from "bun:test";
import { sanitizeCardText } from "./sanitize-card-text.service.ts";

describe("sanitizeCardText", () => {
  test("replaces escape, carriage return, tab, NUL, DEL and C1 controls with one space each", () => {
    expect(sanitizeCardText("a\u001b[2Jb")).toBe("a [2Jb");
    expect(sanitizeCardText("a\rb\tc\u0000d\u007fe\u0085f\u009fg")).toBe("a b c d e f g");
  });

  test("collapses runs of whitespace and trims both ends", () => {
    expect(sanitizeCardText("  one \n\n two\t\t three  ")).toBe("one two three");
  });

  test("returns an empty string when only controls and whitespace remain", () => {
    expect(sanitizeCardText("\r\n\t\u001b")).toBe("");
  });

  test("keeps printable text, including non-ASCII letters and emoji", () => {
    expect(sanitizeCardText("café 🙂 ok")).toBe("café 🙂 ok");
  });
});
