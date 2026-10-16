import type { ActivityStatus } from "./activity-status.interface.ts";
import type { ToolResultFields } from "./tool-result-fields.interface.ts";

/** Fields that complete a tool call. */
export interface ActivityFinishPatch extends ToolResultFields {
  /** Final result text. */
  readonly text: string;
  /** Final lifecycle state. */
  readonly status: ActivityStatus;
  /** End time of the call, in milliseconds since the epoch. */
  readonly endedAt: number;
}
