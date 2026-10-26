import type { SubagentSelection } from "../subagents/subagent-selection.interface.ts";

/** Lines and clamped state produced by drawing the subagents page. */
export interface SubagentsPageResult {
  /** Lines of the page. */
  readonly lines: readonly string[];
  /** Selected subagent task after clamping. */
  readonly selection: SubagentSelection;
  /** First visible subagent row after clamping. */
  readonly scroll: number;
}
