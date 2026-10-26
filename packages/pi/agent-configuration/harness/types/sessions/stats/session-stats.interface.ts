import type { ModelStats } from "./model-stats.interface.ts";

/** Usage across the sessions modified within the scanned period. */
export interface SessionStats {
  /** Session files scanned. */
  readonly sessions: number;
  /** Compactions recorded in those sessions. */
  readonly compactions: number;
  /** Usage by provider/model. */
  readonly models: ReadonlyMap<string, ModelStats>;
  /** Tool calls by tool name. */
  readonly tools: ReadonlyMap<string, number>;
}
