import { describe, expect, test } from "bun:test";
import { readSourceLines } from "../source/read-source-lines.service.ts";
import { checkFileLength } from "./check-file-length.service.ts";
import { findFunctionComments } from "./find-function-comments.service.ts";
import { findLinePatternFindings } from "./find-line-pattern-findings.service.ts";

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

  test("leave ternaries alone", () => {
    expect(rulesFound("const label = ready ? first : second;")).toEqual([]);
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
