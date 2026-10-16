/* Phase of the primary agent's current turn. */
export type AgentActivityPhase = "idle" | "thinking" | "working" | "responding";

/* Live state of the primary agent's current turn. */
export interface AgentActivity {
  /* Phase of the turn. */
  phase: AgentActivityPhase;
  /* Thinking text streamed so far. */
  thinking: string;
  /* Whether the provider redacted the thinking text. */
  thinkingRedacted: boolean;
  /* Response text streamed so far. */
  response: string;
  /* Time of the latest change, in milliseconds since the epoch. */
  updatedAt: number;
}

/* Fields to change on the primary agent's live state. */
export interface AgentActivityPatch {
  /* New phase of the turn, when it changes. */
  phase?: AgentActivityPhase;
  /* New thinking text, when it changes. */
  thinking?: string;
  /* New redaction flag, when it changes. */
  thinkingRedacted?: boolean;
  /* New response text, when it changes. */
  response?: string;
  /* Time of the change, defaulting to now. */
  updatedAt?: number;
}

/* Thinking and response text read from one assistant message. */
export interface AssistantActivitySnapshot {
  /* Concatenated thinking text of the message. */
  thinking: string;
  /* Whether any thinking block was redacted. */
  thinkingRedacted: boolean;
  /* Concatenated response text of the message. */
  response: string;
  /* Whether the message requests a tool call. */
  hasToolCall: boolean;
}
