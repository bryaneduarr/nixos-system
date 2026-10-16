import type { Theme } from "@earendil-works/pi-coding-agent";
import type { DetailArtifact } from "../detail/detail-artifact.interface.ts";
import type { InspectorRow } from "../detail/inspector-row.interface.ts";
import type { InspectorFocus, InspectorPage } from "../navigation/inspector-page.interface.ts";
import type { InspectorGeometry } from "./inspector-geometry.interface.ts";
import type { InspectorLayoutState } from "./inspector-layout.interface.ts";

/** Inputs for drawing the tool calls or user messages page. */
export interface ToolsPageOptions {
  /** Page shown: tool calls or user messages. */
  readonly page: InspectorPage;
  /** Pane that has keyboard focus. */
  readonly focus: InspectorFocus;
  /** Rows of the tool list. */
  readonly rows: readonly InspectorRow[];
  /** Index of the selected row. */
  readonly selected: number;
  /** Ids of subagent tasks whose child calls are listed. */
  readonly expandedTasks: ReadonlySet<string>;
  /** Text shown in place of the tool result. */
  readonly artifact: DetailArtifact;
  /** First visible tool list row before clamping. */
  readonly listScroll: number;
  /** First visible detail line before clamping. */
  readonly detailScroll: number;
  /** Pane sizes for this frame. */
  readonly geometry: InspectorGeometry;
  /** Theme used for colors and emphasis. */
  readonly theme: Theme;
}

/** Lines and clamped scroll state produced by drawing the tool calls page. */
export interface ToolsPageResult {
  /** Lines of the page. */
  readonly lines: string[];
  /** Layout of the tool list for mouse hit tests. */
  readonly layout: InspectorLayoutState;
  /** First visible tool list row after clamping. */
  readonly listScroll: number;
  /** First visible detail line after clamping. */
  readonly detailScroll: number;
}
