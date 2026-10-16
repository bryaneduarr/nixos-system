import { expect, test } from "bun:test";
import { buildTaskSystemPrompt } from "../roles/build-task-system-prompt.service.ts";
import { resolveTaskRole } from "../roles/resolve-task-role.service.ts";
import { parseTaskOutput } from "./parse-task-output.service.ts";

test("a verifier reports failed and unverified checks without reporting edits", () => {
  const verify = resolveTaskRole({
    role: { state: "present", value: "verify" },
    tools: { state: "absent" },
    verificationCommands: { state: "absent" },
  });
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

  expect(verify.tools).not.toContain("edit");
  expect(verify.tools).not.toContain("write");
  expect(buildTaskSystemPrompt(verify)).toContain("without repairing it");
  expect(report.checks).toEqual(["FAIL: bun test failed in parser.test.ts.", "UNVERIFIED: the Nix build was not run."]);
  expect(report.filesChanged).toEqual([]);
  expect(report.risks).toEqual(["The parser regression remains."]);
});
