import type { AgentActivityPhase } from "./agent-activity-phase.interface.ts";

/** Live state of the primary agent's current turn. */
export interface AgentActivity {
  /** Phase of the turn. */
  readonly phase: AgentActivityPhase;
  /** Thinking text streamed so far. */
  readonly thinking: string;
  /** Whether the provider redacted the thinking text. */
  readonly thinkingRedacted: boolean;
  /** Response text streamed so far. */
  readonly response: string;
  /** Time of the latest change, in milliseconds since the epoch. */
  readonly updatedAt: number;
}
