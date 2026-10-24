import type { Static } from "typebox";
import type { LegacyTaskProgressSchema } from "../../../../schemas/subagents/tasks/progress/legacy-task-progress.schema.ts";

/** Task progress saved in session history before model, reasoning, and usage were tracked. */
export type LegacyTaskProgress = Static<typeof LegacyTaskProgressSchema>;
