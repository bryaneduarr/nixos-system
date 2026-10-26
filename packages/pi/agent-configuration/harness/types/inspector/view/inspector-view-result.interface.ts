import type { SubagentSelection } from "../subagents/subagent-selection.interface.ts";
import type { InspectorLayoutState } from "./inspector-layout.interface.ts";

/** Frame lines and the view state produced by rendering. */
export interface InspectorViewResult {
  /** Lines of the rendered frame. */
  readonly lines: readonly string[];
  /** Layout of the tool list for mouse hit tests. */
  readonly layout: InspectorLayoutState;
  /** Frame line of the footer. */
  readonly footerY: number;
  /** Detail lines visible at once. */
  readonly detailViewportHeight: number;
  /** Selected subagent task after clamping to available tasks. */
  readonly subagentSelection: SubagentSelection;
  /** First visible subagent row after clamping. */
  readonly subagentScroll: number;
  /** First visible tool list row after clamping. */
  readonly listScroll: number;
  /** First visible detail line after clamping. */
  readonly detailScroll: number;
}
