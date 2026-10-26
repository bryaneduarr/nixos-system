import { describe, expect, test } from "bun:test";
import { readSourceLines } from "../source/read-source-lines.service.ts";
import { checkFileLength } from "./check-file-length.service.ts";
import { findFunctionComments } from "./find-function-comments.service.ts";
import { findLinePatternFindings } from "./find-line-pattern-findings.service.ts";
import { findPlainBlockComments } from "./find-plain-block-comments.service.ts";

const FILE = "example.ts";

function rulesFound(sourceText: string): readonly string[] {
  return findLinePatternFindings(FILE, readSourceLines(sourceText)).map((finding) => finding.rule);
}

describe("line pattern rules", () => {
  test("report nullable unions, optional chaining, and optional properties", () => {
    expect(rulesFound("let name: string | undefined;")).toEqual(["nullable-union"]);
    expect(rulesFound("const id = entry?.id;")).toEqual(["optional-chaining"]);
    expect(rulesFound("interface Row { label?: string }")).toEqual(["optional-property"]);
  });

  test("report casts but not `as const` or import renames", () => {
    expect(rulesFound("const row = value as Row;")).toEqual(["type-assertion"]);
    expect(rulesFound("const NAMES = ['a'] as const;")).toEqual([]);
    expect(rulesFound('import { first as second } from "./module.ts";')).toEqual([]);
  });

  test("ignore patterns inside strings and comments", () => {
    expect(rulesFound('const help = "use a?.b or x as Y"; // c | undefined')).toEqual([]);
  });

  test("leave logical operators with undefined or null alone", () => {
    expect(rulesFound("const home = undefined || fallback;")).toEqual([]);
    expect(rulesFound("const ready = value === null || waiting;")).toEqual([]);
  });

  test("leave ternaries alone", () => {
    expect(rulesFound("const label = ready ? first : second;")).toEqual([]);
  });
});

describe("fabricated defaults", () => {
  test("report empty strings and zero used as absence", () => {
    expect(rulesFound('const text = lines[index] ?? "";')).toEqual(["fabricated-default"]);
    expect(rulesFound("const code = character.codePointAt(0) ?? 0;")).toEqual(["fabricated-default"]);
    expect(rulesFound('const home = process.env.HOME || "";')).toEqual(["fabricated-default"]);
    expect(rulesFound('return unit === undefined ? "" : unit.text;')).toEqual(["fabricated-default"]);
    expect(rulesFound("return unit !== undefined ? unit.start : 0;")).toEqual(["fabricated-default"]);
    expect(rulesFound('const [first = ""] = parts;')).toEqual(["fabricated-default"]);
  });

  test("allow real empty collections, other fallbacks, and ordinary ternaries", () => {
    expect(rulesFound("const runs = text.match(pattern) ?? [];")).toEqual([]);
    expect(rulesFound("const label = names.at(0) ?? fallbackLabel;")).toEqual([]);
    expect(rulesFound("const half = ratio > 0.5 ? 0 : 1;")).toEqual([]);
    expect(rulesFound("const scale = value || 0.5;")).toEqual([]);
  });
});

describe("definite assignment", () => {
  test("report a binding declared with an exclamation mark", () => {
    expect(rulesFound("let release!: () => void;")).toEqual(["definite-assignment"]);
    expect(rulesFound("const ready = value !== other;")).toEqual([]);
  });
});

describe("function comments", () => {
  test("report a comment directly above a function", () => {
    const lines = readSourceLines("/** Reads things. */\nexport function readThings(): void {}\n");
    expect(findFunctionComments(FILE, lines)).toEqual([{ file: FILE, line: 2, rule: "function-comment" }]);
  });

  test("allow comments above interfaces", () => {
    const lines = readSourceLines("/* A row. */\nexport interface Row {}\n");
    expect(findFunctionComments(FILE, lines)).toEqual([]);
  });
});

describe("file length", () => {
  test("report files longer than the limit only", () => {
    expect(checkFileLength(FILE, readSourceLines("line\n".repeat(150)))).toEqual([]);
    expect(checkFileLength(FILE, readSourceLines("line\n".repeat(151)))).toEqual([
      { file: FILE, line: 0, rule: "file-length" },
    ]);
  });
});

describe("plain block comments", () => {
  test("report block comments that are not JSDoc", () => {
    expect(findPlainBlockComments(FILE, readSourceLines("/* A row. */\nconst row = 1;\n"))).toEqual([
      { file: FILE, line: 1, rule: "plain-block-comment" },
    ]);
    expect(findPlainBlockComments(FILE, readSourceLines("/** A row. */\nconst row = 1;\n"))).toEqual([]);
  });
});
