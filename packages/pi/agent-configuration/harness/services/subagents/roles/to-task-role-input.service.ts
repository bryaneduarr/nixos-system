import type { TaskRoleInput } from "../../../types/subagents/roles/task-role-input.interface.ts";
import type { TaskInput } from "../../../types/subagents/tasks/task-input.interface.ts";
import { toValueState } from "../../activity/value/to-value-state.service.ts";

export function toTaskRoleInput(input: TaskInput): TaskRoleInput {
  return {
    role: toValueState(input.role),
    tools: toValueState(input.tools),
    verificationCommands: toValueState(input.verificationCommands),
  };
}
