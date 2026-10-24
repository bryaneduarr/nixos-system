import type { Static } from "typebox";
import type { TaskParams } from "../../../../schemas/subagents/tasks/run/task-params.schema.ts";

/** Validated parameters of a task tool call. */
export type TaskInput = Static<typeof TaskParams>;
