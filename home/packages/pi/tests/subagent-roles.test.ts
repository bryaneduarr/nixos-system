import { expect, mock, test } from "bun:test";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";

mock.module("@earendil-works/pi-coding-agent", () => ({
  defineTool: (tool: unknown) => tool,
}));

import {
  buildTaskSystemPrompt,
  resolveTaskRole,
} from "../agent-configuration/harness/subagents/roles.ts";
import { parseTaskOutput } from "../agent-configuration/harness/subagents/result.ts";

const { createApprovedCommandTool } = await import(
  "../agent-configuration/harness/subagents/approved-command.ts"
);

test("omitting the role keeps the generic task defaults", () => {
  const role = resolveTaskRole({});

  expect(role.role).toBe("task");
  expect(role.tools).toEqual(["read", "grep", "find", "ls"]);
  expect(buildTaskSystemPrompt(role)).toContain(
    "End with status, summary, findings, files_changed, and errors sections.",
  );

  const customTools = resolveTaskRole({ tools: ["edit", "bash"] });
  expect(customTools.tools).toEqual(["edit", "bash"]);
});

test("roles select different default tools and instructions", () => {
  const explore = resolveTaskRole({ role: "explore" });
  const implement = resolveTaskRole({ role: "implement" });
  const verify = resolveTaskRole({ role: "verify" });

  expect(explore.tools).toEqual(["read", "grep", "find", "ls"]);
  expect(implement.tools).toContain("edit");
  expect(implement.tools).toContain("write");
  expect(verify.tools).not.toContain("edit");
  expect(verify.tools).not.toContain("write");
  expect(verify.tools).not.toContain("bash");
  expect(buildTaskSystemPrompt(explore)).toContain("Do not edit files or run commands.");
  expect(buildTaskSystemPrompt(implement)).toContain("remaining risks");
  expect(buildTaskSystemPrompt(verify)).toContain(
    "If a check fails, stop and report the failure without repairing it.",
  );
});

test("role overrides reject tools that exceed the role", () => {
  expect(() => resolveTaskRole({ role: "explore", tools: ["read", "edit"] }))
    .toThrow('Role "explore" cannot use tool(s): edit.');
  expect(() => resolveTaskRole({ role: "verify", tools: ["read", "bash"] }))
    .toThrow('Role "verify" cannot use tool(s): bash.');
  expect(() => resolveTaskRole({ role: "unknown" }))
    .toThrow("Unknown task role: unknown");
});

test("implementation and verification commands use an exact allowlist", async () => {
  const command = "printf approved";
  const role = resolveTaskRole({ role: "verify", verificationCommands: [command] });
  const prompt = buildTaskSystemPrompt(role);

  expect(role.tools).toContain("approved_command");
  expect(prompt).toContain(`- ${command}`);

  const tool = createApprovedCommandTool([command]);
  const context = { cwd: process.cwd() } as ExtensionContext;
  const allowed = await tool.execute("allowed", { command }, undefined, undefined, context);
  const deniedCommand = `${command}; printf changed`;
  const denied = await tool.execute(
    "denied",
    { command: deniedCommand },
    undefined,
    undefined,
    context,
  );

  expect(allowed.content[0]).toMatchObject({
    type: "text",
    text: expect.stringContaining("approved"),
  });
  expect(denied.content[0]).toMatchObject({
    type: "text",
    text: "Blocked: command is not on the approved list.",
  });
  expect(denied.isError).toBe(true);
});

test("a verifier reports failed and unverified checks without reporting edits", () => {
  const verify = resolveTaskRole({ role: "verify" });
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
  expect(report.checks).toEqual([
    "FAIL: bun test failed in parser.test.ts.",
    "UNVERIFIED: the Nix build was not run.",
  ]);
  expect(report.filesChanged).toEqual([]);
  expect(report.risks).toEqual(["The parser regression remains."]);
});
