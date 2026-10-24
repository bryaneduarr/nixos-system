import type { AssistantActivitySnapshot } from "./agent-activity.interface.ts";
import type { ToolActivityUsage } from "./tool-activity-usage.interface.ts";

/** Fields that record the final reply and token usage of one finished assistant message. */
export interface RecordAssistantTurnInput {
  /** Suffix that keeps the identifiers of the recorded entries unique. */
  readonly idSuffix: string;
  /** Thinking and response text read from the message. */
  readonly snapshot: AssistantActivitySnapshot;
  /** Token usage the provider reported for the message. */
  readonly usage: ToolActivityUsage;
  /** Whether the message ended with an API error. */
  readonly hasApiError: boolean;
  /** Working directory the message ran in. */
  readonly cwd: string;
  /** Time the message started, in milliseconds since the epoch. */
  readonly startedAt: number;
  /** Time the message ended, in milliseconds since the epoch. */
  readonly endedAt: number;
}
