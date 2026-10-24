import type { Theme } from "@earendil-works/pi-coding-agent";
import type { InspectorRow } from "../detail/inspector-row.interface.ts";

/** Inputs for drawing the tool call list. */
export interface ToolListOptions {
  /** Rows of the tool list. */
  readonly rows: readonly InspectorRow[];
  /** Width of the list pane in columns. */
  readonly width: number;
  /** Rows of the list pane. */
  readonly height: number;
  /** Index of the first visible row. */
  readonly scroll: number;
  /** Index of the selected row. */
  readonly selected: number;
  /** Ids of subagent tasks whose child calls are shown. */
  readonly expandedTasks: ReadonlySet<string>;
  /** Theme used for colors and emphasis. */
  readonly theme: Pick<Theme, "fg" | "bg">;
}
