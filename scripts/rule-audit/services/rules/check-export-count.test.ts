import { describe, expect, test } from "bun:test";
import { readSourceLines } from "../source/read-source-lines.service.ts";
import { checkExportCount } from "./check-export-count.service.ts";
import { checkInterfaceCount } from "./check-interface-count.service.ts";

const TWO_FUNCTIONS = "export function first(): void {}\nexport function second(): void {}\n";
const TWO_INTERFACES = "export interface First {}\nexport interface Second {}\n";

describe("checkExportCount", () => {
  test("reports a second export in a service or store file", () => {
    expect(checkExportCount("read-rows.service.ts", readSourceLines(TWO_FUNCTIONS))).toEqual([
      { file: "read-rows.service.ts", line: 2, rule: "multi-export" },
    ]);
    expect(checkExportCount("activity.store.ts", readSourceLines(TWO_FUNCTIONS))).toHaveLength(1);
  });

  test("allows one export and other roles", () => {
    expect(checkExportCount("read-rows.service.ts", readSourceLines("export function first(): void {}\n"))).toEqual([]);
    expect(checkExportCount("limits.constant.ts", readSourceLines(TWO_FUNCTIONS))).toEqual([]);
  });
});

describe("checkInterfaceCount", () => {
  test("reports a second interface in an interface file", () => {
    expect(checkInterfaceCount("row.interface.ts", readSourceLines(TWO_INTERFACES))).toEqual([
      { file: "row.interface.ts", line: 2, rule: "multi-interface-file" },
    ]);
  });

  test("allows one interface with derived types", () => {
    const source = "export interface Row {}\nexport type RowKind = Row['kind'];\n";
    expect(checkInterfaceCount("row.interface.ts", readSourceLines(source))).toEqual([]);
  });
});
