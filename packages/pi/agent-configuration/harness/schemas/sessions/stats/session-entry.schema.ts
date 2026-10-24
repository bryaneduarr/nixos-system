import { Type } from "typebox";

export const ToolCallBlockSchema = Type.Object({
  /** Marks a tool call block. */
  type: Type.Literal("toolCall"),
  /** Name of the called tool. */
  name: Type.String(),
  /** Arguments the model sent. */
  arguments: Type.Record(Type.String(), Type.Unknown()),
});

export const AssistantEntrySchema = Type.Object({
  /** Marks a message entry. */
  type: Type.Literal("message"),
  /** Assistant message with usage and content. */
  message: Type.Object({
    /** Marks an assistant message. */
    role: Type.Literal("assistant"),
    /** Provider that served the turn. */
    provider: Type.String(),
    /** Model that served the turn. */
    model: Type.String(),
    /** Token usage and cost of the turn. */
    usage: Type.Object({
      /** Uncached prompt tokens. */
      input: Type.Number(),
      /** Prompt tokens read from cache. */
      cacheRead: Type.Number(),
      /** Prompt tokens written to cache. */
      cacheWrite: Type.Number(),
      /** Cost of the turn. */
      cost: Type.Object({
        /** Total cost in dollars. */
        total: Type.Number(),
      }),
    }),
    /** Content blocks of the message. */
    content: Type.Array(Type.Unknown()),
  }),
});

export const ToolResultEntrySchema = Type.Object({
  /** Marks a message entry. */
  type: Type.Literal("message"),
  /** Tool result message. */
  message: Type.Object({
    /** Marks a tool result. */
    role: Type.Literal("toolResult"),
    /** Whether the tool reported an error. */
    isError: Type.Boolean(),
  }),
});

export const CompactionEntrySchema = Type.Object({
  /** Marks a compaction entry. */
  type: Type.Literal("compaction"),
});
