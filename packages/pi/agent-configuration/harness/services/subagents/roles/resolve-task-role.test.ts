import { expect, test } from "bun:test";
import { resolveTaskRole } from "./resolve-task-role.service.ts";
import { absent, present, roleRequest, toolRequest } from "./resolve-task-role.test-double.ts";

test("omitting the role keeps the generic task defaults", () => {
  const role = resolveTaskRole({ role: absent, tools: absent, verificationCommands: absent });

  expect(role.role).toBe("task");
  expect(role.tools).toEqual(["read", "grep", "find", "ls"]);

  const customTools = resolveTaskRole({
    role: absent,
    tools: present(["edit", "bash"]),
    verificationCommands: absent,
  });
  expect(customTools.tools).toEqual(["edit", "bash"]);
});

test("roles select different default tools", () => {
  const explore = resolveTaskRole(roleRequest("explore"));
  const implement = resolveTaskRole(roleRequest("implement"));
  const verify = resolveTaskRole(roleRequest("verify"));

  expect(explore.tools).toEqual(["read", "grep", "find", "ls"]);
  expect(implement.tools).toContain("edit");
  expect(implement.tools).toContain("write");
  expect(verify.tools).not.toContain("edit");
  expect(verify.tools).not.toContain("write");
  expect(verify.tools).not.toContain("bash");
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
