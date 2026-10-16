import type { SubagentModel, SubagentUsage, SubToolActivity } from "../../../activity/store.ts";
import type { TaskRole } from "../roles/task-role.interface.ts";
import type { TaskStatus } from "./task-status.interface.ts";

/* Live state of a subagent run, published while it works. */
export interface TaskProgress {
  /* Identifier of the subagent run. */
  id: string;
  /* Title the parent gave the task. */
  title: string;
  /* Role the worker runs with. */
  role: TaskRole;
  /* Tools the worker may call. */
  tools: string[];
  /* Approved verification commands for the worker. */
  verificationCommands: string[];
  /* Description of the step the worker is on. */
  currentTask: string;
  /* Lifecycle state of the run. */
  status: TaskStatus;
  /* Model the worker runs on, when it has been resolved. */
  model?: SubagentModel;
  /* Reasoning level the worker runs with, when it has been resolved. */
  thinkingLevel?: string;
  /* Tool calls the worker has made. */
  activity: SubToolActivity[];
  /* Token usage reported so far, when the worker has produced a response. */
  usage?: SubagentUsage;
}
