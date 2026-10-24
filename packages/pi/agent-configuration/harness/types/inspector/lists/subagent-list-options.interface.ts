import type { Theme } from "@earendil-works/pi-coding-agent";
import type { ToolActivity } from "../../activity/store/tool-activity.interface.ts";
import type { SubagentSelection } from "../subagents/subagent-selection.interface.ts";

/** Inputs for drawing the subagents list. */
export interface SubagentListOptions {
  /** Subagent task entries to list. */
  readonly rows: readonly ToolActivity[];
  /** Width of the list in columns. */
  readonly width: number;
  /** Rows available for the list. */
  readonly height: number;
  /** Index of the first visible task. */
  readonly scroll: number;
  /** Selected subagent task. */
  readonly selection: SubagentSelection;
  /** Theme colors used for status words and the selected row. */
  readonly theme: Pick<Theme, "fg" | "bg">;
}
