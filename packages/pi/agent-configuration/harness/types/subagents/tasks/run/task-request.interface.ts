import type { ValueState } from "../../../activity/value/value-state.interface.ts";
import type { TaskRole } from "../../roles/task-role.interface.ts";
import type { TaskRoleInput } from "../../roles/task-role-input.interface.ts";
import type { ReasoningLevel } from "../model/reasoning-level.interface.ts";

/** A task request whose optional tool parameters have been converted to explicit value states. */
export interface TaskRequest extends TaskRoleInput {
  /** Role selection; an absent role selects the generic task role. */
  readonly role: ValueState<TaskRole>;
  /** Label shown for the worker in the conversation and status list. */
  readonly title: string;
  /** Instruction the isolated worker carries out. */
  readonly mission: string;
  /** Background the worker needs; the parent transcript is never inherited. */
  readonly context: ValueState<string>;
  /** Provider and model identifier requested for the worker. */
  readonly model: ValueState<string>;
  /** Reasoning level requested for the worker. */
  readonly reasoning: ValueState<ReasoningLevel>;
  /** Discoverable skills the worker may read. */
  readonly skills: ValueState<readonly string[]>;
  /** Maximum runtime in milliseconds, when the task sets one. */
  readonly timeoutMs: ValueState<number>;
}
