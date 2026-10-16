import { Value } from "typebox/value";
import { TaskProgressDetailsSchema } from "../../../schemas/activity/task-progress-details.schema.ts";
import type { ValueState } from "../../../types/activity/value-state.interface.ts";
import type { TaskProgress } from "../../../types/subagents/tasks/task-progress.interface.ts";
import { readNonEmptyStringState } from "./read-non-empty-string-state.service.ts";
import { readSubActivity } from "./read-sub-activity.service.ts";
import { readSubagentModel } from "./read-subagent-model.service.ts";
import { readSubagentUsage } from "./read-subagent-usage.service.ts";

export function readTaskProgress(details: unknown): ValueState<TaskProgress> {
  if (!Value.Check(TaskProgressDetailsSchema, details)) return { state: "absent" };
  return {
    state: "present",
    value: {
      id: details.id,
      title: details.title,
      role: details.role,
      tools: [...details.tools],
      verificationCommands: [...details.verificationCommands],
      currentTask: details.currentTask,
      status: details.status,
      model: readSubagentModel(details.model),
      thinkingLevel: readNonEmptyStringState(details.thinkingLevel),
      activity: readSubActivity(details),
      usage: readSubagentUsage(details),
    },
  };
}
