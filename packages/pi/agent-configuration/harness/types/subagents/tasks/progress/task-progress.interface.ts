import type { SubToolActivity } from "../../../activity/parsing/subagent/sub-tool-activity.interface.ts";
import type { SubagentModel } from "../../../activity/parsing/subagent/subagent-model.interface.ts";
import type { ToolActivityUsage } from "../../../activity/parsing/subagent/tool-activity-usage.interface.ts";
import type { ValueState } from "../../../activity/value/value-state.interface.ts";
import type { TaskRole } from "../../roles/task-role.interface.ts";
import type { TaskStatus } from "./task-status.interface.ts";

/** Live state of a subagent run, published while it works. */
export interface TaskProgress {
  /** Identifier of the subagent run. */
  readonly id: string;
  /** Title the parent gave the task. */
  readonly title: string;
  /** Role the worker runs with. */
  readonly role: TaskRole;
  /** Tools the worker may call. */
  readonly tools: readonly string[];
  /** Approved verification commands for the worker. */
  readonly verificationCommands: readonly string[];
  /** Description of the step the worker is on. */
  currentTask: string;
  /** Lifecycle state of the run. */
  status: TaskStatus;
  /** Model the worker runs on, once it has been resolved. */
  readonly model: ValueState<SubagentModel>;
  /** Reasoning level the worker runs with, once it has been resolved. */
  readonly thinkingLevel: ValueState<string>;
  /** Tool calls the worker has made. */
  activity: readonly SubToolActivity[];
  /** Token usage of the worker, present once it has produced a response. */
  usage: ToolActivityUsage;
}
