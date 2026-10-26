import { describe, expect, test } from "bun:test";
import type { AuditedFile } from "../../types/source/audited-file.interface.ts";
import { readSourceLines } from "../source/read-source-lines.service.ts";
import { checkConstantsFolderSize } from "./check-constants-folder-size.service.ts";
import { findDuplicateConstants } from "./find-duplicate-constants.service.ts";
import { findDuplicateFunctions } from "./find-duplicate-functions.service.ts";

function audited(file: string, sourceText: string): AuditedFile {
  return { file, lines: readSourceLines(sourceText) };
}

describe("findDuplicateConstants", () => {
  test("reports the later file when a name or a decorative text value repeats", () => {
    const files = [
      audited("a/time.constant.ts", "export const SECONDS_PER_MINUTE = 60;\nexport const SEPARATOR = ' · ';\n"),
      audited(
        "b/format.constant.ts",
        "export const SECONDS_PER_MINUTE = 60;\nexport const TARGET_SEPARATOR = ' · ';\n",
      ),
    ];
    expect(findDuplicateConstants(files)).toEqual([
      { file: "b/format.constant.ts", line: 1, rule: "duplicate-constant" },
      { file: "b/format.constant.ts", line: 2, rule: "duplicate-constant" },
    ]);
  });

  test("ignores one-character text, plain words, and unrelated values", () => {
    const files = [
      audited(
        "a/one.constant.ts",
        "export const FIRST = '/';\nexport const LIMIT = 4;\nexport const KIND = 'warning';\n",
      ),
      audited(
        "b/two.constant.ts",
        "export const SECOND = '/';\nexport const OTHER = 4;\nexport const COLOR = 'warning';\n",
      ),
    ];
    expect(findDuplicateConstants(files)).toEqual([]);
  });
});

describe("findDuplicateFunctions", () => {
  test("reports a function name declared in another file", () => {
    const files = [
      audited("a/is-user.service.ts", "export function isUserEntry(): boolean { return true; }\n"),
      audited("b/read-user.service.ts", "function isUserEntry(): boolean { return false; }\n"),
    ];
    expect(findDuplicateFunctions(files)).toEqual([
      { file: "b/read-user.service.ts", line: 1, rule: "duplicate-function" },
    ]);
  });
});

describe("checkConstantsFolderSize", () => {
  test("reports a folder with more than eight constant files", () => {
    const files = Array.from({ length: 9 }, (_, index) => audited(`tools/limit-${index}.constant.ts`, ""));
    expect(checkConstantsFolderSize(files)).toEqual([{ file: "tools", line: 0, rule: "crowded-constants-folder" }]);
    expect(checkConstantsFolderSize(files.slice(0, 8))).toEqual([]);
  });
});
