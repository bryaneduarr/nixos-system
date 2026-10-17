/** Visual state of a harness tool row. */
export type HarnessVisualState = "running" | "success" | "error";

/** Text shown for one harness tool call in its box. */
export interface HarnessPresentation {
  /** Tool label in capital letters, such as READ. */
  readonly title: string;
  /** Short description of the call target, such as a path or command. */
  readonly target: string;
  /** Visual state of the call. */
  readonly state: HarnessVisualState;
  /** Result detail lines; the first line is the summary. */
  readonly details: readonly string[];
}
