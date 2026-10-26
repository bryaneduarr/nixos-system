import type { ToolActivity } from "../../activity/store/tool-activity.interface.ts";
import type { SplitViewFocus } from "../../split-view/split-view-focus.interface.ts";
import type { DetailArtifact } from "../detail/detail-artifact.interface.ts";
import type { InspectorRow } from "../detail/inspector-row.interface.ts";
import type { InspectorRowLookup } from "../detail/inspector-row-lookup.interface.ts";
import type { SubagentSelection } from "../subagents/subagent-selection.interface.ts";
import type { InspectorPage } from "./inspector-page.interface.ts";
import type { RowSelection } from "./row-selection.interface.ts";

/** Selection, scroll, and page state of the inspector with the moves that change it. */
export interface InspectorNavigation {
  /** Tool list row selected by key. */
  selection: RowSelection;
  /** Pane that receives keyboard input. */
  focus: SplitViewFocus;
  /** First visible detail line. */
  detailScroll: number;
  /** Text shown in place of the tool result. */
  artifact: DetailArtifact;
  /** Page currently shown. */
  page: InspectorPage;
  /** Ids of subagent tasks whose child calls are shown. */
  readonly expandedTasks: Set<string>;
  /** Selected subagent task on the subagents page. */
  subagentSelection: SubagentSelection;
  /** Subagent task shown on the subagent page. */
  openedSubagent: SubagentSelection;
  /** First visible subagent row. */
  subagentScroll: number;
  /** Detail lines visible at once, from the last render. */
  detailViewportHeight: number;
  /** First visible tool list row. */
  listScroll: number;
  /** Builds the tool list rows of the current page. */
  buildRows(): InspectorRow[];
  /** Subagent task entries of the subagents page. */
  subagentEntries(): ToolActivity[];
  /** Index of the selected row within the given rows, or 0 when it is missing. */
  selectedIndex(rows: InspectorRow[]): number;
  /** Finds the selected row of the current page. */
  currentRow(): InspectorRowLookup;
  /** Keeps the selection on an existing row, defaulting to the last row. */
  syncSelection(rows: InspectorRow[]): void;
  /** Collapses or expands the selected subagent task; returns whether it applied. */
  adjustSubagentCollapse(direction: "left" | "right"): boolean;
  /** Selects a tool list row by key and resets the detail view. */
  select(id: string): void;
  /** Moves the selection, subagent selection, or detail scroll by a number of rows. */
  step(delta: number): void;
  /** Moves to the first or last row of the focused pane. */
  jump(where: "start" | "end"): void;
}
