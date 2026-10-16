import type { TASK_ROLES } from "../../../constants/subagents/roles.constant.ts";

/* Role a task worker runs with. */
export type TaskRole = (typeof TASK_ROLES)[number];
