import { describe, expect, test } from "bun:test";
import { readSourceLines } from "../source/read-source-lines.service.ts";
import { findUncheckedDefaults } from "./find-unchecked-defaults.service.ts";

const FILE = "example.ts";

describe("findUncheckedDefaults", () => {
  test("reports a default that returns a value without proving exhaustiveness", () => {
    const lines = readSourceLines("switch (kind) {\n  case 'a':\n    return 1;\n  default:\n    return 2;\n}\n");
    expect(findUncheckedDefaults(FILE, lines)).toEqual([{ file: FILE, line: 4, rule: "unchecked-default" }]);
  });

  test("accepts both never-check styles", () => {
    const satisfiesStyle = readSourceLines("switch (kind) {\n  default:\n    return kind satisfies never;\n}\n");
    const declarationStyle = readSourceLines(
      "switch (kind) {\n  default: {\n    const rest: never = kind;\n    return rest;\n  }\n}\n",
    );
    expect(findUncheckedDefaults(FILE, satisfiesStyle)).toEqual([]);
    expect(findUncheckedDefaults(FILE, declarationStyle)).toEqual([]);
  });
});
