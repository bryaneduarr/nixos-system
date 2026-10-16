import type { Theme } from "@earendil-works/pi-coding-agent";
import type { ToolActivity } from "../../../activity/store.ts";
import type { DetailArtifact } from "../detail/detail-artifact.interface.ts";
import type { InspectorRow } from "../detail/inspector-row.interface.ts";
import type { InspectorFocus, InspectorPage } from "../navigation/inspector-page.interface.ts";
import type { SubagentSelection } from "../subagents/subagent-selection.interface.ts";
import type { InspectorLayoutState } from "./inspector-layout.interface.ts";

/* Inputs needed to render one inspector frame. */
export interface InspectorViewState {
  /* Terminal width of the overlay. */
  readonly width: number;
  /* Terminal rows, used to size the body. */
  readonly terminalRows: number;
  /* Theme used for colors and emphasis. */
  readonly theme: Theme;
  /* Page currently shown. */
  readonly page: InspectorPage;
  /* Pane that has keyboard focus. */
  readonly focus: InspectorFocus;
  /* Status message shown in the footer. */
  readonly status: string;
  /* Rows of the tool list. */
  readonly rows: readonly InspectorRow[];
  /* Index of the selected row. */
  readonly selected: number;
  /* Ids of subagent tasks whose child calls are listed. */
  readonly expandedTasks: ReadonlySet<string>;
  /* Text shown in place of the tool result. */
  readonly artifact: DetailArtifact;
  /* Subagent task entries of the subagents page. */
  readonly subagents: readonly ToolActivity[];
  /* Selected subagent task. */
  readonly subagentSelection: SubagentSelection;
  /* First visible subagent row. */
  readonly subagentScroll: number;
  /* First visible tool list row. */
  readonly listScroll: number;
  /* First visible detail line. */
  readonly detailScroll: number;
}

/* Frame lines and the view state produced by rendering. */
export interface InspectorViewResult {
  /* Lines of the rendered frame. */
  readonly lines: string[];
  /* Layout of the tool list for mouse hit tests. */
  readonly layout: InspectorLayoutState;
  /* Frame line of the footer. */
  readonly footerY: number;
  /* Detail lines visible at once. */
  readonly detailViewportHeight: number;
  /* Selected subagent task after clamping to available tasks. */
  readonly subagentSelection: SubagentSelection;
  /* First visible subagent row after clamping. */
  readonly subagentScroll: number;
  /* First visible tool list row after clamping. */
  readonly listScroll: number;
  /* First visible detail line after clamping. */
  readonly detailScroll: number;
}
