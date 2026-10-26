/** Side of the shown turn where other turns are hidden. */
type TurnDividerDirection = "earlier" | "later";

/** What a turn divider must show. */
export interface TurnDividerRequest {
  /** Whether the hidden turns come before or after the shown turn. */
  readonly direction: TurnDividerDirection;
  /** Number of hidden turns on that side. */
  readonly hiddenCount: number;
  /** Width of the transcript in columns. */
  readonly width: number;
}
