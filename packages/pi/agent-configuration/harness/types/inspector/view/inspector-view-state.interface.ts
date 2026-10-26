import type { Theme } from "@earendil-works/pi-coding-agent";
import type { ToolActivity } from "../../activity/store/tool-activity.interface.ts";
import type { SplitViewFocus } from "../../split-view/split-view-focus.interface.ts";
import type { DetailArtifact } from "../detail/detail-artifact.interface.ts";
import type { InspectorRow } from "../detail/inspector-row.interface.ts";
import type { InspectorPage } from "../navigation/inspector-page.interface.ts";
import type { SubagentSelection } from "../subagents/subagent-selection.interface.ts";

/** Inputs needed to render one inspector frame. */
export interface InspectorViewState {
  /** Terminal width of the overlay. */
  readonly width: number;
  /** Terminal rows, used to size the body. */
  readonly terminalRows: number;
  /** Theme used for colors and emphasis. */
  readonly theme: Theme;
  /** Page currently shown. */
  readonly page: InspectorPage;
  /** Pane that has keyboard focus. */
  readonly focus: SplitViewFocus;
  /** Status message shown in the footer. */
  readonly status: string;
  /** Rows of the tool list. */
  readonly rows: readonly InspectorRow[];
  /** Index of the selected row. */
  readonly selected: number;
  /** Ids of subagent tasks whose child calls are shown. */
  readonly expandedTasks: ReadonlySet<string>;
  /** Text shown in place of the tool result. */
  readonly artifact: DetailArtifact;
  /** Subagent task entries of the subagents page. */
  readonly subagents: readonly ToolActivity[];
  /** Selected subagent task. */
  readonly subagentSelection: SubagentSelection;
  /** First visible subagent row. */
  readonly subagentScroll: number;
  /** First visible tool list row. */
  readonly listScroll: number;
  /** First visible detail line. */
  readonly detailScroll: number;
}
