import type { HarnessTool } from "../../tools/active-tools/harness-tool.interface.ts";

/** What decides the visual state of one harness tool result. */
export interface ResultVisualStateInput {
  /** Harness tool that was called. */
  readonly tool: HarnessTool;
  /** Text of the tool result. */
  readonly text: string;
  /** Whether the result is still streaming. */
  readonly isPartial: boolean;
  /** Whether the tool call reported an error. */
  readonly isError: boolean;
}
