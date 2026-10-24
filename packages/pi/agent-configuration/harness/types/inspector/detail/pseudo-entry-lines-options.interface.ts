import type { ToolActivity } from "../../activity/store/tool-activity.interface.ts";
import type { PseudoEntryTool } from "./pseudo-entry-tool.interface.ts";

/** Inputs for building the detail lines of an entry that is not a tool call. */
export interface PseudoEntryLinesOptions {
  /** Kind of entry whose detail is built. */
  readonly tool: PseudoEntryTool;
  /** Entry whose detail is built. */
  readonly entry: ToolActivity;
  /** Epoch milliseconds when the entry started. */
  readonly startedAt: number;
  /** Start time and duration text shown in the section heading. */
  readonly timing: string;
  /** Text of the entry, or the loaded artifact text. */
  readonly rawText: string;
  /** Width available for wrapped boxes. */
  readonly width: number;
}
