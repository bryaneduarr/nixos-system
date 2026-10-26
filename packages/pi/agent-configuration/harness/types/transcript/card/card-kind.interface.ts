/** Card that the transcript or the prompt area draws around its content. */
export type CardKind = "user" | "agent" | "input" | "thinking";

/** Card around a message that the transcript renders. */
export type MessageCardKind = Exclude<CardKind, "input">;
