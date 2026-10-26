import type { HarnessTool } from "../../tools/active-tools/harness-tool.interface.ts";
import type { HarnessVisualState } from "./harness-presentation.interface.ts";

/** What describes one finished or running harness tool call. */
export interface ResultPresentationInput {
  /** Harness tool that was called. */
  readonly tool: HarnessTool;
  /** Arguments of the tool call. */
  readonly args: Record<string, unknown>;
  /** Text of the tool result; empty while it runs. */
  readonly text: string;
  /** Visual state of the call. */
  readonly state: HarnessVisualState;
}
