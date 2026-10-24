/** Thinking and response text read from one assistant message. */
export interface AssistantActivitySnapshot {
  /** Concatenated thinking text of the message. */
  readonly thinking: string;
  /** Whether any thinking block was redacted. */
  readonly thinkingRedacted: boolean;
  /** Concatenated response text of the message. */
  readonly response: string;
  /** Whether the message requests a tool call. */
  readonly hasToolCall: boolean;
}
