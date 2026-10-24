import type { LegacyTaskProgress } from "../../../../types/subagents/tasks/progress/legacy-task-progress.interface.ts";
import type { TaskProgress } from "../../../../types/subagents/tasks/progress/task-progress.interface.ts";
import { readSubActivity } from "../../../activity/parsing/subagent/read-sub-activity.service.ts";
import { readSubagentModel } from "../../../activity/parsing/subagent/read-subagent-model.service.ts";
import { readSubagentUsage } from "../../../activity/parsing/subagent/read-subagent-usage.service.ts";
import { readNonEmptyStringState } from "../../../activity/value/read-non-empty-string-state.service.ts";

export function convertLegacyTaskProgress(details: LegacyTaskProgress): TaskProgress {
  return {
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
  };
}
