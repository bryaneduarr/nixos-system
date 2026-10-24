import type { ValueState } from "../../activity/value/value-state.interface.ts";

/** Role selection from a task request, with each field either requested or omitted. */
export interface TaskRoleInput {
  /** Requested role name; an absent role selects the generic task role. */
  readonly role: ValueState<string>;
  /** Requested tools; an absent value selects the role's default tools. */
  readonly tools: ValueState<readonly string[]>;
  /** Approved verification commands; an absent value approves none. */
  readonly verificationCommands: ValueState<readonly string[]>;
}
