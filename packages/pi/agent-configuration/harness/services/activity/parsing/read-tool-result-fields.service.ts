import type { ToolResultFields } from "../../../types/activity/tool-result-fields.interface.ts";
import { readSubActivity } from "./read-sub-activity.service.ts";
import { readSubagentMetadata } from "./read-subagent-metadata.service.ts";
import { readSubagentUsage } from "./read-subagent-usage.service.ts";
import { readTaskProgress } from "./read-task-progress.service.ts";

export function readToolResultFields(details: unknown): ToolResultFields {
  return {
    details: readTaskProgress(details),
    sub: readSubActivity(details),
    usage: readSubagentUsage(details),
    ...readSubagentMetadata(details),
  };
}
