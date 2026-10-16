/* Phase of the primary agent's current turn. */
export type AgentActivityPhase = "idle" | "thinking" | "working" | "responding";

/* Live state of the primary agent's current turn. */
export interface AgentActivity {
  /* Phase of the turn. */
  readonly phase: AgentActivityPhase;
  /* Thinking text streamed so far. */
  readonly thinking: string;
  /* Whether the provider redacted the thinking text. */
  readonly thinkingRedacted: boolean;
  /* Response text streamed so far. */
  readonly response: string;
  /* Time of the latest change, in milliseconds since the epoch. */
  readonly updatedAt: number;
}

/* Thinking and response text read from one assistant message. */
export interface AssistantActivitySnapshot {
  /* Concatenated thinking text of the message. */
  readonly thinking: string;
  /* Whether any thinking block was redacted. */
  readonly thinkingRedacted: boolean;
  /* Concatenated response text of the message. */
  readonly response: string;
  /* Whether the message requests a tool call. */
  readonly hasToolCall: boolean;
}
