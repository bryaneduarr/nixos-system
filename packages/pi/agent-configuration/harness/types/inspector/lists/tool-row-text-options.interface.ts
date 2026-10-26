import type { Theme } from "@earendil-works/pi-coding-agent";
import type { InspectorRow } from "../detail/inspector-row.interface.ts";

/** Inputs for the text of one tool list row. */
export interface ToolRowTextOptions {
  /** Row whose text is built. */
  readonly row: InspectorRow;
  /** Ids of subagent tasks whose child calls are shown. */
  readonly expandedTasks: ReadonlySet<string>;
  /** Whether the row is the selected one. */
  readonly isSelected: boolean;
  /** Whether the row is the last child call of its task. */
  readonly isLastChild: boolean;
  /** Theme used for colors. */
  readonly theme: Pick<Theme, "fg">;
}
