import type { LegacyTaskProgress } from "../../../types/subagents/tasks/legacy-task-progress.interface.ts";
import type { TaskProgress } from "../../../types/subagents/tasks/task-progress.interface.ts";
import { readNonEmptyStringState } from "../../activity/parsing/read-non-empty-string-state.service.ts";
import { readSubActivity } from "../../activity/parsing/read-sub-activity.service.ts";
import { readSubagentModel } from "../../activity/parsing/read-subagent-model.service.ts";
import { readSubagentUsage } from "../../activity/parsing/read-subagent-usage.service.ts";

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
