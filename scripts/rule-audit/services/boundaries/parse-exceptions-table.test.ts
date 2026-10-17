import { describe, expect, test } from "bun:test";
import { parseExceptionsTable } from "./parse-exceptions-table.service.ts";

const RULE_FILE = [
  "# Rules",
  "",
  "## Exceptions",
  "",
  "| File | Rule | Reason |",
  "| --- | --- | --- |",
  "| `boundary.ts` | `nullable-union` | Pi value. |",
  "",
  "## Other",
  "| `ignored.ts` | `type-assertion` | Outside the section. |",
].join("\n");

describe("parseExceptionsTable", () => {
  test("reads rows of the exceptions section only", () => {
    expect(parseExceptionsTable(RULE_FILE)).toEqual([
      { file: "boundary.ts", rule: "nullable-union", reason: "Pi value." },
    ]);
  });

  test("returns no rows without an exceptions section", () => {
    expect(parseExceptionsTable("# Rules\n")).toEqual([]);
  });
});
