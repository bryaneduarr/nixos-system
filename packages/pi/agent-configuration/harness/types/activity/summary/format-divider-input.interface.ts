import type { SplitViewTheme } from "../../split-view/split-view-theme.interface.ts";

/** Fields that draw one divider line of the activity summary. */
export interface FormatDividerInput {
  /** Theme that colors the prefix and fill. */
  readonly theme: Pick<SplitViewTheme, "fg">;
  /** Label drawn after the prefix, already colored. */
  readonly label: string;
  /** Width of the line, in terminal columns. */
  readonly width: number;
  /** Border prefix drawn before the label. */
  readonly prefix: string;
}
