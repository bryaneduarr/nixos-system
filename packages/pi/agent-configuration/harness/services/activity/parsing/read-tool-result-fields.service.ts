import type { ToolResultFields } from "../../../types/activity/tool-result-fields.interface.ts";
import { readTaskProgress } from "../../subagents/tasks/read-task-progress.service.ts";
import { readSubActivity } from "./read-sub-activity.service.ts";
import { readSubagentMetadata } from "./read-subagent-metadata.service.ts";
import { readSubagentUsage } from "./read-subagent-usage.service.ts";

export function readToolResultFields(details: unknown): ToolResultFields {
  const progressLookup = readTaskProgress(details);

  return {
    details: progressLookup.found ? { state: "present", value: progressLookup.progress } : { state: "absent" },
    sub: readSubActivity(details),
    usage: readSubagentUsage(details),
    ...readSubagentMetadata(details),
  };
}
