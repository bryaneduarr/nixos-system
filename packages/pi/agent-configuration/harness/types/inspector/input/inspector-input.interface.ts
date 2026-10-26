import type { ToolActivity } from "../../activity/store/tool-activity.interface.ts";
import type { SplitViewFocus } from "../../split-view/split-view-focus.interface.ts";
import type { InspectorPage } from "../navigation/inspector-page.interface.ts";
import type { InspectorLayoutState } from "../view/inspector-layout.interface.ts";

/** State and actions the inspector exposes to keyboard and mouse handlers. */
export interface InspectorInput {
  /** Page currently shown. */
  readonly page: InspectorPage;
  /** Pane that has keyboard focus. */
  readonly focus: SplitViewFocus;
  /** Terminal row of the footer, used for mouse hit tests. */
  readonly footerY: number;
  /** Layout of the last rendered frame. */
  readonly layout: InspectorLayoutState;
  /** First visible subagent row. */
  readonly subagentScroll: number;
  /** First visible tool list row. */
  readonly listScroll: number;
  /** Closes the inspector overlay. */
  close(): void;
  /** Shows another inspector page. */
  switchPage(page: InspectorPage): void;
  /** Moves keyboard focus between the list and the detail pane. */
  switchFocus(): void;
  /** Moves keyboard focus to the detail pane. */
  focusDetail(): void;
  /** Opens the selected subagent task on the subagent page. */
  openSubagent(): void;
  /** Collapses or expands the selected subagent task. */
  collapse(direction: "left" | "right"): boolean;
  /** Copies the selected detail text to the clipboard. */
  copy(): void;
  /** Loads or unloads the artifact of the selected call. */
  toggleArtifact(): void;
  /** Number of rows one page step moves. */
  pageSize(): number;
  /** Moves the selection or the detail scroll by a number of rows. */
  step(delta: number): void;
  /** Moves to the first or last row. */
  jump(where: "start" | "end"): void;
  /** Subagent task entries of the subagents page. */
  subagentEntries(): ToolActivity[];
  /** Selects a subagent task by id. */
  selectSubagent(id: string): void;
  /** Selects a tool list row by key. */
  select(id: string): void;
}
