import type { SubToolActivity } from "../../activity/sub-tool-activity.interface.ts";
import type { SubagentModel } from "../../activity/subagent-model.interface.ts";
import type { ToolActivityUsage } from "../../activity/tool-activity-usage.interface.ts";
import type { ValueState } from "../../activity/value-state.interface.ts";
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
  /* Model the worker runs on, once it has been resolved. */
  model: ValueState<SubagentModel>;
  /* Reasoning level the worker runs with, once it has been resolved. */
  thinkingLevel: ValueState<string>;
  /* Tool calls the worker has made. */
  activity: SubToolActivity[];
  /* Token usage of the worker, present once it has produced a response. */
  usage: ToolActivityUsage;
}
