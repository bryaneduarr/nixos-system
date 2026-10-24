import type { ToolResultFields } from "../../../types/activity/tool-result-fields.interface.ts";
import { readTaskProgress } from "../../subagents/tasks/read-task-progress.service.ts";
import { readSubActivity } from "./read-sub-activity.service.ts";
import { readSubagentMetadata } from "./read-subagent-metadata.service.ts";
import { readSubagentUsage } from "./read-subagent-usage.service.ts";

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
