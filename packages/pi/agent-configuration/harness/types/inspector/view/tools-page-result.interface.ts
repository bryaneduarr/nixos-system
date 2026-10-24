import type { InspectorLayoutState } from "./inspector-layout.interface.ts";

/** Lines and clamped scroll state produced by drawing the tool calls page. */
export interface ToolsPageResult {
  /** Lines of the page. */
  readonly lines: readonly string[];
  /** Layout of the tool list for mouse hit tests. */
  readonly layout: InspectorLayoutState;
  /** First visible tool list row after clamping. */
  readonly listScroll: number;
  /** First visible detail line after clamping. */
  readonly detailScroll: number;
}
