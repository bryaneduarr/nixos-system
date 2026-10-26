import { expect, test } from "bun:test";
import { parseTaskOutput } from "./parse-task-output.service.ts";

test("a report keeps failed and unverified checks and leaves empty sections empty", () => {
  const output = [
    "status: success",
    "summary: The change has one failing check.",
    "checks:",
    "- FAIL: bun test failed in parser.test.ts.",
    "- UNVERIFIED: the Nix build was not run.",
    "files_changed:",
    "risks:",
    "- The parser regression remains.",
  ].join("\n");
  const report = parseTaskOutput(output);

  expect(report.checks).toEqual(["FAIL: bun test failed in parser.test.ts.", "UNVERIFIED: the Nix build was not run."]);
  expect(report.filesChanged).toEqual([]);
  expect(report.risks).toEqual(["The parser regression remains."]);
});
