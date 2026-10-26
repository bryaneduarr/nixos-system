import type { Theme } from "@earendil-works/pi-coding-agent";
import type { ToolActivity } from "../../activity/store/tool-activity.interface.ts";
import type { SubagentSelection } from "../subagents/subagent-selection.interface.ts";

/** Inputs for drawing the subagents page. */
export interface SubagentsPageOptions {
  /** Subagent task entries to list. */
  readonly subagents: readonly ToolActivity[];
  /** Selected subagent task before clamping to the available tasks. */
  readonly selection: SubagentSelection;
  /** First visible subagent row before clamping. */
  readonly scroll: number;
  /** Width of the page in columns. */
  readonly width: number;
  /** Body height in terminal rows. */
  readonly height: number;
  /** Theme used for colors and emphasis. */
  readonly theme: Theme;
}
