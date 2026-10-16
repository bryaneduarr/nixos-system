import { Value } from "typebox/value";
import { TaskProgressDetailsSchema } from "../../../schemas/subagents/tasks/task-progress-details.schema.ts";
import type { TaskProgressLookup } from "../../../types/subagents/tasks/task-progress-lookup.interface.ts";
import { readNonEmptyStringState } from "../../activity/parsing/read-non-empty-string-state.service.ts";
import { readSubActivity } from "../../activity/parsing/read-sub-activity.service.ts";
import { readSubagentModel } from "../../activity/parsing/read-subagent-model.service.ts";
import { readSubagentUsage } from "../../activity/parsing/read-subagent-usage.service.ts";

export function readTaskProgress(value: unknown): TaskProgressLookup {
  if (!Value.Check(TaskProgressDetailsSchema, value)) return { found: false };
  return {
    found: true,
    progress: {
      id: value.id,
      title: value.title,
      role: value.role,
      tools: [...value.tools],
      verificationCommands: [...value.verificationCommands],
      currentTask: value.currentTask,
      status: value.status,
      model: readSubagentModel(value.model),
      thinkingLevel: readNonEmptyStringState(value.thinkingLevel),
      activity: readSubActivity(value),
      usage: readSubagentUsage(value),
    },
  };
}
