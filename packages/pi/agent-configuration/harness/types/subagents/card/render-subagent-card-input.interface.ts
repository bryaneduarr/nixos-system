import type { Component } from "@earendil-works/pi-tui";
import type { ValueState } from "../../activity/value/value-state.interface.ts";
import type { TaskProgressLookup } from "../tasks/progress/task-progress-lookup.interface.ts";
import type { SubagentCardTheme } from "./subagent-card-theme.interface.ts";

/** Inputs that render the box of one subagent tool call. */
export interface RenderSubagentCardInput {
  /** Theme that colors the box text. */
  readonly theme: SubagentCardTheme;
  /** Identifier of the tool call the box belongs to. */
  readonly toolCallId: string;
  /** Title the parent gave the task. */
  readonly title: string;
  /** Live progress of the run, when the registry still tracks it. */
  readonly progressLookup: TaskProgressLookup;
  /** Component Pi rendered for this call before, reused when it is a box. */
  readonly lastComponent: ValueState<Component>;
}
