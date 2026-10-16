import { describe, expect, test } from "bun:test";
import { formatSearchResult } from "./format-search-result.service.ts";

describe("formatSearchResult", () => {
  test("separates definitions, tests, and references", () => {
    const output = formatSearchResult(
      "sample",
      "auto",
      ["src/sample.ts"],
      [{ file: "tests/sample.test.ts", line: 4, text: "sample" }],
      [{ file: "src/sample.ts", line: 8, text: "sample" }],
      10,
      [{ file: "src/sample.ts", line: 2, text: "function sample()" }],
    );
    expect(output).toContain("Definition:\nsrc/sample.ts:2");
    expect(output).toContain("Files:\nsrc/sample.ts");
    expect(output).toContain("Tests:\ntests/sample.test.ts");
    expect(output).toContain("References:\nsrc/sample.ts:8");
  });

  test("reports omitted matches", () => {
    const output = formatSearchResult("sample", "text", ["one.ts", "two.ts"], [], [], 1);
    expect(output).toContain("Additional matches omitted: 1");
  });
});
