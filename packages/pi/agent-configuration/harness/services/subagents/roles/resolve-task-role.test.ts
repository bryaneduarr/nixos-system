import { expect, test } from "bun:test";
import type { TaskRoleInput } from "../../../types/subagents/roles/task-role-input.interface.ts";
import { toValueState } from "../../activity/value/to-value-state.service.ts";
import { buildTaskSystemPrompt } from "./build-task-system-prompt.service.ts";
import { resolveTaskRole } from "./resolve-task-role.service.ts";

function roleInput(request: {
  readonly role?: string;
  readonly tools?: readonly string[];
  readonly verificationCommands?: readonly string[];
}): TaskRoleInput {
  return {
    role: toValueState(request.role),
    tools: toValueState(request.tools),
    verificationCommands: toValueState(request.verificationCommands),
  };
}

test("omitting the role keeps the generic task defaults", () => {
  const role = resolveTaskRole(roleInput({}));

  expect(role.role).toBe("task");
  expect(role.tools).toEqual(["read", "grep", "find", "ls"]);
  expect(buildTaskSystemPrompt(role)).toContain(
    "End with status, summary, findings, files_changed, and errors sections.",
  );

  const customTools = resolveTaskRole(roleInput({ tools: ["edit", "bash"] }));
  expect(customTools.tools).toEqual(["edit", "bash"]);
});

test("roles select different default tools and instructions", () => {
  const explore = resolveTaskRole(roleInput({ role: "explore" }));
  const implement = resolveTaskRole(roleInput({ role: "implement" }));
  const verify = resolveTaskRole(roleInput({ role: "verify" }));

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
  expect(() => resolveTaskRole(roleInput({ role: "explore", tools: ["read", "edit"] }))).toThrow(
    'Role "explore" cannot use tool(s): edit.',
  );
  expect(() => resolveTaskRole(roleInput({ role: "verify", tools: ["read", "bash"] }))).toThrow(
    'Role "verify" cannot use tool(s): bash.',
  );
  expect(() => resolveTaskRole(roleInput({ role: "unknown" }))).toThrow("Unknown task role: unknown");
});
