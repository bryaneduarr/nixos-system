import type { ToolResultFields } from "./tool-result-fields.interface.ts";

/** Text and parsed fields extracted from a tool renderer payload. */
export interface RendererResult {
  /** Model-visible text of the payload. */
  readonly text: string;
  /** Fields parsed from the raw details the tool attached to the payload. */
  readonly fields: ToolResultFields;
  /** Whether the raw details describe a task that failed or was cancelled. */
  readonly taskFailed: boolean;
}
