import type { SubagentUsage } from "./subagent-usage.interface.ts";

/** Usage reported by a delegated worker. */
interface ReportedUsage {
  /** Marks that the worker reported usage. */
  readonly usageState: "reported";
  /** Token and cost totals of the run. */
  readonly usage: SubagentUsage;
}

/** The worker has not reported usage. */
interface UnreportedUsage {
  /** Marks that no usage was reported. */
  readonly usageState: "unreported";
}

/** Usage of a delegated worker, present only when the worker reported it. */
export type ToolActivityUsage = ReportedUsage | UnreportedUsage;
