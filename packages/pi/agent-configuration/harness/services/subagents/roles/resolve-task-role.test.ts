import { expect, test } from "bun:test";
import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";
import type { TaskRoleInput } from "../../../types/subagents/roles/task-role-input.interface.ts";
import { buildTaskSystemPrompt } from "./build-task-system-prompt.service.ts";
import { resolveTaskRole } from "./resolve-task-role.service.ts";

const absent: ValueState<never> = { state: "absent" };

function present<T>(value: T): ValueState<T> {
  return { state: "present", value };
}

function roleRequest(role: string): TaskRoleInput {
  return { role: present(role), tools: absent, verificationCommands: absent };
}

function toolRequest(role: string, tools: readonly string[]): TaskRoleInput {
  return { role: present(role), tools: present(tools), verificationCommands: absent };
}

test("omitting the role keeps the generic task defaults", () => {
  const role = resolveTaskRole({ role: absent, tools: absent, verificationCommands: absent });

  expect(role.role).toBe("task");
  expect(role.tools).toEqual(["read", "grep", "find", "ls"]);
  expect(buildTaskSystemPrompt(role)).toContain(
    "End with status, summary, findings, files_changed, and errors sections.",
  );

  const customTools = resolveTaskRole({
    role: absent,
    tools: present(["edit", "bash"]),
    verificationCommands: absent,
  });
  expect(customTools.tools).toEqual(["edit", "bash"]);
});

test("roles select different default tools and instructions", () => {
  const explore = resolveTaskRole(roleRequest("explore"));
  const implement = resolveTaskRole(roleRequest("implement"));
  const verify = resolveTaskRole(roleRequest("verify"));

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
  expect(() => resolveTaskRole(toolRequest("explore", ["read", "edit"]))).toThrow(
    'Role "explore" cannot use tool(s): edit.',
  );
  expect(() => resolveTaskRole(toolRequest("verify", ["read", "bash"]))).toThrow(
    'Role "verify" cannot use tool(s): bash.',
  );
  expect(() => resolveTaskRole(roleRequest("unknown"))).toThrow("Unknown task role: unknown");
});
