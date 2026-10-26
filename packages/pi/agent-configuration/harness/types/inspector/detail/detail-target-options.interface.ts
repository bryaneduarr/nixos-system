import type { ThemeColor } from "@earendil-works/pi-coding-agent";

/** Inputs for the target line of a detail pane. */
export interface DetailTargetOptions {
  /** Tool name of the selected call. */
  readonly tool: string;
  /** Arguments of the selected call. */
  readonly args: Record<string, unknown>;
  /** Whether the selected call is a child call of a subagent task. */
  readonly isChildCall: boolean;
  /** Color applied to the target line. */
  readonly color: ThemeColor;
}
