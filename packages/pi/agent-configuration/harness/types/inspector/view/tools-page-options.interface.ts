import type { Theme } from "@earendil-works/pi-coding-agent";
import type { SplitViewFocus } from "../../split-view/split-view-focus.interface.ts";
import type { SplitViewGeometry } from "../../split-view/split-view-geometry.interface.ts";
import type { DetailArtifact } from "../detail/detail-artifact.interface.ts";
import type { InspectorRow } from "../detail/inspector-row.interface.ts";
import type { ListInspectorPage } from "../navigation/inspector-page.interface.ts";

/** Inputs for drawing a page that lists rows next to a detail pane. */
export interface ToolsPageOptions {
  /** Page shown. */
  readonly page: ListInspectorPage;
  /** Pane that has keyboard focus. */
  readonly focus: SplitViewFocus;
  /** Rows of the tool list. */
  readonly rows: readonly InspectorRow[];
  /** Index of the selected row. */
  readonly selected: number;
  /** Ids of subagent tasks whose child calls are shown. */
  readonly expandedTasks: ReadonlySet<string>;
  /** Text shown in place of the tool result. */
  readonly artifact: DetailArtifact;
  /** First visible tool list row before clamping. */
  readonly listScroll: number;
  /** First visible detail line before clamping. */
  readonly detailScroll: number;
  /** Pane sizes for this frame. */
  readonly geometry: SplitViewGeometry;
  /** Theme used for colors and emphasis. */
  readonly theme: Theme;
}
