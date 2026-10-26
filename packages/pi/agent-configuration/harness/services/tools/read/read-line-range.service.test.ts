import { describe, expect, test } from "bun:test";
import { MAX_READ_CHARS } from "../../../constants/tools/read/read-limits.constant.ts";
import { readLineRange } from "./read-line-range.service.ts";

const LONG_LINE_LENGTH = 1_000;

function sampleFile(lines: readonly string[]) {
  return { displayPath: "sample.ts", absolutePath: "/sample.ts", content: lines.join("\n"), lines };
}

describe("readLineRange", () => {
  test("returns the requested range when it fits the budget", () => {
    const output = readLineRange(sampleFile(["one", "two", "three"]), 1, 3);
    expect(output).toBe("sample.ts (lines 1-3 of 3)\n\n1: one\n2: two\n3: three");
  });

  test("stops at a whole line and points to the next offset when the budget is exceeded", () => {
    const lineCount = Math.ceil((MAX_READ_CHARS * 2) / LONG_LINE_LENGTH);
    const lines = Array.from({ length: lineCount }, () => "x".repeat(LONG_LINE_LENGTH));
    const output = readLineRange(sampleFile(lines), 1, lineCount);
    const shownLines = Math.floor(MAX_READ_CHARS / (LONG_LINE_LENGTH + 1));
    expect(output).toStartWith(`sample.ts (lines 1-${shownLines} of ${lineCount})`);
    expect(output).toEndWith(`Use read with offset=${shownLines + 1} to continue.]`);
  });
});
