import { expect, test } from "bun:test";
import { buildTaskSystemPrompt } from "./build-task-system-prompt.service.ts";
import { resolveTaskRole } from "./resolve-task-role.service.ts";
import { absent, roleRequest } from "./resolve-task-role.test-double.ts";

test("the generic task role keeps the legacy system prompt", () => {
  const role = resolveTaskRole({ role: absent, tools: absent, verificationCommands: absent });

  expect(buildTaskSystemPrompt(role)).toContain(
    "End with status, summary, findings, files_changed, and errors sections.",
  );
});

test("each role prompt carries its own instruction", () => {
  const explore = resolveTaskRole(roleRequest("explore"));
  const implement = resolveTaskRole(roleRequest("implement"));
  const verify = resolveTaskRole(roleRequest("verify"));

  expect(buildTaskSystemPrompt(explore)).toContain("Do not edit files or run commands.");
  expect(buildTaskSystemPrompt(implement)).toContain("remaining risks");
  expect(buildTaskSystemPrompt(verify)).toContain(
    "If a check fails, stop and report the failure without repairing it.",
  );
});
