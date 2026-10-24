import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";
import type { TaskRoleInput } from "../../../types/subagents/roles/task-role-input.interface.ts";

export const absent: ValueState<never> = { state: "absent" };

export function present<T>(value: T): ValueState<T> {
  return { state: "present", value };
}

export function roleRequest(role: string): TaskRoleInput {
  return { role: present(role), tools: absent, verificationCommands: absent };
}

export function toolRequest(role: string, tools: readonly string[]): TaskRoleInput {
  return { role: present(role), tools: present(tools), verificationCommands: absent };
}
