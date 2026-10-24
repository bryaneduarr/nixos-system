import type { ToolResultFields } from "../../../../types/activity/parsing/tool-result/tool-result-fields.interface.ts";
import { readTaskProgress } from "../../../subagents/tasks/progress/read-task-progress.service.ts";
import { readSubActivity } from "../subagent/read-sub-activity.service.ts";
import { readSubagentMetadata } from "../subagent/read-subagent-metadata.service.ts";
import { readSubagentUsage } from "../subagent/read-subagent-usage.service.ts";

export function readToolResultFields(details: unknown): ToolResultFields {
  const progressLookup = readTaskProgress(details);
  if (progressLookup.found) {
    const { progress } = progressLookup;
    return {
      details: { state: "present", value: progress },
      sub: progress.activity,
      usage: progress.usage,
      model: progress.model,
      thinkingLevel: progress.thinkingLevel,
    };
  }

  return {
    details: { state: "absent" },
    sub: readSubActivity(details),
    usage: readSubagentUsage(details),
    ...readSubagentMetadata(details),
  };
}
