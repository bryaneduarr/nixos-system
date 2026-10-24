import { describe, expect, test } from "bun:test";
import { readSourceLines } from "../../source/read-source-lines.service.ts";
import { findPositionalParameters } from "./find-positional-parameters.service.ts";

const FILE = "example.ts";

function linesReported(sourceText: string): readonly number[] {
  return findPositionalParameters(FILE, readSourceLines(sourceText)).map((finding) => finding.line);
}

describe("findPositionalParameters", () => {
  test("reports declarations and arrow functions with more than three parameters", () => {
    expect(linesReported("function build(a: string, b: string, c: string, d: string): void {}")).toEqual([1]);
    expect(
      linesReported("const x = 1;\nconst build = (a: number, b: number, c: number, d: number): number => a;"),
    ).toEqual([2]);
  });

  test("allows three parameters and one parameter object", () => {
    expect(linesReported("function build(a: string, b: string, c: string): void {}")).toEqual([]);
    expect(linesReported("function build({ a, b, c, d }: Parts): void {}")).toEqual([]);
  });

  test("counts only top-level commas in generics and function types", () => {
    expect(
      linesReported(
        "function build(a: Map<string, number>, b: (x: number, y: number) => void, c: [string, string]): void {}",
      ),
    ).toEqual([]);
  });

  test("ignores calls with many arguments", () => {
    expect(linesReported("call(a, b, c, d, e);")).toEqual([]);
  });

  test("reports multi-line parameter lists on the line of the opening parenthesis", () => {
    expect(
      linesReported("export function build(\n  a: string,\n  b: string,\n  c: string,\n  d: string,\n): void {}"),
    ).toEqual([1]);
  });
});
