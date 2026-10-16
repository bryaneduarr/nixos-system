import type { ToolResultFields } from "../../../types/activity/tool-result-fields.interface.ts";
import { readTaskProgress } from "../../subagents/tasks/read-task-progress.service.ts";
import { readSubActivity } from "./read-sub-activity.service.ts";
import { readSubagentMetadata } from "./read-subagent-metadata.service.ts";
import { readSubagentUsage } from "./read-subagent-usage.service.ts";

export function readToolResultFields(details: unknown): ToolResultFields {
  const progress = readTaskProgress(details);
  return {
    details: progress.found ? { state: "present", value: progress.progress } : { state: "absent" },
    sub: readSubActivity(details),
    usage: readSubagentUsage(details),
    ...readSubagentMetadata(details),
  };
}
