import type { Theme } from "@earendil-works/pi-coding-agent";

/** Inputs for the header line that shows agent activity and the tool call count. */
export interface ActivityHeaderOptions {
  /** Theme used for colors. */
  readonly theme: Theme;
  /** Width of the header in columns. */
  readonly width: number;
  /** Number of tool calls recorded. */
  readonly totalCalls: number;
  /** Whether the agent is working. */
  readonly active: boolean;
}
