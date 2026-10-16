import { Value } from "typebox/value";
import { TaskProgressSchema } from "../../../schemas/subagents/tasks/task-progress.schema.ts";
import type { TaskProgressLookup } from "../../../types/subagents/tasks/task-progress-lookup.interface.ts";

export function readTaskProgress(value: unknown): TaskProgressLookup {
  if (!Value.Check(TaskProgressSchema, value)) return { found: false };

  return { found: true, progress: value };
}
