import type { SplitViewTheme } from "./split-view-theme.interface.ts";

/** One row of a split view list to fit to the pane width. */
export interface ListRowOptions {
  /** Text of the row, already colored. */
  readonly text: string;
  /** Width of the list pane in columns. */
  readonly width: number;
  /** Whether the row is the selected one. */
  readonly isSelected: boolean;
  /** Theme used to paint the selected row background. */
  readonly theme: Pick<SplitViewTheme, "bg">;
}
