import type { ThemeColor } from "@earendil-works/pi-coding-agent";

/** Color of a detail line, or plain text rendered without a theme color. */
type DetailColor = ThemeColor | "plain";

/** One rendered line of the detail pane. */
export interface DetailLine {
  /** Text shown on the line; empty for spacing. */
  readonly text: string;
  /** Color applied to the text. */
  readonly color: DetailColor;
  /** Whether the text is rendered bold. */
  readonly bold: boolean;
}
