import { Value } from "typebox/value";
import { LegacyTaskProgressSchema } from "../../../../schemas/subagents/tasks/progress/legacy-task-progress.schema.ts";
import { TaskProgressSchema } from "../../../../schemas/subagents/tasks/progress/task-progress.schema.ts";
import type { TaskProgressLookup } from "../../../../types/subagents/tasks/progress/task-progress-lookup.interface.ts";
import { convertLegacyTaskProgress } from "./convert-legacy-task-progress.service.ts";

export function readTaskProgress(details: unknown): TaskProgressLookup {
  if (Value.Check(TaskProgressSchema, details)) return { found: true, progress: details };
  if (!Value.Check(LegacyTaskProgressSchema, details)) return { found: false };

  return { found: true, progress: convertLegacyTaskProgress(details) };
}
